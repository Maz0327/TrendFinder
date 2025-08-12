import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabaseClient";

/**
 * Robust OAuth callback:
 * 1) If session already exists, clean hash and redirect.
 * 2) Else, if tokens are in the URL hash, force-set the session via setSession().
 * 3) Else, wait briefly for Supabase to parse; if still nothing, bounce to /login.
 * In all cases, we clean the URL hash fragment before leaving the page.
 */
export default function AuthCallback() {
  const [, navigate] = useLocation();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const next = new URLSearchParams(window.location.search).get("next") || "/";

    const cleanUrl = () => {
      const clean = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", clean);
    };
    const go = (to: string) => navigate(to, { replace: true });

    // 1) Already have a session? Clean and go.
    supabase.auth.getSession().then(async ({ data }) => {
      if (data?.session) {
        cleanUrl();
        go(next);
        return;
      }

      // 2) Try manual hash fallback (implicit flow tokens in fragment)
      const hash = window.location.hash?.startsWith("#") ? window.location.hash.slice(1) : "";
      const params = new URLSearchParams(hash);
      const error = params.get("error");
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (error) {
        // If provider sent an error, clean and send to login
        console.error("OAuth error:", error, {
          error_code: params.get("error_code"),
          error_description: params.get("error_description"),
        });
        cleanUrl();
        go("/login");
        return;
      }

      if (access_token && refresh_token) {
        try {
          // Force-set session using tokens from hash
          const { data: setData, error: setErr } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (setErr) {
            console.error("setSession error:", setErr);
            cleanUrl();
            go("/login");
            return;
          }
          // Success -> clean & go
          cleanUrl();
          go(next);
          return;
        } catch (e) {
          console.error("setSession exception:", e);
          cleanUrl();
          go("/login");
          return;
        }
      }

      // 3) No session and no tokens in hash; give Supabase a moment to parse automatically.
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          cleanUrl();
          go(next);
        }
      });

      // Failsafe after 1.5s
      setTimeout(async () => {
        const recheck = await supabase.auth.getSession();
        sub.subscription.unsubscribe();
        if (recheck.data.session) {
          cleanUrl();
          go(next);
        } else {
          cleanUrl();
          go("/login");
        }
      }, 1500);
    });
  }, [navigate]);

  return (
    <div className="w-full min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
      Finishing sign-in…
    </div>
  );
}