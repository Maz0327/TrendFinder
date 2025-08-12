import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@shared/database.types";

type UserFeed = Database["public"]["Tables"]["user_feeds"]["Row"];
type InsertUserFeed = Database["public"]["Tables"]["user_feeds"]["Insert"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type InsertProject = Database["public"]["Tables"]["projects"]["Insert"];

export async function listProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Project[];
}

export async function createProject(input: Omit<InsertProject, "user_id">) {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!user) throw new Error("Not authenticated");

  const payload: InsertProject = {
    user_id: user.id,
    name: input.name,
    description: input.description ?? null,
  };

  const { data, error } = await supabase.from("projects").insert(payload).select("*").single();
  if (error) throw error;
  return data as Project;
}

export async function listUserFeeds(projectId?: string | null) {
  let query = supabase.from("user_feeds").select("*").order("created_at", { ascending: false });
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return data as UserFeed[];
}

export async function createUserFeed(input: Omit<InsertUserFeed, "user_id">) {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!user) throw new Error("Not authenticated");

  const payload: InsertUserFeed = {
    user_id: user.id,
    feed_url: input.feed_url,
    title: input.title ?? null,
    project_id: input.project_id ?? null,
    is_active: input.is_active ?? true,
  };

  const { data, error } = await supabase.from("user_feeds").insert(payload).select("*").single();
  if (error) throw error;
  return data as UserFeed;
}

export async function toggleUserFeedActive(id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from("user_feeds")
    .update({ is_active: isActive })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as UserFeed;
}

export async function deleteUserFeed(id: string) {
  const { error } = await supabase.from("user_feeds").delete().eq("id", id);
  if (error) throw error;
}