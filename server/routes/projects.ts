import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { mapProject } from "../lib/mappers";
import { getUserFromRequest } from "./auth";

export function registerProjectsRoutes(app: Express) {
  
  // Get all projects for user
  app.get('/api/projects', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const projects = await storage.listProjects(user.id);
      const projectDTOs = projects.map(mapProject);
      
      res.json(projectDTOs);
    } catch (error) {
      console.error('Projects list error:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  // Create new project
  app.post('/api/projects', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Project name is required' });
      }

      const project = await storage.createProject({
        user_id: user.id,
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
  app.patch('/api/projects/:id', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const { name, description } = req.body;
      
      const project = await storage.updateProject(id, {
        name,
        description,
        updated_at: new Date().toISOString()
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
  app.delete('/api/projects/:id', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      await storage.deleteProject(id);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Project deletion error:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  });
}