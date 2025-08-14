import { api, PaginatedResponse } from "./api";
import type { Database } from "@shared/database.types";

type Brief = Database["public"]["Tables"]["dsd_briefs"]["Row"];
type BriefInsert = Database["public"]["Tables"]["dsd_briefs"]["Insert"];
type BriefUpdate = Database["public"]["Tables"]["dsd_briefs"]["Update"];

export async function listBriefs(params?: { 
  projectId?: string; 
  q?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
}) {
  const response = await api.get<PaginatedResponse<Brief>>("/briefs", params);
  return { items: response.rows, total: response.total, page: response.page, pageSize: response.pageSize };
}

export async function createBrief(payload: Omit<BriefInsert, "user_id">) {
  return api.post<Brief>("/briefs", payload);
}

export async function updateBrief(id: string, payload: BriefUpdate) {
  return api.patch<Brief>(`/briefs/${id}`, payload);
}

export async function getBriefWithDetails(id: string) {
  return api.get<Brief>(`/briefs/${id}`);
}

export async function updateBriefTags(id: string, tags: string[]) {
  return api.patch<Brief>(`/briefs/${id}`, { tags });
}

export async function deleteBrief(id: string) {
  return api.delete<{ id: string }>(`/briefs/${id}`);
}

// Google Slides export function
export async function exportBriefToSlides(briefId: string, options?: { templateId?: string }) {
  return api.post<{ slideUrl: string; exportId: string }>(`/briefs/${briefId}/export-slides`, options);
}