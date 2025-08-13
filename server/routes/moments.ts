import { Express } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { storage } from "../storage";
import { z } from "zod";

const createMomentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  intensity: z.number().min(1).max(5),
  platforms: z.array(z.string()),
  demographics: z.array(z.string()),
  duration: z.enum(["fleeting", "short", "sustained", "long"]),
});

const updateMomentSchema = createMomentSchema.partial();

export function registerMomentRoutes(app: Express) {
  app.get("/api/moments", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const userId = req.user.id;
      const projectId = req.query.projectId as string | undefined;

      const moments = await storage.getCulturalMoments();

      res.json(moments);
    } catch (error: any) {
      console.error("Error fetching moments:", error);
      res.status(500).json({ error: "Failed to fetch moments" });
    }
  });

  app.post("/api/moments", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const userId = req.user.id;
      const data = createMomentSchema.parse(req.body);

      const moment = await storage.createCulturalMoment({
        ...data,
        user_id: userId,
      });

      res.json(moment);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error creating moment:", error);
      res.status(500).json({ error: "Failed to create moment" });
    }
  });

  app.patch("/api/moments/:id", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const userId = req.user.id;
      const momentId = req.params.id;
      const data = updateMomentSchema.parse(req.body);

      const moment = await storage.updateCulturalMoment(momentId, data);
      res.json(moment);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error updating moment:", error);
      res.status(500).json({ error: "Failed to update moment" });
    }
  });

  app.delete("/api/moments/:id", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const userId = req.user.id;
      const momentId = req.params.id;

      // Note: deleteCulturalMoment method needs to be added to storage interface
      res.status(501).json({ error: "Delete not implemented yet" });
    } catch (error: any) {
      console.error("Error deleting moment:", error);
      res.status(500).json({ error: "Failed to delete moment" });
    }
  });
}