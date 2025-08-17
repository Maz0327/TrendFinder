import { api, IS_MOCK_MODE } from './http';

export interface CapturesListParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

export const capturesService = {
  async list(params: CapturesListParams = {}) {
    if (IS_MOCK_MODE) {
      return { data: [], total: 0, page: 1, pageSize: 20 };
    }
    const qp = new URLSearchParams();
    if (params.page) qp.set('page', String(params.page));
    if (params.pageSize) qp.set('pageSize', String(params.pageSize));
    if (params.status) qp.set('status', params.status);
    return api.request(`/api/captures?${qp}`);
  },

  async get(id: string) {
    if (IS_MOCK_MODE) {
      return { id, title: 'Mock Capture', project_id: 'mock', created_at: new Date().toISOString() };
    }
    return api.request(`/api/captures/${id}`);
  },

  async update(id: string, data: any) {
    if (IS_MOCK_MODE) {
      return { id, ...data, updated_at: new Date().toISOString() };
    }
    return api.request(`/api/captures/${id}`, { method: 'PATCH', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
  },

  async updateStatus(id: string, status: string) {
    return this.update(id, { status });
  }
};

export async function uploadCaptures(projectId: string, items: { file: File; note?: string; title?: string }[]) {
  if (IS_MOCK_MODE) {
    return { ok: true, created: items.map((x,i)=>({ id:`mock-${i}`, title:x.title||x.file.name, project_id:projectId, created_at:new Date().toISOString() })) };
  }
  const fd = new FormData();
  for (const it of items) {
    fd.append('files', it.file);
    if (it.note) fd.append('notes', it.note);
    if (it.title) fd.append('titles', it.title);
  }
  return api.request<{ ok:boolean; created:any[] }>(`/api/projects/${projectId}/captures/upload`, { method: 'POST', body: fd });
}

export async function getCaptures(projectId: string) {
  if (IS_MOCK_MODE) {
    return { data: [] };
  }
  return api.request(`/api/projects/${projectId}/captures`);
}

export async function getCapture(id: string) {
  if (IS_MOCK_MODE) {
    return { id, title: 'Mock Capture', project_id: 'mock', created_at: new Date().toISOString() };
  }
  return api.request(`/api/captures/${id}`);
}