import { api, IS_MOCK_MODE } from "../lib/api";
import type { ID, Brief, Paginated } from "../types";

export function listBriefs(params?: { page?: number; pageSize?: number; q?: string; projectId?: ID }) {
  if (IS_MOCK_MODE) {
    return Promise.resolve<Paginated<Brief>>({
      data: [{ id: "b1", title: "Sample Brief", status: "draft" }],
      page: 1, pageSize: 20, total: 1,
    });
  }
  return api.get<Paginated<Brief>>("/briefs", params);
}

export function getBrief(id: ID) {
  return api.get<Brief>(`/briefs/${id}`);
}

export function createBrief(payload: Partial<Brief>) {
  // server injects user_id; client does not send it
  return api.post<Brief>("/briefs", payload);
}

export function updateBrief(id: ID, patch: Partial<Brief>) {
  return api.patch<Brief>(`/briefs/${id}`, patch);
}

export function exportBriefToSlides(id: ID) {
  return api.post<{ ok: true; slideUrl?: string }>(`/briefs/${id}/export/slides`);
}

// Some pages may import deleteBrief or removeBrief — provide both
export function deleteBrief(id: ID) {
  return api.del<{ ok: true }>(`/briefs/${id}`);
}
export const removeBrief = deleteBrief;