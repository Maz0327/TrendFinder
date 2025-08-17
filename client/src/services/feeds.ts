import { api } from "./api";
import type { Database } from "@shared/database.types";

type UserFeed = Database["public"]["Tables"]["user_feeds"]["Row"];
type UserFeedInsert = Database["public"]["Tables"]["user_feeds"]["Insert"];
type UserFeedUpdate = Database["public"]["Tables"]["user_feeds"]["Update"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];

// User feeds functions - updated for new comprehensive API  
export async function listUserFeeds(params?: { projectId?: string }) {
  return api.get<UserFeed[]>("/feeds", params); // Feeds API returns simple array, not paginated
}

export async function createUserFeed(payload: Omit<UserFeedInsert, "user_id">) {
  return api.post<UserFeed>("/feeds", payload);
}

export async function toggleUserFeedActive(id: string) {
  // Updated to use new toggle endpoint that flips the current state
  return api.patch<UserFeed>(`/feeds/${id}/toggle`);
}

export async function deleteUserFeed(id: string) {
  return api.delete<{ id: string }>(`/feeds/${id}`);
}

// Project functions (for backward compatibility)
export async function listProjects() {
  return api.get<Project[]>("/projects");
}

export async function createProject(payload: Omit<ProjectInsert, "user_id">) {
  return api.post<Project>("/projects", payload);
}