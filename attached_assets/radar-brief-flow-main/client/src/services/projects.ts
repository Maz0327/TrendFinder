import type { ProjectRow } from "@shared/database.types";
import { IS_DEMO, getClient } from "./supabase";
import { wait } from "./supabase";

// In-memory demo store
const demoProjects: ProjectRow[] = [
  {
    id: "demo-proj-1",
    user_id: null,
    name: "Demo Project Alpha",
    description: "Sample project for demo mode",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client: null,
    status: null,
  },
];

export async function listProjects(): Promise<ProjectRow[]> {
  if (IS_DEMO) {
    await wait(300);
    return [...demoProjects].sort(
      (a, b) => +new Date(b.created_at) - +new Date(a.created_at)
    );
  }

  const client = getClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  const query = client
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  const { data, error } = user
    ? await query.eq("user_id", user.id)
    : await query;

  if (error) throw error;
  return (data as ProjectRow[]) ?? [];
}

export async function createProject(input: {
  name: string;
  description?: string;
}): Promise<ProjectRow> {
  if (IS_DEMO) {
    await wait(300);
    const row: ProjectRow = {
      id: `demo-${Math.random().toString(36).slice(2, 9)}`,
      user_id: null,
      name: input.name,
      description: input.description ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      client: null,
      status: null,
    };
    demoProjects.unshift(row);
    return row;
  }

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
