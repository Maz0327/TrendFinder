import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate('/', { replace: true });
    });

    // Safety timeout in case the event is slow
    const t = setTimeout(() => navigate('/', { replace: true }), 1500);

    return () => {
      data.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, [navigate]);

  return (
    <div className="p-6 text-sm text-muted-foreground">
      Finishing Google sign-in…
    </div>
  );
}