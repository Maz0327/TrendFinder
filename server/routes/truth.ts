import type { Express, Request, Response } from "express";
import { requireAuth } from "../middleware/supabase-auth";
import { getUserId } from "../lib/auth-user";

export function registerTruthRoutes(app: Express) {
  app.post("/api/truth/analyze/url", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      
      // In development, return a mock analysis
      // In production, this would call your truth analysis service
      const result = {
        url,
        analysis: {
          truthScore: 0.85,
          sources: ["verified", "cross-referenced"],
          summary: "Analysis completed successfully",
          layers: {
            fact: "Content verified against multiple sources",
            observation: "No misleading claims detected", 
            insight: "High credibility rating",
            humanTruth: "Reliable information source"
          }
        },
        timestamp: new Date().toISOString()
      };
      
      return res.json({ ok: true, kind: "url", result });
    } catch (error) {
      console.error("Truth analysis error:", error);
      return res.status(500).json({ error: "Analysis failed" });
    }
  });

  app.post("/api/truth/analyze/text", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }
      
      const result = {
        text: text.substring(0, 100) + "...",
        analysis: {
          truthScore: 0.78,
          sentiment: "neutral",
          summary: "Text analysis completed",
          layers: {
            fact: "Factual content verified",
            observation: "No bias detected",
            insight: "Informative content",
            humanTruth: "Credible narrative"
          }
        },
        timestamp: new Date().toISOString()
      };
      
      return res.json({ ok: true, kind: "text", result });
    } catch (error) {
      console.error("Text analysis error:", error);
      return res.status(500).json({ error: "Analysis failed" });
    }
  });

  app.post("/api/truth/analyze/image", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      // Handle multipart form data for image upload
      
      const result = {
        analysis: {
          truthScore: 0.92,
          authenticity: "high",
          summary: "Image analysis completed",
          layers: {
            fact: "Image metadata verified",
            observation: "No manipulation detected",
            insight: "Authentic visual content",
            humanTruth: "Trustworthy image source"
          }
        },
        timestamp: new Date().toISOString()
      };
      
      return res.json({ ok: true, kind: "image", result });
    } catch (error) {
      console.error("Image analysis error:", error);
      return res.status(500).json({ error: "Analysis failed" });
    }
  });

  app.get("/api/truth/checks", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { page = "1", pageSize = "20" } = req.query as Record<string, string>;
      
      // Return mock checks for development
      const mockChecks = [
        {
          id: "check1",
          type: "url",
          content: "https://example.com/news",
          truthScore: 0.85,
          status: "completed",
          createdAt: new Date().toISOString()
        },
        {
          id: "check2", 
          type: "text",
          content: "Sample text analysis...",
          truthScore: 0.78,
          status: "completed",
          createdAt: new Date().toISOString()
        }
      ];
      
      return res.json({
        data: mockChecks,
        total: mockChecks.length,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      });
    } catch (error) {
      console.error("Error fetching truth checks:", error);
      return res.status(500).json({ error: "Failed to fetch checks" });
    }
  });
}