import { useState } from "react";
import { supabase } from "../../../client/src/lib/supabaseClient";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  async function handleMagicLink() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ 
      email, 
      options: { 
        emailRedirectTo: window.location.origin + "/app-v2/captures-inbox" 
      } 
    });
    setLoading(false);
    if (error) alert(error.message);
    else alert("Check your email for a login link.");
  }

  async function handlePassword() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password: pwd 
    });
    setLoading(false);
    if (error) alert(error.message);
    else navigate("/app-v2/captures-inbox");
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm glass-card p-6 rounded-2xl">
        <h1 className="text-xl font-semibold mb-4">Sign in</h1>
        <div className="space-y-3">
          <input 
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="you@example.com" 
            type="email" 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
          />
          <input 
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Password (optional)" 
            type="password" 
            value={pwd} 
            onChange={e=>setPwd(e.target.value)} 
          />
          <div className="flex gap-2">
            <button 
              className="flex-1 py-2 px-4 bg-accent text-white rounded-md hover:bg-accent/90 transition disabled:opacity-50"
              disabled={loading || !email} 
              onClick={handleMagicLink}
            >
              Magic link
            </button>
            <button 
              className="flex-1 py-2 px-4 bg-card border border-border text-foreground rounded-md hover:bg-card/80 transition disabled:opacity-50"
              disabled={loading || !email || !pwd} 
              onClick={handlePassword}
            >
              Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}