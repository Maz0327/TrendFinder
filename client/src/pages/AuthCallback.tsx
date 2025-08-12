import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // If we already have a session here, just go home:
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        navigate("/", { replace: true });
      } else {
        // If OAuthBridge already handled, hash will be empty and app's guards will take over.
        navigate("/", { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="w-full min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
      Finishing sign-in…
    </div>
  );
}