import { api } from "../lib/api";
import type { ID, Capture, Paginated } from "../types";

export function listCaptures(params?: { page?: number; pageSize?: number; q?: string; tags?: string[]; projectId?: ID }) {
  const qp: Record<string, any> = { ...params };
  if (params?.tags) qp.tags = params.tags.join(",");
  return api.get<Paginated<Capture>>("/captures", qp);
}

export function getCapture(id: ID) {
  return api.get<Capture>(`/captures/${id}`);
}

export function updateCapture(id: ID, patch: Partial<Capture>) {
  return api.patch<Capture>(`/captures/${id}`, patch);
}

// upload via form-data (server stores to Supabase storage)
export function uploadCapture(files: File[], meta?: { project_id?: ID | null; notes?: string }) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  if (meta?.project_id) form.set("project_id", meta.project_id);
  if (meta?.notes) form.set("notes", meta.notes);
  return api.post<{ uploaded: Capture[] }>("/captures/upload", form);
}