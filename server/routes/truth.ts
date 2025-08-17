import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { storage } from '../storage';
import { putObjectFromStream, getPublicUrl } from '../lib/supabaseStorage';
import { Readable } from 'stream';

const upload = multer({ storage: multer.memoryStorage() });
const MAX_BYTES = Number(process.env.CAPTURE_MAX_UPLOAD_BYTES ?? 52428800);

export const truthRouter = Router();

/**
 * POST /api/truth-checks
 * Creates a new truth check for URL, text, or image analysis
 * JSON body: { kind: 'url'|'text', projectId?, url?, text? }
 * Multipart: { kind: 'image', projectId?, file }
 */
truthRouter.post('/api/truth-checks', upload.single('file'), async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = user.id;
    const { kind, projectId, url, text } = req.body;
    const file = req.file;

    if (!kind || !['url', 'text', 'image'].includes(kind)) {
      return res.status(400).json({ error: 'Invalid kind. Must be url, text, or image' });
    }

    let input_url = null;
    let input_text = null;
    let input_file_key = null;
    let capture_id = null;

    if (kind === 'url') {
      if (!url) return res.status(400).json({ error: 'URL required for url analysis' });
      input_url = url;
    } else if (kind === 'text') {
      if (!text) return res.status(400).json({ error: 'Text required for text analysis' });
      input_text = text;
    } else if (kind === 'image') {
      if (!file) return res.status(400).json({ error: 'File required for image analysis' });
      
      if (file.size > MAX_BYTES) {
        return res.status(413).json({ error: 'FILE_TOO_LARGE', max: MAX_BYTES });
      }

      // Upload to storage
      const fileId = randomUUID();
      const key = `truth-checks/${userId}/${fileId}/${encodeURIComponent(file.originalname)}`;
      
      await putObjectFromStream({
        bucket: process.env.SUPABASE_STORAGE_BUCKET!,
        key,
        stream: bufferToStream(file.buffer),
        contentType: file.mimetype
      });

      input_file_key = key;

      // If projectId provided, create a capture record
      if (projectId) {
        const captureId = randomUUID();
        const captureResult = await (storage as any).client.query(`
          INSERT INTO captures (
            id, user_id, project_id, title, url, platform, content, summary, tags, metadata,
            status, source, screenshot_url, truth_analysis, analysis_status, google_analysis,
            note, file_key, file_mime, file_bytes, file_pages, original_filename, source_url,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23,
            NOW(), NOW()
          ) RETURNING id
        `, [
          captureId, userId, projectId, file.originalname,
          getPublicUrl({ bucket: process.env.SUPABASE_STORAGE_BUCKET!, key }),
          'truth-check', '', '', [], {},
          'active', 'truth-check', null, {}, 'pending', {},
          null, key, file.mimetype, file.size, null, file.originalname, null
        ]);
        capture_id = captureResult.rows[0].id;
      }
    }

    // Create truth check record
    const truthId = randomUUID();
    const result = await (storage as any).client.query(`
      INSERT INTO truth_checks (
        id, user_id, project_id, capture_id, kind, input_url, input_text, input_file_key,
        status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      ) RETURNING *
    `, [truthId, userId, projectId || null, capture_id, kind, input_url, input_text, input_file_key, 'queued']);

    const truthCheck = result.rows[0];

    // Queue worker job for analysis
    if (process.env.ENABLE_WORKERS === 'true') {
      // Trigger analysis worker (assuming you have worker infrastructure)
      console.log(`[Truth Check] Queued ${kind} analysis for truth check ${truthId}`);
    }

    res.json({
      id: truthCheck.id,
      kind: truthCheck.kind,
      status: truthCheck.status,
      capture_id: truthCheck.capture_id,
      created_at: truthCheck.created_at
    });

  } catch (err) {
    console.error('Truth check creation error:', err);
    next(err);
  }
});

/**
 * GET /api/truth-checks
 * List truth checks for current user with pagination
 */
truthRouter.get('/api/truth-checks', async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 100);
    const offset = (page - 1) * pageSize;

    const result = await (storage as any).client.query(`
      SELECT id, user_id, project_id, capture_id, kind, input_url, input_text, input_file_key,
             status, verdict, confidence, summary, error, created_at, updated_at
      FROM truth_checks 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `, [user.id, pageSize, offset]);

    const countResult = await (storage as any).client.query(
      'SELECT COUNT(*) FROM truth_checks WHERE user_id = $1',
      [user.id]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows.map((row: any) => ({
        id: row.id,
        kind: row.kind,
        status: row.status,
        verdict: row.verdict,
        confidence: row.confidence,
        summary: row.summary,
        input_preview: row.input_url || (row.input_text?.substring(0, 100)) || 'Image upload',
        capture_id: row.capture_id,
        created_at: row.created_at,
        error: row.error
      })),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    });

  } catch (err) {
    console.error('Truth checks list error:', err);
    next(err);
  }
});

/**
 * GET /api/truth-checks/:id
 * Get detailed truth check results
 */
truthRouter.get('/api/truth-checks/:id', async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const truthId = req.params.id;
    
    // Get truth check with evidence
    const result = await (storage as any).client.query(`
      SELECT tc.*, 
             array_agg(
               json_build_object(
                 'id', te.id,
                 'title', te.title,
                 'source_url', te.source_url,
                 'snippet', te.snippet,
                 'meta', te.meta,
                 'created_at', te.created_at
               ) ORDER BY te.created_at
             ) FILTER (WHERE te.id IS NOT NULL) as evidence
      FROM truth_checks tc
      LEFT JOIN truth_evidence te ON tc.id = te.truth_id
      WHERE tc.id = $1 AND tc.user_id = $2
      GROUP BY tc.id
    `, [truthId, user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Truth check not found' });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      kind: row.kind,
      status: row.status,
      input_url: row.input_url,
      input_text: row.input_text,
      input_file_key: row.input_file_key,
      verdict: row.verdict,
      confidence: row.confidence,
      summary: row.summary,
      evidence: row.evidence || [],
      capture_id: row.capture_id,
      project_id: row.project_id,
      error: row.error,
      created_at: row.created_at,
      updated_at: row.updated_at
    });

  } catch (err) {
    console.error('Truth check detail error:', err);
    next(err);
  }
});

/**
 * POST /api/truth-checks/:id/retry
 * Retry a failed truth check
 */
truthRouter.post('/api/truth-checks/:id/retry', async (req, res, next) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const truthId = req.params.id;
    
    // Reset status to queued
    const result = await (storage as any).client.query(`
      UPDATE truth_checks 
      SET status = 'queued', error = NULL, updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING id, status
    `, [truthId, user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Truth check not found' });
    }

    // Queue worker job
    if (process.env.ENABLE_WORKERS === 'true') {
      console.log(`[Truth Check] Retrying analysis for truth check ${truthId}`);
    }

    res.json({ 
      id: result.rows[0].id, 
      status: result.rows[0].status 
    });

  } catch (err) {
    console.error('Truth check retry error:', err);
    next(err);
  }
});

// Utility function
function bufferToStream(buf: Buffer): Readable {
  const r = new Readable();
  r.push(buf);
  r.push(null);
  return r;
}