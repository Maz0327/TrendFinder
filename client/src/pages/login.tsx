// client/src/pages/login.tsx
import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Link, useLocation } from 'wouter';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const onLogin = async () => {
    setBusy(true);
    setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setErr(error.message);
    } else {
      setLocation('/captures-inbox');
    }
  };

  const signInWithGoogle = async () => {
    const baseUrl =
      (import.meta as any).env?.VITE_SITE_URL || window.location.origin;

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
        // optional but useful if we ever need Drive/Slides scopes in future
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });
  };

  const onGoogle = async () => {
    setBusy(true);
    setErr('');
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setErr(error.message);
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-100">
      <div className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="mb-4 text-xl font-semibold">Sign in</h1>
        {err && <div className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 p-2 text-sm text-red-300">{err}</div>}
        <div className="space-y-3">
          <input
            type="email"
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="email@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={onLogin}
            disabled={busy}
            className="w-full rounded-md bg-zinc-700 px-3 py-2 text-sm hover:bg-zinc-600 disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <button
            onClick={onGoogle}
            className="w-full rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800"
          >
            Continue with Google
          </button>
        </div>
        <div className="mt-4 text-sm text-zinc-400">
          No account?{' '}
          <Link href="/register" className="text-zinc-200 underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}