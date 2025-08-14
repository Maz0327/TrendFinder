import { Router } from "express";
import { requireAuth } from "../middleware/supabase-auth";
import { z } from "zod";
import { storage } from "../storage";
import crypto from "crypto";

const r = Router();
r.use(requireAuth);

// Task Block #6: Enhanced captures list with analysis data and caching
// GET /api/captures?projectId=&platform=&q=&tags=tag1,tag2&label=&analyzed=true&date_from=&date_to=&page=1&pageSize=20
r.get("/", async (req, res) => {
  const userId = (req as any).user.id as string;
  const { 
    projectId, platform, q, tags, label, analyzed, 
    date_from, date_to, page = "1", pageSize = "20" 
  } = req.query as Record<string, string>;
  
  const tagList = tags ? tags.split(",").map(s => s.trim()).filter(Boolean) : [];
  const analyzedBool = analyzed !== undefined ? analyzed === "true" : undefined;

  try {
    const { rows, total, lastModified } = await storage.listCapturesWithAnalysis({
      userId, 
      projectId, 
      platform, 
      q, 
      tags: tagList,
      label,
      analyzed: analyzedBool,
      dateFrom: date_from,
      dateTo: date_to,
      page: parseInt(page), 
      pageSize: parseInt(pageSize)
    });

    // Implement ETag and Last-Modified caching
    const pageKey = `${userId}-${page}-${pageSize}-${projectId || ''}-${platform || ''}-${q || ''}-${tags || ''}-${label || ''}-${analyzed || ''}-${date_from || ''}-${date_to || ''}`;
    const payloadHash = crypto.createHash('md5').update(JSON.stringify(rows)).digest('hex');
    const etag = `"${pageKey}-${payloadHash}"`;
    
    if (lastModified) {
      res.set('Last-Modified', lastModified.toUTCString());
    }
    res.set('ETag', etag);

    // Check If-None-Match and If-Modified-Since
    const clientETag = req.headers['if-none-match'];
    const clientLastModified = req.headers['if-modified-since'];

    if (clientETag && clientETag === etag) {
      return res.status(304).end();
    }

    if (clientLastModified && lastModified) {
      const clientDate = new Date(clientLastModified);
      if (lastModified <= clientDate) {
        return res.status(304).end();
      }
    }

    res.json({ 
      rows, 
      total, 
      page: Number(page), 
      pageSize: Number(pageSize) 
    });
  } catch (error) {
    console.error("Error listing captures with analysis:", error);
    res.status(500).json({ error: "Failed to list captures" });
  }
});

// GET /api/captures/:id - Enhanced detail endpoint with analysis data
r.get("/:id", async (req, res) => {
  const userId = (req as any).user.id as string;
  const { id } = req.params;

  try {
    const capture = await storage.getCaptureWithAnalysis(id);
    
    if (!capture) {
      return res.status(404).json({ error: "Capture not found" });
    }

    // Verify user ownership
    if (capture.user_id !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(capture);
  } catch (error) {
    console.error("Error fetching capture detail:", error);
    res.status(500).json({ error: "Failed to fetch capture" });
  }
});

// PATCH /api/captures/:id/tags { add?: string[], remove?: string[] }
r.patch("/:id/tags", async (req, res) => {
  const userId = (req as any).user.id as string;
  const id = req.params.id;
  const body = z.object({
    add: z.array(z.string()).optional(),
    remove: z.array(z.string()).optional()
  }).parse(req.body);

  try {
    const updated = await storage.updateCaptureTags({ 
      id, 
      userId, 
      add: body.add ?? [], 
      remove: body.remove ?? [] 
    });
    res.json(updated);
  } catch (error) {
    console.error("Error updating capture tags:", error);
    res.status(500).json({ error: "Failed to update capture tags" });
  }
});

export default r;