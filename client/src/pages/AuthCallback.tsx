import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const [, navigate] = useLocation();

  useEffect(() => {
    let timeout: number;

    (async () => {
      // 1) This triggers supabase-js to parse the hash and persist the session
      const { data, error } = await supabase.auth.getSession();

      // 2) Clean the hash from the URL (security & aesthetics)
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname);
      }

      // 3) Navigate the user
      if (!error && data?.session) {
        // You can redirect to a stored "returnTo" if you keep one, or default dashboard
        timeout = window.setTimeout(() => navigate('/', { replace: true }), 50);
      } else {
        // If something failed, send back to login
        timeout = window.setTimeout(() => navigate('/login', { replace: true }), 50);
      }
    })();

    return () => window.clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">
      Finishing sign-in…
    </div>
  );
}