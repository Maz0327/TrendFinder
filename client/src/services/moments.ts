import { api, PaginatedResponse } from "./api";
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
  const response = await api.get<PaginatedResponse<Moment>>("/moments", params);
  return { items: response.rows, total: response.total, page: response.page, pageSize: response.pageSize };
}

export async function createMoment(payload: MomentInsert) {
  return api.post<Moment>("/moments", payload);
}

export async function updateMoment(id: string, payload: MomentUpdate) {
  return api.patch<Moment>(`/moments/${id}`, payload);
}

export async function deleteMoment(id: string) {
  return api.delete<{ id: string }>(`/moments/${id}`);
}