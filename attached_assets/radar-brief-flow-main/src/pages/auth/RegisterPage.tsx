import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-foreground p-4">
        <Card className="w-full max-w-sm p-6 text-center">
          <h1 className="text-xl font-semibold mb-4">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-4">
            We've sent you a confirmation link. Click it to activate your account.
          </p>
          <Link to="/login" className="text-primary hover:underline">Back to login</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-4">
      <Card className="w-full max-w-sm p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <h1 className="text-xl font-semibold text-center">Create account</h1>
          <Input 
            placeholder="Email" 
            type="email" 
            value={email} 
            onChange={(e)=>setEmail(e.target.value)} 
            required
            aria-label="Email address"
          />
          <Input 
            placeholder="Password" 
            type="password" 
            value={password} 
            onChange={(e)=>setPassword(e.target.value)} 
            required
            aria-label="Password"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            <Link to="/forgot" className="text-primary hover:underline">Forgot password</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}