export async function quickAnalyze(token: string, payload: {
  sourcePath: string; kind: 'image'|'video'; briefId?: string; captureId?: string; assetId?: string; hint?: string;
}) {
  const r = await fetch('/api/media/analyze/quick', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { jobId, result }
}

export async function deepAnalyze(token: string, payload: {
  sourcePath: string; kind: 'image'|'video'; briefId?: string; captureId?: string; assetId?: string; hint?: string;
}) {
  const r = await fetch('/api/media/analyze/deep', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { jobId, status: 'queued' }
}

export async function getJob(token: string, jobId: string) {
  const r = await fetch(`/api/media/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { job, result? }
}