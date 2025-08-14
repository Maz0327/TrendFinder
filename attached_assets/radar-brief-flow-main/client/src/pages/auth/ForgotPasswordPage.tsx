import { useState } from "react";
import { getClient } from "../../services/supabase";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const client = getClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const redirectUrl = `${window.location.origin}/login`;
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground">
      <form onSubmit={onSubmit} className="w-full max-w-sm border rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-semibold">Reset password</h1>
        <input className="w-full px-3 py-2 rounded bg-muted" placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {sent && <p className="text-sm text-emerald-500">Check your email for a reset link.</p>}
        <Button type="submit" className="w-full">Send reset link</Button>
        <div className="flex items-center justify-between text-sm">
          <a href="/login" className="text-primary">Back to login</a>
          <a href="/register" className="text-primary">Create account</a>
        </div>
      </form>
    </div>
  );
}
