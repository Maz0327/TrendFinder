import { useState } from "react";
import { getClient } from "../../services/supabase";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const client = getClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { error } = await client.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else window.location.href = redirectUrl;
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground">
      <form onSubmit={onSubmit} className="w-full max-w-sm border rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <input className="w-full px-3 py-2 rounded bg-muted" placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full px-3 py-2 rounded bg-muted" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
        <div className="flex items-center justify-between text-sm">
          <a href="/register" className="text-primary">Create account</a>
          <a href="/forgot" className="text-primary">Forgot password</a>
        </div>
      </form>
    </div>
  );
}
