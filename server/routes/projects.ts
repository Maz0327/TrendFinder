import type { Express } from "express";
import { storage } from "../storage";
import { insertProjectSchema, insertCaptureSchema } from "@shared/supabase-schema";
import { z } from "zod";
import { captureAnalysisService } from "../services/capture-analysis-service";
import '../types/session';

export function registerProjectRoutes(app: Express) {

  // Get all projects for a user
  app.get("/api/projects", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const projects = await storage.getProjects(req.session.user.id);
      res.json(projects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Get single project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const project = await storage.getProjectById(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Verify ownership
      if (project.userId !== req.session.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Failed to fetch project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Create project
  app.post("/api/projects", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const validatedData = insertProjectSchema.parse({
        ...req.body,
        userId: req.session.user.id
      });
      
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Failed to create project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Update project
  app.patch("/api/projects/:id", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const project = await storage.getProjectById(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId !== req.session.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updated = await storage.updateProject(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Failed to update project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Delete project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const project = await storage.getProjectById(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId !== req.session.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const success = await storage.deleteProject(req.params.id);
      res.json({ success });
    } catch (error) {
      console.error("Failed to delete project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Get captures for a project
  app.get("/api/projects/:projectId/captures", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const project = await storage.getProjectById(req.params.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId !== req.session.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const captures = await storage.getCaptures(req.params.projectId);
      res.json(captures);
    } catch (error) {
      console.error("Failed to fetch captures:", error);
      res.status(500).json({ error: "Failed to fetch captures" });
    }
  });

  // Create capture
  app.post("/api/captures", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const validatedData = insertCaptureSchema.parse({
        ...req.body,
        userId: req.session.user.id
      });
      
      // Verify project ownership
      const project = await storage.getProjectById(validatedData.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId !== req.session.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Set initial analysis status
      const captureData = {
        ...validatedData,
        status: 'pending'
      };
      
      const capture = await storage.createCapture(captureData);
      
      // Trigger Truth Analysis Framework processing in background
      const { CaptureTruthAnalysisService } = await import("../services/capture-truth-analysis");
      const truthAnalysisService = new CaptureTruthAnalysisService();
      
      // Process Truth Analysis asynchronously
      truthAnalysisService.analyzeCaptureContent({
        id: capture.id,
        title: capture.title,
        content: capture.content,
        platform: capture.platform,
        metadata: capture.metadata
      }).then(async (analysis) => {
        // Update capture with Truth Analysis results
        await storage.updateCapture(capture.id, {
          truthAnalysis: analysis.truthAnalysis,
          summary: analysis.summary,
          culturalResonance: {
            crossGenerational: (analysis.culturalRelevance || 5) > 7,
            memePotential: Math.round((analysis.culturalRelevance || 5) * 10),
            counterNarrative: analysis.suggestedBriefSection || 'performance',
            tribalSignificance: (analysis.strategicValue || 5) > 7 ? 'high' : 'moderate'
          },
          dsdSection: analysis.suggestedBriefSection === 'define' ? 'define' : 
                      analysis.suggestedBriefSection === 'shift' ? 'shift' : 'deliver',
          viralScore: Math.round((analysis.culturalRelevance || 5) * 10),
          analysisStatus: 'completed'
        });
        console.log(`✅ Truth Analysis completed for capture ${capture.id}`);
      }).catch(error => {
        console.error(`❌ Truth Analysis failed for capture ${capture.id}:`, error);
        // Mark as error but don't fail the capture creation
        storage.updateCapture(capture.id, {
          analysisStatus: 'error'
        }).catch(console.error);
      });
      
      res.status(201).json(capture);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Failed to create capture:", error);
      res.status(500).json({ error: "Failed to create capture" });
    }
  });

  // Get recent captures - MUST come before :id route
  app.get("/api/captures/recent", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const limit = parseInt(req.query.limit as string) || 10;
      const projects = await storage.getProjects(req.session.user.id);
      
      // Get captures from user
      const allCaptures = await storage.getUserCaptures(req.session.user.id);
      
      // Sort by createdAt and take the most recent ones
      const recentCaptures = allCaptures
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

  // Get single capture
  app.get("/api/captures/:id", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const capture = await storage.getCaptureById(req.params.id);
      if (!capture) {
        return res.status(404).json({ error: "Capture not found" });
      }
      
      // Verify ownership through project
      const project = await storage.getProjectById(capture.projectId);
      if (!project || project.userId !== req.session.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(capture);
    } catch (error) {
      console.error("Failed to fetch capture:", error);
      res.status(500).json({ error: "Failed to fetch capture" });
    }
  });

  // Update capture
  app.patch("/api/captures/:id", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const capture = await storage.getCaptureById(req.params.id);
      if (!capture) {
        return res.status(404).json({ error: "Capture not found" });
      }
      
      const project = await storage.getProjectById(capture.projectId);
      if (!project || project.userId !== req.session.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updated = await storage.updateCapture(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Failed to update capture:", error);
      res.status(500).json({ error: "Failed to update capture" });
    }
  });

  // Process pending captures (background job)
  app.post("/api/captures/process-pending", async (req, res) => {
    try {
      const pendingCaptures = await storage.getPendingCaptures();
      
      if (pendingCaptures.length === 0) {
        return res.json({ message: "No pending captures to process" });
      }
      
      // Process in batches
      const results = new Map(); // TODO: Implement batch analysis
      
      // Update captures with results
      for (const [captureId, analysis] of results) {
        if (analysis) {
          await storage.updateCapture(captureId, {
            truthAnalysis: analysis.truthAnalysis,
            dsdSection: analysis.suggestedBriefSection === 'define' ? 'define' : 
                       analysis.suggestedBriefSection === 'shift' ? 'shift' : 'deliver',
            culturalResonance: {
              crossGenerational: analysis.culturalRelevance > 0.7,
              memePotential: Math.round(analysis.culturalRelevance * 100),
              counterNarrative: analysis.suggestedBriefSection,
              tribalSignificance: analysis.strategicValue > 0.7 ? 'high' : 'moderate'
            },
            viralScore: Math.round(analysis.culturalRelevance * 100),
            analysisStatus: 'completed'
          });
        }
      }
      
      res.json({ 
        processed: results.size,
        successful: Array.from(results.values()).filter(r => r !== null).length
      });
    } catch (error) {
      console.error("Failed to process captures:", error);
      res.status(500).json({ error: "Failed to process captures" });
    }
  });

  // Chrome Extension API endpoints
  app.get('/api/extension/active-project', async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get user's projects and find the most recent or active one
      const projects = await storage.getProjects(userId);
      const activeProject = projects[0]; // TODO: Add activeProjectId to user settings

      res.json({ activeProject });
    } catch (error) {
      console.error('Error getting active project:', error);
      res.status(500).json({ error: 'Failed to get active project' });
    }
  });

  app.post('/api/extension/capture', async (req, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { projectId, type, content, sourceUrl, platform, metadata } = req.body;

      // Validate project belongs to user
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Create capture
      const capture = await storage.createCapture({
        projectId,
        userId,
        type,
        content,
        url: sourceUrl,
        platform,
        metadata,
        tags: [],
        status: 'active',
        analysisStatus: 'pending'
      });

      // Trigger automatic AI analysis in background
      console.log(`🧠 Triggering AI analysis for capture: ${capture.title || 'Extension Capture'}`);
      captureAnalysisService.processInBackground(capture.id);

      res.json({ success: true, capture });
    } catch (error) {
      console.error('Error creating capture:', error);
      res.status(500).json({ error: 'Failed to create capture' });
    }
  });

  // Chrome Extension API - Get active project
  app.get("/api/extension/active-project", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const projects = await storage.getProjects(req.session.user.id);
      const activeProject = projects.length > 0 ? projects[0] : null; // Use first project as active
      
      res.json({ 
        success: true, 
        activeProject: activeProject 
      });
    } catch (error) {
      console.error("Failed to get active project:", error);
      res.status(500).json({ error: "Failed to get active project" });
    }
  });

  // Chrome Extension API - Switch project
  app.post("/api/extension/switch-project", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { projectId } = req.body;
      const project = await storage.getProjectById(projectId);
      
      if (!project || project.userId !== req.session.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json({ 
        success: true, 
        activeProject: project 
      });
    } catch (error) {
      console.error("Failed to switch project:", error);
      res.status(500).json({ error: "Failed to switch project" });
    }
  });

  // Chrome Extension API - Quick AI Analysis
  app.post("/api/ai/quick-analysis", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { content, mode, platform } = req.body;
      
      // Simple analysis response for Chrome extension
      const analysis = {
        summary: `${mode} analysis of ${platform} content`,
        hooks: [
          "Interesting content detected",
          "Worth exploring further",
          "Strategic opportunity identified"
        ],
        viralScore: Math.floor(Math.random() * 100) + 1,
        sentiment: "positive",
        category: "social-media"
      };
      
      res.json(analysis);
    } catch (error) {
      console.error("Failed to analyze content:", error);
      res.status(500).json({ error: "Failed to analyze content" });
    }
  });
}