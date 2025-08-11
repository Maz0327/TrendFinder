import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/types/supabase";

type MomentRow = Database["public"]["Tables"]["cultural_moments"]["Row"];
type MomentInsert = Database["public"]["Tables"]["cultural_moments"]["Insert"];

export function useMoments() {
  const [data, setData] = useState<MomentRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const fetchMoments = useCallback(async () => {
    setLoading(true); setError(null);
    const { data: rows, error: err } = await supabase
      .from("cultural_moments")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) setError(err.message);
    setData(rows ?? null);
    setLoading(false);
  }, []);

  const insertDummy = useCallback(async () => {
    setLoading(true); setError(null);

    const payload: MomentInsert = {
      title: "Test Cultural Moment",
      description: "A tiny smoke-test moment",
      intensity: 3,
      platforms: ["tiktok", "instagram"],
      demographics: ["Gen Z", "Millennials"],
      duration: "fleeting",
    };

    const { data: row, error: err } = await supabase
      .from("cultural_moments")
      .insert(payload)
      .select("*")
      .single();

    if (err) setError(err.message);
    setLoading(false);
    return row ?? null;
  }, []);

  useEffect(() => { fetchMoments(); }, [fetchMoments]);

  return { data, loading, error, fetchMoments, insertDummy };
}