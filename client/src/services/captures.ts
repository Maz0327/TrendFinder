import { api, PaginatedResponse } from "./api";
import type { Database } from "@shared/database.types";

type Capture = Database["public"]["Tables"]["captures"]["Row"];
type CaptureInsert = Database["public"]["Tables"]["captures"]["Insert"];
type CaptureUpdate = Database["public"]["Tables"]["captures"]["Update"];

export async function listCaptures(params?: {
  projectId?: string;
  platform?: string;
  q?: string;
  tags?: string[];
  page?: number;
  pageSize?: number;
}) {
  const response = await api.get<PaginatedResponse<Capture>>("/captures", params);
  return { items: response.rows, total: response.total, page: response.page, pageSize: response.pageSize };
}

export async function createCapture(payload: Omit<CaptureInsert, "user_id">) {
  return api.post<Capture>("/captures", payload);
}

export async function updateCapture(id: string, payload: CaptureUpdate) {
  return api.patch<Capture>(`/captures/${id}`, payload);
}

export async function updateCaptureTags(id: string, tags: string[]) {
  return api.patch<Capture>(`/captures/${id}`, { tags });
}

export async function deleteCapture(id: string) {
  return api.delete<{ id: string }>(`/captures/${id}`);
}