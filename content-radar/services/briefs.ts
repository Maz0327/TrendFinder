import type { BriefRow, Json } from "@shared/database.types";
import { supabase } from "../../client/src/lib/supabaseClient";

export async function listBriefs(projectId?: string): Promise<BriefRow[]> {
  let query = supabase.from("dsd_briefs").select("*").order("updated_at", { ascending: false }).limit(50);
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return (data as BriefRow[]) ?? [];
}

export async function getBrief(id: string): Promise<BriefRow> {
  const { data, error } = await supabase.from("dsd_briefs").select("*").eq("id", id).single();
  if (error) throw error;
  return data as BriefRow;
}

export async function createBrief(input: { title: string; projectId?: string }): Promise<BriefRow> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("dsd_briefs")
    .insert({ title: input.title, project_id: input.projectId ?? null, user_id: user.id })
    .select("*")
    .single();
  if (error) throw error;
  return data as BriefRow;
}

export async function updateBriefSections(id: string, patch: { define_section?: Json; shift_section?: Json; deliver_section?: Json }): Promise<BriefRow> {
  const { data, error } = await supabase
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
