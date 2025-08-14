import { apiGet, apiSend } from "./http";
import type { Database } from "@shared/database.types";

type Capture = Database["public"]["Tables"]["captures"]["Row"];
type CaptureInsert = Database["public"]["Tables"]["captures"]["Insert"];
type CaptureUpdate = Database["public"]["Tables"]["captures"]["Update"];

export async function listCaptures(params?: {
  projectId?: string;
  platform?: string;
  q?: string; // renamed from 'search' to match server API
  tags?: string[]; // enhanced to support multiple tags
  page?: number;
  pageSize?: number;
}) {
  const qp = new URLSearchParams();
  if (params?.projectId) qp.set("projectId", params.projectId);
  if (params?.platform) qp.set("platform", params.platform);
  if (params?.q) qp.set("q", params.q);
  if (params?.tags && params.tags.length > 0) qp.set("tags", params.tags.join(","));
  if (params?.page) qp.set("page", params.page.toString());
  if (params?.pageSize) qp.set("pageSize", params.pageSize.toString());
  
  const q = qp.toString() ? `?${qp.toString()}` : "";
  // Updated to handle new server response format: { rows, total, page, pageSize }
  const response = await apiGet<{ rows: Capture[]; total: number; page: number; pageSize: number }>(`/captures${q}`);
  return { items: response.rows, total: response.total, page: response.page, pageSize: response.pageSize };
}

export async function createCapture(payload: Omit<CaptureInsert, "user_id">) {
  return apiSend<Capture>("/captures", "POST", payload);
}

export async function updateCapture(id: string, payload: CaptureUpdate) {
  return apiSend<Capture>(`/captures/${id}`, "PATCH", payload);
}

export async function deleteCapture(id: string) {
  return apiSend<{ id: string }>(`/captures/${id}`, "DELETE");
}