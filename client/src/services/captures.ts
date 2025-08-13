import { apiGet, apiSend } from "./http";
import type { Database } from "@shared/database.types";

type Capture = Database["public"]["Tables"]["captures"]["Row"];
type CaptureInsert = Database["public"]["Tables"]["captures"]["Insert"];
type CaptureUpdate = Database["public"]["Tables"]["captures"]["Update"];

export async function listCaptures(params?: {
  projectId?: string;
  status?: string;
  platform?: string;
  tag?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const qp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}` !== "") qp.set(k, String(v));
  });
  const q = qp.toString() ? `?${qp.toString()}` : "";
  return apiGet<{ items: Capture[]; total: number }>(`/captures${q}`);
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