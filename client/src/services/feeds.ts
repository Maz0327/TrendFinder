import { apiGet, apiSend } from "./http";
import type { Database } from "@shared/database.types";

type UserFeed = Database["public"]["Tables"]["user_feeds"]["Row"];
type UserFeedInsert = Database["public"]["Tables"]["user_feeds"]["Insert"];
type UserFeedUpdate = Database["public"]["Tables"]["user_feeds"]["Update"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];

// User feeds functions - updated for new comprehensive API  
export async function listUserFeeds(params?: { projectId?: string }) {
  const q = params?.projectId ? `?projectId=${encodeURIComponent(params.projectId)}` : "";
  return apiGet<UserFeed[]>(`/feeds${q}`); // Feeds API returns simple array, not paginated
}

export async function createUserFeed(payload: UserFeedInsert) {
  return apiSend<UserFeed>("/feeds", "POST", payload);
}

export async function toggleUserFeedActive(id: string) {
  // Updated to use new toggle endpoint that flips the current state
  return apiSend<UserFeed>(`/feeds/${id}/toggle`, "PATCH");
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