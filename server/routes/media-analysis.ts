import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { getMediaProvider } from '../services/analysis';
import { AnalysisResultSchema } from '../services/analysis/schema';

const router = Router();

const AnalyzeBody = z.object({
  sourcePath: z.string().min(3),                  // Supabase storage path or https URL you trust
  kind: z.enum(['image','video']).default('image'),
  hint: z.string().optional(),
  briefId: z.string().uuid().optional(),
  captureId: z.string().uuid().optional(),
  assetId: z.string().uuid().optional(),
});

router.post('/api/media/analyze/quick', requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user!;
  const body = AnalyzeBody.parse(req.body || {});
  const provider = getMediaProvider();

  try {
    const started = Date.now();
    const result = await provider.analyze({
      sourcePath: body.sourcePath,
      kind: body.kind,
      mode: 'quick',
      userId: user.id,
      hint: body.hint
    });
    const validated = AnalysisResultSchema.parse(result);

    // persist as a one-off job+result for history
    const { data: job } = await supabaseAdmin.from('media_analysis_jobs').insert({
      user_id: user.id,
      brief_id: body.briefId ?? null,
      capture_id: body.captureId ?? null,
      asset_id: body.assetId ?? null,
      source_path: body.sourcePath,
      provider: (process.env.MEDIA_PROVIDER || 'mock'),
      mode: 'quick',
      status: 'succeeded'
    }).select().single();

    await supabaseAdmin.from('media_analysis_results').insert({
      job_id: job.id,
      summary: validated.summary ?? '',
      shots: validated.shots ?? [],
      labels: validated.labels ?? [],
      ocr: validated.ocr ?? [],
      asr: validated.asr ?? [],
      meta: { ...(validated.meta || {}), duration_ms: Date.now() - started }
    });

    return res.json({ jobId: job.id, result: validated });
  } catch (e: any) {
    return res.status(400).json({ error: String(e?.message || e) });
  }
});

router.post('/api/media/analyze/deep', requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user!;
  const body = AnalyzeBody.parse(req.body || {});

  const { data, error } = await supabaseAdmin.from('media_analysis_jobs').insert({
    user_id: user.id,
    brief_id: body.briefId ?? null,
    capture_id: body.captureId ?? null,
    asset_id: body.assetId ?? null,
    source_path: body.sourcePath,
    provider: (process.env.MEDIA_PROVIDER || 'mock'),
    mode: 'deep',
    status: 'queued'
  }).select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ jobId: data.id, status: 'queued' });
});

router.get('/api/media/jobs/:jobId', requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user!;
  const jobId = req.params.jobId;

  const { data: job, error: e1 } = await supabaseAdmin
    .from('media_analysis_jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', user.id)  // ensure user owns this job
    .single();
  
  if (e1 || !job) return res.status(404).json({ error: 'Not found' });

  const { data: result } = await supabaseAdmin
    .from('media_analysis_results')
    .select('*')
    .eq('job_id', jobId)
    .single();
    
  res.json({ job, result: result || null });
});

export default router;