import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabaseClient';

function getHashParam(name: string) {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  return hash.get(name);
}

export default function AuthCallback() {
  const [, navigate] = useLocation();

  useEffect(() => {
    let timeout: number;

    (async () => {
      try {
        // Case A: PKCE / code in query string
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          history.replaceState(null, '', url.pathname);
          if (error) throw error;
          timeout = window.setTimeout(() => navigate('/', { replace: true }), 50);
          return;
        }

        // Case B: Implicit flow / tokens in hash
        const access_token = getHashParam('access_token');
        const refresh_token = getHashParam('refresh_token');

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          history.replaceState(null, '', window.location.pathname);
          if (error) throw error;
          timeout = window.setTimeout(() => navigate('/', { replace: true }), 50);
          return;
        }

        // Fallback: let supabase pick up anything it can
        await supabase.auth.getSession();
        if (window.location.hash) {
          history.replaceState(null, '', window.location.pathname);
        }
        timeout = window.setTimeout(() => navigate('/', { replace: true }), 50);
      } catch {
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