import { Router } from "express";
import { requireAuth } from "../middleware/supabase-auth";
import { z } from "zod";
import { storage } from "../storage";

const r = Router();
r.use(requireAuth);

// GET /api/moments?projectId=&q=&page=&pageSize=
r.get("/", async (req, res) => {
  const userId = (req as any).user.id;
  const { projectId, q, page="1", pageSize="20" } = req.query as Record<string,string>;
  
  try {
    const result = await storage.listMomentsWithPagination({ 
      userId, projectId, q, page:+page, pageSize:+pageSize 
    });
    res.json(result);
  } catch (error) {
    console.error("Error listing moments:", error);
    res.status(500).json({ error: "Failed to list moments" });
  }
});

// POST /api/moments { title, description, intensity, platforms?, demographics?, duration?, projectId? }
r.post("/", async (req, res) => {
  const userId = (req as any).user.id;
  const body = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    intensity: z.number().int().min(0).max(100),
    platforms: z.array(z.string()).optional(),
    demographics: z.array(z.string()).optional(),
    duration: z.string().optional(),
    projectId: z.string().uuid().nullable().optional(),
  }).parse(req.body);
  
  try {
    const moment = await storage.createMomentWithDetails({ userId, ...body });
    res.status(201).json(moment);
  } catch (error) {
    console.error("Error creating moment:", error);
    res.status(500).json({ error: "Failed to create moment" });
  }
});

export default r;