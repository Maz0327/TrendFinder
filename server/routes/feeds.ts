import { Express } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { storage } from "../storage";
import { z } from "zod";

const createUserFeedSchema = z.object({
  feed_url: z.string().url(),
  title: z.string().optional(),
  project_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

const updateUserFeedSchema = z.object({
  is_active: z.boolean().optional(),
  title: z.string().optional(),
});

export function registerFeedRoutes(app: Express) {
  app.get("/api/feeds", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const userId = req.user.id;
      const projectId = req.query.projectId as string | undefined;

      // Note: getUserFeeds method needs to be implemented in storage
      res.json([]);
    } catch (error: any) {
      console.error("Error fetching feeds:", error);
      res.status(500).json({ error: "Failed to fetch feeds" });
    }
  });

  app.post("/api/feeds", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const userId = req.user.id;
      const data = createUserFeedSchema.parse(req.body);

      // Note: createUserFeed method needs to be implemented in storage
      res.status(501).json({ error: "Create feed not implemented yet" });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error creating feed:", error);
      res.status(500).json({ error: "Failed to create feed" });
    }
  });

  app.patch("/api/feeds/:id", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const userId = req.user.id;
      const feedId = req.params.id;
      const data = updateUserFeedSchema.parse(req.body);

      // Note: updateUserFeed method needs to be implemented in storage
      res.status(501).json({ error: "Update feed not implemented yet" });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error("Error updating feed:", error);
      res.status(500).json({ error: "Failed to update feed" });
    }
  });

  app.delete("/api/feeds/:id", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const userId = req.user.id;
      const feedId = req.params.id;

      // Note: deleteUserFeed method needs to be implemented in storage
      res.status(501).json({ error: "Delete feed not implemented yet" });
    } catch (error: any) {
      console.error("Error deleting feed:", error);
      res.status(500).json({ error: "Failed to delete feed" });
    }
  });
}