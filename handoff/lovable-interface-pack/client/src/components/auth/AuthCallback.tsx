import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Simply touching getSession() after redirect gives Supabase a chance
    // to parse the URL fragment `#access_token=...` and persist the session.
    supabase.auth.getSession().finally(() => {
      // Bounce to home (or a stored returnTo)
      navigate('/', { replace: true });
    });
  }, [navigate]);

  return <div className="p-6 text-sm opacity-70">Completing sign-in…</div>;
}