import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else window.location.href = "/";
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-4">
      <Card className="w-full max-w-sm p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <h1 className="text-xl font-semibold text-center">Sign in</h1>
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
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <Link to="/register" className="text-primary hover:underline">Create account</Link>
            <Link to="/forgot" className="text-primary hover:underline">Forgot password</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}