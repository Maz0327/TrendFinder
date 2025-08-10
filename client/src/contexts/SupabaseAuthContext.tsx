import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import {
  supabase,
  signInWithEmail,
  signUpWithEmail,
  signInWithProvider,
  signOut,
  signInWithMagicLink as supabaseSignInWithMagicLink,
  resetPassword as supabaseResetPassword,
} from '@shared/supabase-client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithGitHub: () => Promise<{ error: any }>;
  signInWithTwitter: () => Promise<{ error: any }>;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { SupabaseAuthProvider };

function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Update localStorage for session persistence
      if (session) {
        localStorage.setItem('supabase-session', JSON.stringify(session));
      } else {
        localStorage.removeItem('supabase-session');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn: async (email: string, password: string) => {
      const result = await signInWithEmail(email, password);
      if (!result.error && result.data?.user) {
        // Migrate existing user data if needed
        await migrateUserData(result.data.user);
      }
      return { error: result.error };
    },
    signUp: async (email: string, password: string, metadata?: any) => {
      return signUpWithEmail(email, password, metadata);
    },
    signInWithGoogle: async () => {
      return signInWithProvider('google');
    },
    signInWithGitHub: async () => {
      return signInWithProvider('github');
    },
    signInWithTwitter: async () => {
      return signInWithProvider('twitter');
    },
    signInWithMagicLink: async (email: string) => {
      return supabaseSignInWithMagicLink(email);
    },
    signOut: async () => {
      return signOut();
    },
    resetPassword: async (email: string) => {
      return supabaseResetPassword(email);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}

// Helper function to migrate existing user data  
async function migrateUserData(user: User | undefined) {
  if (!user) return;

  try {
    // Use auth.users table (Supabase's built-in table) for user data
    // No migration needed - Supabase handles this automatically
    console.log('User authenticated with Supabase:', user.email);
  } catch (error) {
    console.error('Error in user setup:', error);
  }
}