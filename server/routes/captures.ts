import { Router, Response } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { sanitizeInput } from "../utils/sanitize";
import { storage as db } from "../storage";

export const capturesRouter = Router();

// GET /api/captures
capturesRouter.get("/captures", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const captures = await db.getUserCaptures(userId);
    res.json(captures);
  } catch (error) {
    console.error("Error fetching user captures:", error);
    res.status(500).json({ error: "Failed to fetch captures" });
  }
});

// GET /api/captures/recent
capturesRouter.get("/captures/recent", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 10;
    const captures = await db.getUserCaptures(userId);

    const recentCaptures = captures
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);

    res.json(recentCaptures);
  } catch (error) {
    console.error("Error fetching recent captures:", error);
    res.status(500).json({ error: "Failed to fetch recent captures" });
  }
});

// GET /api/captures/all
capturesRouter.get("/captures/all", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const captures = await db.getUserCaptures(userId);
    res.json(captures);
  } catch (error) {
    console.error("Error fetching user captures:", error);
    res.status(500).json({ error: "Failed to fetch captures" });
  }
});

import { z } from "zod";
import { validateBody, ValidatedRequest } from "../middleware/validate";

const createCaptureSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Invalid URL format").optional(),
  notes: z.string().optional(),
  platform: z.string().optional(),
});

// POST /api/captures
capturesRouter.post(
  "/captures",
  requireAuth,
  validateBody(createCaptureSchema),
  async (req: ValidatedRequest<z.infer<typeof createCaptureSchema>>, res: Response) => {
    try {
      const { title, url, notes, platform } = req.validated!.body!;
      const userId = req.user!.id;

      // TODO: In a real app, find the project to associate with. For now, we'll need to handle this.
      // This is a placeholder until project selection is added to the UI.
      const projects = await db.getProjects(userId);
      let projectId: string;
      if (projects.length === 0) {
        const newProject = await db.createProject({ userId, name: "My First Project" });
        projectId = newProject.id;
      } else {
        projectId = projects[0].id;
      }

      const newCapture = await db.createCapture({
        userId,
        projectId,
        title,
        url,
        content: notes, // Using notes as the main content for now
        platform: platform || new URL(url || 'https://example.com').hostname,
        type: 'manual',
      });

      res.status(201).json(newCapture);
    } catch (error) {
      console.error("Error creating capture:", error);
      res.status(500).json({ error: "Failed to create capture" });
    }
  }
);

// PATCH /api/captures/:id
capturesRouter.patch("/captures/:id", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const updates = (req.body ?? {}) as {
      notes?: string;
      customCopy?: string;
      tags?: string[];
      dsdTags?: string[]; // This is an array of strings from the frontend
      dsdSection?: string;
    };

    const capture = await db.getCaptureById(id);
    if (!capture) return res.status(404).json({ error: "Capture not found" });
    if (capture.userId !== req.user!.id) return res.status(403).json({ error: "Forbidden" });

    // Transform dsdTags from string[] to the object format expected by the DB schema
    let dsdTagsObject: { [key: string]: boolean } | undefined = undefined;
    if (Array.isArray(updates.dsdTags)) {
      dsdTagsObject = {};
      const kebabToCamel = (s: string) => s.replace(/-([a-z])/g, g => g[1].toUpperCase());
      for (const tag of updates.dsdTags) {
        const camelCaseTag = kebabToCamel(tag);
        dsdTagsObject[camelCaseTag] = true;
      }
    }

    const updated = await db.updateCapture(id, {
      workspaceNotes: updates.notes,
      content: typeof updates.customCopy === "string" ? sanitizeInput(updates.customCopy) : undefined,
      tags: Array.isArray(updates.tags) ? updates.tags : undefined,
      dsdTags: dsdTagsObject, // Pass the transformed object
      dsdSection: typeof updates.dsdSection === "string" ? updates.dsdSection : undefined,
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating capture:", error);
    res.status(500).json({ error: "Failed to update capture" });
  }
});

// DELETE /api/captures/:id
capturesRouter.delete("/captures/:id", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const capture = await db.getCaptureById(id);
    if (!capture) return res.status(404).json({ error: "Capture not found" });
    if (capture.userId !== req.user!.id) return res.status(403).json({ error: "Forbidden" });

    await db.deleteCapture(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting capture:", error);
    res.status(500).json({ error: "Failed to delete capture" });
  }
});