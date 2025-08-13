import type { Project } from "@shared/supabase-schema";
import { supabase } from "../../client/src/lib/supabaseClient";

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Project[]) ?? [];
}

export async function createProject(input: { name: string; description?: string }): Promise<Project> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: input.name,
      description: input.description ?? null,
      user_id: user.id,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Project;
}
