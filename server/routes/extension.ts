import { Router, Response } from "express";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { storage } from "../storage";
import { AIAnalyzer } from "../services/aiAnalyzer";
import { productionMonitor } from "../monitoring/productionMonitor";
import { sanitizeInput } from "../utils/sanitize";
import { z } from "zod";

const aiAnalyzer = new AIAnalyzer();

export const extensionRouter = Router();

// GET /api/extension/active-project
extensionRouter.get("/extension/active-project", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const projects = await storage.getProjects(req.user!.id);
    const activeProject = projects.find((p: any) => p.status === "active") || projects[0];

    if (!activeProject) {
      return res.status(404).json({ error: "No projects found" });
    }

    res.json({
      success: true,
      project: {
        id: activeProject.id,
        name: activeProject.name,
        description: activeProject.description,
      },
    });
  } catch (error) {
    console.error("Extension active project error:", error);
    res.status(500).json({ error: "Failed to get active project" });
  }
});

const extensionCaptureSchema = z.object({
  projectId: z.string().uuid().optional(),
  content: z.string().min(1),
  url: z.string().url().optional(),
  platform: z.string().optional(),
  type: z.string().optional().default("extension"),
  priority: z.enum(["low", "normal", "high"]).optional().default("normal"),
});

// POST /api/extension/capture
extensionRouter.post("/extension/capture", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const parsed = extensionCaptureSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
    }
    const { projectId, content, url, platform, type, priority } = parsed.data;

    // Track extension request
    const extensionId = req.headers["x-extension-id"] as string | undefined;
    if (extensionId) productionMonitor.trackExtensionRequest(extensionId);

    const safeContent = sanitizeInput(content);
    const userId = req.user!.id;
    const fallbackProjectId = (await storage.getProjects(userId))[0]?.id;

    const capture = await storage.createCapture({
      userId,
      projectId: projectId || fallbackProjectId,
      type: type || "extension",
      content: safeContent,
      url,
      platform: platform || "web",
      title: `Extension Capture - ${new Date().toLocaleString()}`,
      analysisStatus: "pending",
    });

    if (safeContent.length > 50) {
      try {
        const analysis = await aiAnalyzer.analyzeContent("Extension Capture", safeContent, platform || "web");
        await storage.updateCapture(capture.id, { viralScore: analysis.viralScore, analysisStatus: "completed" });
      } catch (e) {
        console.warn("Analysis failed for extension capture:", e);
      }
    }

    res.json({
      success: true,
      capture: { id: capture.id, title: capture.title, createdAt: capture.createdAt },
    });
  } catch (error) {
    console.error("Extension capture error:", error);

    const extensionId = req.headers["x-extension-id"] as string | undefined;
    if (extensionId) {
      productionMonitor.trackExtensionRequest(extensionId, error instanceof Error ? error.message : "Unknown error");
    }

    res.status(500).json({
      error: "Failed to create capture",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});