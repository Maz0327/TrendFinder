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