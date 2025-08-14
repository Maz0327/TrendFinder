import type { MomentRow } from "@shared/database.types";
import { getClient } from "./supabase";

export async function listMoments(_filters: { projectId?: string; from?: string; to?: string; platform?: string }): Promise<MomentRow[]> {
  const client = getClient();
  const { data, error } = await client
    .from("cultural_moments")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data as MomentRow[]) ?? [];
}

export async function pinMomentToBrief(_momentId: string, _briefId: string, _section: "define"|"shift"|"deliver"): Promise<void> {
  // Implement in Pass B
  return;
}
