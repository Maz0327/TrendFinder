import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/supabase.generated";

type CaptureRow = Database["public"]["Tables"]["captures"]["Row"];
type CaptureInsert = Database["public"]["Tables"]["captures"]["Insert"];

export function useCaptures() {
  const [data, setData] = useState<CaptureRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const fetchCaptures = useCallback(async () => {
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
      .from("captures")
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

    const payload: CaptureInsert = {
      user_id: userId,
      title: "Test Capture",
      content: "This is a smoke-test capture",
      platform: "web",
      tags: ["test", "smoke"],
      dsd_tags: ["define"],
      predicted_virality: 0.42,
      actual_virality: 0,
    };

    const { data: rows, error: err } = await supabase
      .from("captures")
      .insert(payload)
      .select("*")
      .single();

    if (err) setError(err.message);
    setLoading(false);
    return rows ?? null;
  }, []);

  useEffect(() => { fetchCaptures(); }, [fetchCaptures]);

  return { data, loading, error, fetchCaptures, insertDummy };
}