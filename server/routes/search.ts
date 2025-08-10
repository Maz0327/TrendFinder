import type { Express } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1),
  platform: z.string().optional(),
  projectId: z.string().uuid().optional(),
  analysisStatus: z.enum(['pending', 'completed', 'failed']).optional(),
  sortBy: z.enum(['relevance', 'date', 'viral_score']).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

export function setupSearchRoutes(app: Express) {
  // Search captures
  app.get('/api/search', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const params = searchSchema.parse(req.query);
      
      const results = await storage.searchCaptures(params.query, {
        platform: params.platform,
        projectId: params.projectId,
        analysisStatus: params.analysisStatus,
      });

      // Filter by user access
      const userProjects = await storage.getProjects(req.session.user.id);
      const userProjectIds = new Set(userProjects.map(p => p.id));
      
      const accessibleResults = results.filter(capture => 
        userProjectIds.has(capture.projectId)
      );

      // Sort results
      let sortedResults = [...accessibleResults];
      if (params.sortBy === 'date') {
        sortedResults.sort((a, b) => 
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        );
      } else if (params.sortBy === 'viral_score') {
        sortedResults.sort((a, b) => (b.viralScore || 0) - (a.viralScore || 0));
      }

      // Apply pagination
      const limit = params.limit || 20;
      const offset = params.offset || 0;
      const paginatedResults = sortedResults.slice(offset, offset + limit);

      res.json({
        results: paginatedResults,
        total: sortedResults.length,
        limit,
        offset,
        hasMore: offset + limit < sortedResults.length,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid search parameters', details: error.errors });
      }
      console.error('Error searching captures:', error);
      res.status(500).json({ error: 'Failed to search captures' });
    }
  });

  // Get search suggestions
  app.get('/api/search/suggestions', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { query } = req.query;
      if (!query || typeof query !== 'string' || query.length < 2) {
        return res.json([]);
      }

      // Get user's captures for suggestions
      const captures = await storage.getUserCaptures(req.session.user.id);
      
      // Extract unique tags and titles for suggestions
      const suggestions = new Set<string>();
      
      captures.forEach(capture => {
        // Add matching titles
        if (capture.title?.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(capture.title);
        }
        
        // Add matching tags
        if (Array.isArray(capture.tags)) {
          (capture.tags as string[]).forEach(tag => {
            if (tag.toLowerCase().includes(query.toLowerCase())) {
              suggestions.add(tag);
            }
          });
        }
      });

      // Limit to top 10 suggestions
      const suggestionArray = Array.from(suggestions).slice(0, 10);
      
      res.json(suggestionArray);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
  });

  // Save search
  app.post('/api/search/saved', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { name, query, filters } = req.body;
      
      if (!name || !query) {
        return res.status(400).json({ error: 'Name and query are required' });
      }

      // Get current settings
      const settings = await storage.getUserSettings(req.session.user.id);
      
      const savedSearches = settings?.searchSettings?.savedSearches || [];
      
      // Add new saved search
      savedSearches.push({ name, query, filters: filters || {} });
      
      // Update settings
      const updated = await storage.updateUserSettings(req.session.user.id, {
        searchSettings: {
          ...settings?.searchSettings,
          savedSearches,
        },
      });

      res.json(updated.searchSettings);
    } catch (error) {
      console.error('Error saving search:', error);
      res.status(500).json({ error: 'Failed to save search' });
    }
  });

  // Get saved searches
  app.get('/api/search/saved', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const settings = await storage.getUserSettings(req.session.user.id);
      const savedSearches = settings?.searchSettings?.savedSearches || [];
      
      res.json(savedSearches);
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      res.status(500).json({ error: 'Failed to fetch saved searches' });
    }
  });

  // Delete saved search
  app.delete('/api/search/saved/:index', async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const index = parseInt(req.params.index);
      
      if (isNaN(index) || index < 0) {
        return res.status(400).json({ error: 'Invalid search index' });
      }

      const settings = await storage.getUserSettings(req.session.user.id);
      const savedSearches = settings?.searchSettings?.savedSearches || [];
      
      if (index >= savedSearches.length) {
        return res.status(404).json({ error: 'Search not found' });
      }

      // Remove search at index
      savedSearches.splice(index, 1);
      
      // Update settings
      const updated = await storage.updateUserSettings(req.session.user.id, {
        searchSettings: {
          ...settings?.searchSettings,
          savedSearches,
        },
      });

      res.json(updated.searchSettings);
    } catch (error) {
      console.error('Error deleting saved search:', error);
      res.status(500).json({ error: 'Failed to delete saved search' });
    }
  });
}