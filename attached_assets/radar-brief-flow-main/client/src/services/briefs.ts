import type { BriefRow } from "@shared/database.types";
import { getClient } from "./supabase";

export async function listBriefs(_projectId?: string): Promise<BriefRow[]> {
  const client = getClient();
  const { data, error } = await client
    .from("dsd_briefs")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data as BriefRow[]) ?? [];
}

export async function getBrief(id: string): Promise<BriefRow> {
  const client = getClient();
  const { data, error } = await client.from("dsd_briefs").select("*").eq("id", id).single();
  if (error) throw error;
  return data as BriefRow;
}

export async function createBrief(input: { title: string; projectId?: string }): Promise<BriefRow> {
  const client = getClient();
  const { data, error } = await client
    .from("dsd_briefs")
    .insert({ title: input.title, project_id: input.projectId ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return data as BriefRow;
}

export async function updateBriefSections(id: string, patch: { define_section?: any; shift_section?: any; deliver_section?: any }): Promise<BriefRow> {
  const client = getClient();
  const { data, error } = await client
    .from("dsd_briefs")
    .update({
      define_section: patch.define_section ?? undefined,
      shift_section: patch.shift_section ?? undefined,
      deliver_section: patch.deliver_section ?? undefined,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as BriefRow;
}
