import type { CaptureRow } from "@shared/database.types";
import { getClient } from "../lib/supabase";

export type CaptureFilters = {
  projectId?: string;
  q?: string;
};

export async function listCaptures(filters: CaptureFilters): Promise<CaptureRow[]> {
  const client = getClient();
  let query = client.from("captures").select("*").order("created_at", { ascending: false }).limit(50);
  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  const { data, error } = await query;
  if (error) throw error;
  const rows = (data as CaptureRow[]) ?? [];
  if (filters.q) {
    const q = filters.q.toLowerCase();
    return rows.filter((r) => (r.title ?? "").toLowerCase().includes(q));
  }
  return rows;
}

export async function updateCapture(id: string, patch: Partial<CaptureRow>): Promise<CaptureRow> {
  const client = getClient();
  const { data, error } = await client.from("captures").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data as CaptureRow;
}
