import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getClient } from "../services/supabase";

export function useSupabaseUser() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = getClient();

    const { data: listener } = client.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });

    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { session, loading, user: session?.user ?? null } as const;
}
