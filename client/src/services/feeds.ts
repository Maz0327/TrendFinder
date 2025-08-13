import { apiGet, apiSend } from "./http";
import type { Database } from "@shared/database.types";

type UserFeed = Database["public"]["Tables"]["user_feeds"]["Row"];
type UserFeedInsert = Database["public"]["Tables"]["user_feeds"]["Insert"];
type UserFeedUpdate = Database["public"]["Tables"]["user_feeds"]["Update"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];

// User feeds functions
export async function listUserFeeds(params?: { projectId?: string }) {
  const q = params?.projectId ? `?projectId=${encodeURIComponent(params.projectId)}` : "";
  return apiGet<UserFeed[]>(`/feeds${q}`);
}

export async function createUserFeed(payload: UserFeedInsert) {
  return apiSend<UserFeed>("/feeds", "POST", payload);
}

export async function toggleUserFeedActive(id: string, is_active: boolean) {
  return apiSend<UserFeed>(`/feeds/${id}`, "PATCH", { is_active });
}

export async function deleteUserFeed(id: string) {
  return apiSend<{ id: string }>(`/feeds/${id}`, "DELETE");
}

// Project functions (for backward compatibility)
export async function listProjects() {
  return apiGet<Project[]>("/projects");
}

export async function createProject(payload: Omit<ProjectInsert, "user_id">) {
  return apiSend<Project>("/projects", "POST", payload);
}