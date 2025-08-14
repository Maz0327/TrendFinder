import type { MomentRow } from "@shared/database.types";
import { getClient } from "../lib/supabase";

export async function listMoments(filters: { projectId?: string }): Promise<MomentRow[]> {
  const client = getClient();
  let query = client.from("cultural_moments").select("*").order("updated_at", { ascending: false }).limit(50);
  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  const { data, error } = await query;
  if (error) throw error;
  return (data as MomentRow[]) ?? [];
}
