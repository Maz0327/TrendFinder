import type { Capture } from "@shared/supabase-schema";
import { supabase } from "../../client/src/lib/supabaseClient";

export type CaptureFilters = {
  projectId?: string;
  q?: string;
};

export async function listCaptures(filters: CaptureFilters): Promise<Capture[]> {
  let query = supabase.from("captures").select("*").order("created_at", { ascending: false }).limit(50);
  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  const { data, error } = await query;
  if (error) throw error;
  const rows = (data as Capture[]) ?? [];
  if (filters.q) {
    const q = filters.q.toLowerCase();
    return rows.filter((r) => (r.title ?? "").toLowerCase().includes(q));
  }
  return rows;
}

export async function updateCapture(id: string, patch: Partial<Capture>): Promise<Capture> {
  const { data, error } = await supabase.from("captures").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data as Capture;
}
