import { Router } from "express";
import { requireAuth } from "../middleware/supabase-auth";
import { z } from "zod";
import { storage } from "../storage";

const r = Router();
r.use(requireAuth);

// GET /api/captures?projectId=&platform=&q=&tags=tag1,tag2&page=1&pageSize=20
r.get("/", async (req, res) => {
  const userId = (req as any).user.id as string;
  const { projectId, platform, q, tags, page = "1", pageSize = "20" } = req.query as Record<string,string>;
  const tagList = tags ? tags.split(",").map(s => s.trim()).filter(Boolean) : [];

  try {
    const { rows, total } = await storage.listCapturesWithPagination({
      userId, projectId, platform, q, tags: tagList,
      page: parseInt(page), pageSize: parseInt(pageSize)
    });
    res.json({ rows, total, page: Number(page), pageSize: Number(pageSize) });
  } catch (error) {
    console.error("Error listing captures:", error);
    res.status(500).json({ error: "Failed to list captures" });
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