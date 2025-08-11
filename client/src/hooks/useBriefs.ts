import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/supabase.generated";

type BriefRow = Database["public"]["Tables"]["dsd_briefs"]["Row"];
type BriefInsert = Database["public"]["Tables"]["dsd_briefs"]["Insert"];

export function useBriefs() {
  const [data, setData] = useState<BriefRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const fetchBriefs = useCallback(async () => {
    setLoading(true); setError(null);
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      setLoading(false);
      setError("Not authenticated");
      setData(null);
      return;
    }
    const userId = session.session.user.id;

    const { data: rows, error: err } = await supabase
      .from("dsd_briefs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (err) setError(err.message);
    setData(rows ?? null);
    setLoading(false);
  }, []);

  const insertDummy = useCallback(async () => {
    setLoading(true); setError(null);
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      setLoading(false);
      setError("Not authenticated");
      return null;
    }
    const userId = session.session.user.id;

    const payload: BriefInsert = {
      user_id: userId,
      title: "Test DSD Brief",
      status: "draft",
      define_section: { bullets: ["who, what, why"] },
      shift_section: { directions: ["reframe X as Y"] },
      deliver_section: { outputs: ["IG reels concept", "post copy"] },
    };

    const { data: row, error: err } = await supabase
      .from("dsd_briefs")
      .insert(payload)
      .select("*")
      .single();

    if (err) setError(err.message);
    setLoading(false);
    return row ?? null;
  }, []);

  useEffect(() => { fetchBriefs(); }, [fetchBriefs]);

  return { data, loading, error, fetchBriefs, insertDummy };
}