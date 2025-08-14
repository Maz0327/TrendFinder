import { apiGet, apiSend } from "./http";
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
  const qp = new URLSearchParams();
  if (params?.projectId) qp.set("projectId", params.projectId);
  if (params?.q) qp.set("q", params.q);
  if (params?.tags && params.tags.length > 0) qp.set("tags", params.tags.join(","));
  if (params?.page) qp.set("page", params.page.toString());
  if (params?.pageSize) qp.set("pageSize", params.pageSize.toString());
  
  const q = qp.toString() ? `?${qp.toString()}` : "";
  // Updated to handle new paginated server response format
  const response = await apiGet<{ rows: Brief[]; total: number; page: number; pageSize: number }>(`/briefs${q}`);
  return { items: response.rows, total: response.total, page: response.page, pageSize: response.pageSize };
}

export async function createBrief(payload: Omit<BriefInsert, "user_id">) {
  return apiSend<Brief>("/briefs", "POST", payload);
}

export async function updateBrief(id: string, payload: BriefUpdate) {
  return apiSend<Brief>(`/briefs/${id}`, "PUT", payload);
}

export async function deleteBrief(id: string) {
  return apiSend<{ id: string }>(`/briefs/${id}`, "DELETE");
}

// Google Slides export function
export async function exportBriefToSlides(briefId: string, options?: { templateId?: string }) {
  return apiSend<{ slideUrl: string; exportId: string }>(`/briefs/${briefId}/export-slides`, "POST", options);
}