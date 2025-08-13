import type { DsdBrief } from "@shared/supabase-schema";
import type { Json } from "@shared/database.types";
import { supabase } from "../../client/src/lib/supabaseClient";

export async function listBriefs(projectId?: string): Promise<DsdBrief[]> {
  let query = supabase.from("dsd_briefs").select("*").order("updated_at", { ascending: false }).limit(50);
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return (data as DsdBrief[]) ?? [];
}

export async function getBrief(id: string): Promise<DsdBrief> {
  const { data, error } = await supabase.from("dsd_briefs").select("*").eq("id", id).single();
  if (error) throw error;
  return data as DsdBrief;
}

export async function createBrief(input: { title: string; projectId?: string }): Promise<DsdBrief> {
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
  return data as DsdBrief;
}

export async function updateBriefSections(id: string, patch: { defineContent?: Json; shiftContent?: Json; deliverContent?: Json }): Promise<DsdBrief> {
  const client = supabase;
  const { data, error } = await client
    .from("dsd_briefs")
    .update({
      define_content: patch.defineContent ?? undefined,
      shift_content: patch.shiftContent ?? undefined,
      deliver_content: patch.deliverContent ?? undefined,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as DsdBrief;
}
