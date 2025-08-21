import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { mapProject } from "../lib/mappers";
import { requireAuth } from "../middleware/supabase-auth";
import type { AuthedRequest } from "../middleware/supabase-auth";

export function registerProjectsRoutes(app: Express) {
  
  // Get all projects for user
  app.get('/api/projects', requireAuth, async (req: AuthedRequest, res: Response) => {
    try {
      const user = req.user!;

      const projects = await storage.getProjects(user.id);
      const projectDTOs = projects.map(mapProject);
      
      res.json(projectDTOs);
    } catch (error) {
      console.error('Projects list error:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  // Create new project
  app.post('/api/projects', requireAuth, async (req: AuthedRequest, res: Response) => {
    try {
      const user = req.user!;

      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
      }

      const project = await storage.createProject({
        userId: user.id,
        name,
        description: description || null
      });

      res.status(201).json(mapProject(project));
    } catch (error) {
      console.error('Project creation error:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  // Update project
  app.patch('/api/projects/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
    try {
      const user = req.user!;

      const { id } = req.params;
      const { name, description } = req.body;
      
      const project = await storage.updateProject(id, {
        name,
        description
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json(mapProject(project));
    } catch (error) {
      console.error('Project update error:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  });

  // Delete project (optional for now)
  app.delete('/api/projects/:id', requireAuth, async (req: AuthedRequest, res: Response) => {
    try {
      const user = req.user!;

      const { id } = req.params;
      await storage.deleteProject(id);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Project deletion error:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  });
}