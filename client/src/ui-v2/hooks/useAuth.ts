import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { api, IS_MOCK_MODE } from "../lib/api";

interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isSigningOut: boolean;
  getSignInUrl: () => string;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

function token() {
  try { return localStorage.getItem("sb-access-token"); } catch { return null; }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isAuthenticated = !!token();

  const getSignInUrl = useCallback(() => {
    if (IS_MOCK_MODE) return "/auth/mock-login";
    // For Google OAuth, redirect to server endpoint that handles Supabase auth
    return "/api/auth/google/start"; 
  }, []);

  const signOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      try { await api.post("/auth/logout"); } catch { /* ignore */ }
      localStorage.removeItem("sb-access-token");
      location.assign("/"); // force reload to clear state
    } finally {
      setIsSigningOut(false);
    }
  }, []);

  const user: AuthUser | null = isAuthenticated 
    ? { id: "test", email: "test@example.com", name: "Test User" }
    : null;

  const value = useMemo<AuthCtx>(() => ({
    user, loading: false, isAuthenticated, isSigningOut, getSignInUrl, signOut
  }), [user, isAuthenticated, isSigningOut, getSignInUrl, signOut]);

  return React.createElement(Ctx.Provider, { value }, children);
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}