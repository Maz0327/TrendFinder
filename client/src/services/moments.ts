import { apiGet, apiSend } from "./http";
import type { Database } from "@shared/database.types";

type Moment = Database["public"]["Tables"]["cultural_moments"]["Row"];
type MomentInsert = Database["public"]["Tables"]["cultural_moments"]["Insert"];
type MomentUpdate = Database["public"]["Tables"]["cultural_moments"]["Update"];

export async function listMoments(params?: { projectId?: string }) {
  const q = params?.projectId ? `?projectId=${encodeURIComponent(params.projectId)}` : "";
  return apiGet<Moment[]>(`/moments${q}`);
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