import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { mapCapture } from "../lib/mappers";
import { getUserFromRequest } from "./auth";

export function registerCapturesRoutes(app: Express) {
  
  // Get captures with filtering and pagination
  app.get('/api/captures', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const {
        projectId,
        status,
        q: search,
        tags: tagsParam,
        page = '1',
        pageSize = '20'
      } = req.query;

      // Parse tags parameter
      const tags = typeof tagsParam === 'string' 
        ? tagsParam.split(',').filter(Boolean) 
        : [];

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const pageSizeNum = Math.max(1, Math.min(100, parseInt(pageSize as string) || 20));

      // For now, get all captures and filter in memory
      // In production, this should be done in the database
      const allCaptures = await storage.listCaptures(user.id, {
        project_id: projectId as string || undefined
      });

      let filteredCaptures = allCaptures.filter(capture => {
        // Status filter
        if (status && capture.analysis_status !== status) {
          return false;
        }

        // Tags filter (ANY match)
        if (tags.length > 0) {
          const captureTags = Array.isArray(capture.tags) ? capture.tags : [];
          const hasMatchingTag = tags.some(tag => captureTags.includes(tag));
          if (!hasMatchingTag) {
            return false;
          }
        }

        // Search filter
        if (search) {
          const searchLower = (search as string).toLowerCase();
          const titleMatch = capture.title.toLowerCase().includes(searchLower);
          const contentMatch = capture.content.toLowerCase().includes(searchLower);
          if (!titleMatch && !contentMatch) {
            return false;
          }
        }

        return true;
      });

      // Apply pagination
      const total = filteredCaptures.length;
      const startIndex = (pageNum - 1) * pageSizeNum;
      const endIndex = startIndex + pageSizeNum;
      const paginatedCaptures = filteredCaptures.slice(startIndex, endIndex);

      const captureDTOs = paginatedCaptures.map(mapCapture);

      res.json({
        items: captureDTOs,
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum)
      });
    } catch (error) {
      console.error('Captures list error:', error);
      res.status(500).json({ error: 'Failed to fetch captures' });
    }
  });

  // Update capture (triage)
  app.patch('/api/captures/:id', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const { status, tags } = req.body;

      const updateData: any = {};
      
      if (status) {
        updateData.analysis_status = status;
      }
      
      if (Array.isArray(tags)) {
        updateData.tags = tags;
      }

      updateData.updated_at = new Date().toISOString();

      const capture = await storage.updateCapture(id, updateData);
      
      if (!capture) {
        return res.status(404).json({ error: 'Capture not found' });
      }

      res.json(mapCapture(capture));
    } catch (error) {
      console.error('Capture update error:', error);
      res.status(500).json({ error: 'Failed to update capture' });
    }
  });
}