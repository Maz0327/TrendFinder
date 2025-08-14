import type { UserFeedRow } from "@shared/database.types";
import { getClient } from "./supabase";

export async function listUserFeeds(projectId?: string): Promise<UserFeedRow[]> {
  const client = getClient();
  let query = client.from("user_feeds").select("*").order("created_at", { ascending: false });
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw error;
  return (data as UserFeedRow[]) ?? [];
}

export async function createUserFeed(input: { feed_url: string; title?: string; projectId?: string }): Promise<UserFeedRow> {
  const client = getClient();
  const { data, error } = await client
    .from("user_feeds")
    .insert({ feed_url: input.feed_url, title: input.title ?? null, project_id: input.projectId ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return data as UserFeedRow;
}

export async function toggleUserFeedActive(id: string, active: boolean): Promise<UserFeedRow> {
  const client = getClient();
  const { data, error } = await client
    .from("user_feeds")
    .update({ is_active: active })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as UserFeedRow;
}

export async function deleteUserFeed(id: string): Promise<void> {
  const client = getClient();
  const { error } = await client.from("user_feeds").delete().eq("id", id);
  if (error) throw error;
}
