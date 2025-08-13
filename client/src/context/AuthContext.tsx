import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AuthStatus = 'loading' | 'authed' | 'anon';

type AuthContextValue = {
  status: AuthStatus;
  user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] | null;
  session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'] | null;
  signOut: () => ReturnType<typeof supabase.auth.signOut>;
};

const AuthContext = createContext<AuthContextValue>({
  status: 'loading',
  user: null,
  session: null,
  signOut: async () => ({ error: null }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<AuthContextValue['session']>(null);
  const [user, setUser] = useState<AuthContextValue['user']>(null);

  useEffect(() => {
    let mounted = true;

    // 1) Hydrate from current URL fragment or existing storage
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setStatus(data.session ? 'authed' : 'anon');
    });

    // 2) Single global listener
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      setStatus(s ? 'authed' : 'anon');
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    user,
    session,
    signOut: () => supabase.auth.signOut(),
  }), [status, user, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);