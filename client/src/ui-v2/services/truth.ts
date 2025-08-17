import { api, IS_MOCK_MODE } from './http';

export type TruthKind = 'url'|'text'|'image';

export async function createTruthCheck(payload: { kind:TruthKind; projectId?:string; url?:string; text?:string; file?:File }) {
  if (IS_MOCK_MODE) return { id:'mock-truth-1', status:'done', verdict:'unverified', confidence:0.62, summary:{}, created_at:new Date().toISOString() };
  if (payload.file) {
    const fd = new FormData();
    if (payload.projectId) fd.append('projectId', payload.projectId);
    fd.append('kind','image'); 
    fd.append('file', payload.file);
    return api.request(`/api/truth-checks`, { method:'POST', body: fd });
  } else {
    return api.request(`/api/truth-checks`, { method:'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } });
  }
}

export async function getTruthCheck(id:string){ 
  return IS_MOCK_MODE ? { id, status:'done', verdict:'likely_true', confidence:0.8, summary:{} } : api.request(`/api/truth-checks/${id}`); 
}

export async function listTruthChecks(params?:{ page?:number; pageSize?:number }){
  const qp = new URLSearchParams();
  if (params?.page) qp.set('page', String(params.page));
  if (params?.pageSize) qp.set('pageSize', String(params.pageSize));
  return IS_MOCK_MODE ? { data:[], page:1, pageSize:20, total:0 } : api.request(`/api/truth-checks?${qp}`);
}

export async function retryTruthCheck(id:string){ 
  return api.request(`/api/truth-checks/${id}/retry`, { method:'POST' }); 
}