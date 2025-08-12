import type { MomentRow } from "@shared/database.types";
import { supabase } from "../../client/src/lib/supabaseClient";

export async function listMoments(filters: { projectId?: string }): Promise<MomentRow[]> {
  let query = supabase.from("cultural_moments").select("*").order("updated_at", { ascending: false }).limit(50);
  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  const { data, error } = await query;
  if (error) throw error;
  return (data as MomentRow[]) ?? [];
}
