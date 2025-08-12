import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useSupabaseUser() {
  const [user, setUser] = useState<Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] | null>(null);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => mounted && setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => setUser(sess?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { user };
}
