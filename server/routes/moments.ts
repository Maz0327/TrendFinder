import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { mapMoment } from "../lib/mappers";
import { getUserFromRequest } from "./auth";

export function registerMomentsRoutes(app: Express) {
  
  // Get moments with filtering
  app.get('/api/moments', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const {
        projectId,
        q: search,
        tags: tagsParam
      } = req.query;

      // Parse tags parameter
      const tags = typeof tagsParam === 'string' 
        ? tagsParam.split(',').filter(Boolean) 
        : [];

      // Get all moments (storage doesn't have project filtering for moments yet)
      const allMoments = await storage.listMoments();

      let filteredMoments = allMoments.filter(moment => {
        // Tags filter (ANY match)
        if (tags.length > 0) {
          const momentTags = Array.isArray(moment.tags) ? moment.tags : [];
          const hasMatchingTag = tags.some(tag => momentTags.includes(tag));
          if (!hasMatchingTag) {
            return false;
          }
        }

        // Search filter
        if (search) {
          const searchLower = (search as string).toLowerCase();
          const titleMatch = moment.title.toLowerCase().includes(searchLower);
          const descMatch = moment.description.toLowerCase().includes(searchLower);
          if (!titleMatch && !descMatch) {
            return false;
          }
        }

        return true;
      });

      const momentDTOs = filteredMoments.map(mapMoment);

      res.json(momentDTOs);
    } catch (error) {
      console.error('Moments list error:', error);
      res.status(500).json({ error: 'Failed to fetch moments' });
    }
  });

  // Update moment (optional for now)
  app.patch('/api/moments/:id', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const { tags } = req.body;

      const updateData: any = {};
      
      if (Array.isArray(tags)) {
        updateData.tags = tags;
      }

      updateData.updated_at = new Date().toISOString();

      const moment = await storage.updateMoment(id, updateData);
      
      if (!moment) {
        return res.status(404).json({ error: 'Moment not found' });
      }

      res.json(mapMoment(moment));
    } catch (error) {
      console.error('Moment update error:', error);
      res.status(500).json({ error: 'Failed to update moment' });
    }
  });
}