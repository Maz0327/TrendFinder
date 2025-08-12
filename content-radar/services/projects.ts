import type { ProjectRow } from "@shared/database.types";
import { getClient } from "../lib/supabase";

export async function listProjects(): Promise<ProjectRow[]> {
  const client = getClient();
  const { data, error } = await client
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ProjectRow[]) ?? [];
}

export async function createProject(input: { name: string; description?: string }): Promise<ProjectRow> {
  const client = getClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await client
    .from("projects")
    .insert({
      name: input.name,
      description: input.description ?? null,
      user_id: user.id,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as ProjectRow;
}
