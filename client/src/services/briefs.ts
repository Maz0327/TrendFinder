import { apiGet, apiSend } from "./http";
import type { Database } from "@shared/database.types";

type Brief = Database["public"]["Tables"]["dsd_briefs"]["Row"];
type BriefInsert = Database["public"]["Tables"]["dsd_briefs"]["Insert"];
type BriefUpdate = Database["public"]["Tables"]["dsd_briefs"]["Update"];

export async function listBriefs(params?: { projectId?: string }) {
  const q = params?.projectId ? `?projectId=${encodeURIComponent(params.projectId)}` : "";
  return apiGet<Brief[]>(`/briefs${q}`);
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