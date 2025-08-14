import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const redirectUrl = `${window.location.origin}/login`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
    if (error) setError(error.message);
    else setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-foreground p-4">
        <Card className="w-full max-w-sm p-6 text-center">
          <h1 className="text-xl font-semibold mb-4">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-4">
            We've sent you a password reset link.
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
          <h1 className="text-xl font-semibold text-center">Reset password</h1>
          <Input 
            placeholder="Email" 
            type="email" 
            value={email} 
            onChange={(e)=>setEmail(e.target.value)} 
            required
            aria-label="Email address"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Send reset link</Button>
          <div className="flex items-center justify-between text-sm">
            <Link to="/login" className="text-primary hover:underline">Back to login</Link>
            <Link to="/register" className="text-primary hover:underline">Create account</Link>
          </div>
        </form>
      </Card>
    </div>
  );
}