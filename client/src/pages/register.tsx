// client/src/pages/register.tsx
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Link, useLocation } from 'wouter';

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const onRegister = async () => {
    setBusy(true);
    setErr('');
    const { error } = await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) setErr(error.message);
    else setLocation('/captures-inbox');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-100">
      <div className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="mb-4 text-xl font-semibold">Create account</h1>
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
            onClick={onRegister}
            disabled={busy}
            className="w-full rounded-md bg-zinc-700 px-3 py-2 text-sm hover:bg-zinc-600 disabled:opacity-50"
          >
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </div>
        <div className="mt-4 text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/login">
            <a className="text-zinc-200 underline">
              Sign in
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}