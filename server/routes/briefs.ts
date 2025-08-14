import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { mapBrief, mapBriefDetail, validateSlidesJson } from "../lib/mappers";
import { getUserFromRequest } from "./auth";
import type { BriefDetail } from "../types/dto";

export function registerBriefsRoutes(app: Express) {
  
  // Get briefs list
  app.get('/api/briefs', async (req: Request, res: Response) => {
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

      // Get all briefs for user
      const allBriefs = await storage.listBriefs(user.id);

      let filteredBriefs = allBriefs.filter(brief => {
        // Project filter
        if (projectId && brief.client_profile_id !== projectId) {
          return false;
        }

        // Tags filter (ANY match)
        if (tags.length > 0) {
          const briefTags = Array.isArray(brief.tags) ? brief.tags : [];
          const hasMatchingTag = tags.some(tag => briefTags.includes(tag));
          if (!hasMatchingTag) {
            return false;
          }
        }

        // Search filter
        if (search) {
          const searchLower = (search as string).toLowerCase();
          const titleMatch = brief.title.toLowerCase().includes(searchLower);
          if (!titleMatch) {
            return false;
          }
        }

        return true;
      });

      const briefDTOs = filteredBriefs.map(mapBrief);

      res.json(briefDTOs);
    } catch (error) {
      console.error('Briefs list error:', error);
      res.status(500).json({ error: 'Failed to fetch briefs' });
    }
  });

  // Create new brief
  app.post('/api/briefs', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { projectId, title } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Brief title is required' });
      }

      const brief = await storage.createBrief({
        user_id: user.id,
        client_profile_id: projectId || null,
        title,
        status: 'draft',
        slides: [],
        tags: []
      });

      res.status(201).json(mapBrief(brief));
    } catch (error) {
      console.error('Brief creation error:', error);
      res.status(500).json({ error: 'Failed to create brief' });
    }
  });

  // Get brief detail with slides
  app.get('/api/briefs/:id', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const brief = await storage.getBrief(id);
      
      if (!brief || brief.user_id !== user.id) {
        return res.status(404).json({ error: 'Brief not found' });
      }

      res.json(mapBriefDetail(brief));
    } catch (error) {
      console.error('Brief detail error:', error);
      res.status(500).json({ error: 'Failed to fetch brief' });
    }
  });

  // Update brief metadata
  app.patch('/api/briefs/:id', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const { title, status, tags } = req.body;

      const updateData: any = {};
      
      if (title) updateData.title = title;
      if (status) updateData.status = status;
      if (Array.isArray(tags)) updateData.tags = tags;
      
      updateData.updated_at = new Date().toISOString();

      const brief = await storage.updateBrief(id, updateData);
      
      if (!brief) {
        return res.status(404).json({ error: 'Brief not found' });
      }

      res.json(mapBrief(brief));
    } catch (error) {
      console.error('Brief update error:', error);
      res.status(500).json({ error: 'Failed to update brief' });
    }
  });

  // Save full brief detail (replace slides atomically)
  app.post('/api/briefs/:id/save', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const briefData = req.body as BriefDetail;

      // Validate slides
      const validatedSlides = validateSlidesJson(briefData.slides);

      const updateData: any = {
        title: briefData.title,
        status: briefData.status || 'draft',
        tags: Array.isArray(briefData.tags) ? briefData.tags : [],
        slides: validatedSlides,
        updated_at: new Date().toISOString()
      };

      const brief = await storage.updateBrief(id, updateData);
      
      if (!brief) {
        return res.status(404).json({ error: 'Brief not found' });
      }

      res.json(mapBriefDetail(brief));
    } catch (error) {
      console.error('Brief save error:', error);
      res.status(500).json({ error: 'Failed to save brief' });
    }
  });
}