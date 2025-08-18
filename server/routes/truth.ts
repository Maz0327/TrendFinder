import type { Express, Request, Response } from 'express';
import { z } from 'zod';
import { extractFromUrl } from '../services/truth/extract';
import { runQuickTextAnalysis } from '../services/analysis/text';
import { Client } from 'pg';

const postExtractBody = z.object({
  url: z.string().url()
});

const postAnalyzeTextBody = z.object({
  text: z.string().min(10).max(20000).optional(),
});

export function registerTruthRoutes(app: Express) {
  app.post('/api/truth/extract', async (req: Request, res: Response) => {
    try {
      const { url } = postExtractBody.parse(req.body);
      const userId = 'dev-user'; // For development, using fixed user
      const projectId = req.body.projectId ?? null;

      const { extracted_text, extracted_images } = await extractFromUrl(url);

      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      
      try {
        const result = await client.query(
          `INSERT INTO truth_checks (user_id, project_id, source_type, source_url, extracted_text, extracted_images, status)
           VALUES ($1, $2, 'url', $3, $4, $5::jsonb, 'ready_for_text')
           RETURNING id`,
          [userId, projectId, url, extracted_text, JSON.stringify(extracted_images)]
        );
        const row = result.rows[0];
        res.json({ id: row.id, extracted_text, extracted_images });
      } finally {
        await client.end();
      }
    } catch (error) {
      console.error('Extract error:', error);
      res.status(500).json({ error: 'extraction_failed' });
    }
  });

  app.post('/api/truth/analyze-text/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const body = postAnalyzeTextBody.safeParse(req.body);
      const userId = 'dev-user'; // For development
      
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      
      try {
        // load record
        const tcResult = await client.query(
          `SELECT * FROM truth_checks WHERE id = $1 AND user_id = $2`,
          [id, userId]
        );
        
        if (tcResult.rows.length === 0) {
          return res.status(404).json({ error: 'not_found' });
        }
        
        const tc = tcResult.rows[0];

        const text = body.success && body.data.text ? 
          body.data.text : 
          (tc.extracted_text || tc.source_text || '');
          
        if (!text || text.length < 10) {
          return res.status(400).json({ error: 'no_text' });
        }

        await client.query(`UPDATE truth_checks SET status = 'text_running' WHERE id = $1`, [id]);

        const out = await runQuickTextAnalysis({ 
          text, 
          url: tc.source_url || undefined 
        });

        await client.query(`
          UPDATE truth_checks
          SET result_truth = $2::jsonb, result_strategic = $3::jsonb, result_cohorts = $4::jsonb, status = 'done'
          WHERE id = $1
        `, [id, JSON.stringify(out.result_truth), JSON.stringify(out.result_strategic), JSON.stringify(out.result_cohorts)]);

        const updatedResult = await client.query(`SELECT * FROM truth_checks WHERE id = $1`, [id]);
        const updated = updatedResult.rows[0];
        res.json(updated);
      } finally {
        await client.end();
      }
    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ error: 'analysis_failed' });
    }
  });

  app.get('/api/truth/:id', async (req: Request, res: Response) => {
    try {
      const userId = 'dev-user'; // For development
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      
      try {
        const result = await client.query(
          `SELECT * FROM truth_checks WHERE id = $1 AND user_id = $2`,
          [req.params.id, userId]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'not_found' });
        }
        
        res.json(result.rows[0]);
      } finally {
        await client.end();
      }
    } catch (error) {
      console.error('Get truth check error:', error);
      res.status(500).json({ error: 'fetch_failed' });
    }
  });
}