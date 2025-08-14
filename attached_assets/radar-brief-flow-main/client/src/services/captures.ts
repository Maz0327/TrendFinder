import type { CaptureRow } from "@shared/database.types";
import { getClient } from "./supabase";

export type CaptureFilters = {
  projectId?: string;
  platform?: string;
  tags?: string[];
  q?: string;
  from?: string;
  to?: string;
  minScore?: number;
  maxScore?: number;
};

export async function listCaptures(_filters: CaptureFilters): Promise<CaptureRow[]> {
  const client = getClient();
  const { data, error } = await client
    .from("captures")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data as CaptureRow[]) ?? [];
}

export async function getCapture(id: string): Promise<CaptureRow> {
  const client = getClient();
  const { data, error } = await client.from("captures").select("*").eq("id", id).single();
  if (error) throw error;
  return data as CaptureRow;
}

export async function updateCapture(id: string, patch: Partial<CaptureRow>): Promise<CaptureRow> {
  const client = getClient();
  const { data, error } = await client.from("captures").update(patch).eq("id", id).select("*").single();
  if (error) throw error;
  return data as CaptureRow;
}
