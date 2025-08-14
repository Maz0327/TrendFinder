import { apiGet, apiSend } from "./http";
import type { Database } from "@shared/database.types";

type Moment = Database["public"]["Tables"]["cultural_moments"]["Row"];
type MomentInsert = Database["public"]["Tables"]["cultural_moments"]["Insert"];
type MomentUpdate = Database["public"]["Tables"]["cultural_moments"]["Update"];

export async function listMoments(params?: { 
  projectId?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}) {
  const qp = new URLSearchParams();
  if (params?.projectId) qp.set("projectId", params.projectId);
  if (params?.q) qp.set("q", params.q);
  if (params?.page) qp.set("page", params.page.toString());
  if (params?.pageSize) qp.set("pageSize", params.pageSize.toString());
  
  const q = qp.toString() ? `?${qp.toString()}` : "";
  // Updated to handle new paginated server response format
  const response = await apiGet<{ rows: Moment[]; total: number; page: number; pageSize: number }>(`/moments${q}`);
  return { items: response.rows, total: response.total, page: response.page, pageSize: response.pageSize };
}

export async function createMoment(payload: MomentInsert) {
  return apiSend<Moment>("/moments", "POST", payload);
}

export async function updateMoment(id: string, payload: MomentUpdate) {
  return apiSend<Moment>(`/moments/${id}`, "PATCH", payload);
}

export async function deleteMoment(id: string) {
  return apiSend<{ id: string }>(`/moments/${id}`, "DELETE");
}