import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { mapFeed } from "../lib/mappers";
import { getUserFromRequest } from "./auth";

export function registerFeedsRoutes(app: Express) {
  
  // Get feeds
  app.get('/api/feeds', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { projectId } = req.query;

      const feeds = await storage.listUserFeeds(user.id, {
        project_id: projectId as string || undefined
      });

      const feedDTOs = feeds.map(mapFeed);

      res.json(feedDTOs);
    } catch (error) {
      console.error('Feeds list error:', error);
      res.status(500).json({ error: 'Failed to fetch feeds' });
    }
  });

  // Create new feed
  app.post('/api/feeds', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { feedUrl, title, projectId } = req.body;
      if (!feedUrl) {
        return res.status(400).json({ error: 'Feed URL is required' });
      }

      const feed = await storage.createUserFeed({
        user_id: user.id,
        project_id: projectId || null,
        feed_url: feedUrl,
        title: title || null,
        is_active: true
      });

      res.status(201).json(mapFeed(feed));
    } catch (error) {
      console.error('Feed creation error:', error);
      res.status(500).json({ error: 'Failed to create feed' });
    }
  });

  // Toggle feed active status
  app.patch('/api/feeds/:id/toggle', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      
      // Get current feed to check ownership and current status
      const currentFeed = await storage.getUserFeed(id);
      if (!currentFeed || currentFeed.user_id !== user.id) {
        return res.status(404).json({ error: 'Feed not found' });
      }

      const feed = await storage.updateUserFeed(id, {
        is_active: !currentFeed.is_active,
        updated_at: new Date().toISOString()
      });

      if (!feed) {
        return res.status(404).json({ error: 'Feed not found' });
      }

      res.json(mapFeed(feed));
    } catch (error) {
      console.error('Feed toggle error:', error);
      res.status(500).json({ error: 'Failed to toggle feed' });
    }
  });

  // Delete feed
  app.delete('/api/feeds/:id', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      
      // Check ownership before deletion
      const currentFeed = await storage.getUserFeed(id);
      if (!currentFeed || currentFeed.user_id !== user.id) {
        return res.status(404).json({ error: 'Feed not found' });
      }

      await storage.deleteUserFeed(id);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Feed deletion error:', error);
      res.status(500).json({ error: 'Failed to delete feed' });
    }
  });
}