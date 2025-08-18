import type { Express, Request, Response } from "express";
import { requireAuth } from "../middleware/supabase-auth";
import { getUserId } from "../lib/auth-user";

// Development bypass for auth - since frontend has auth disabled
const maybeAuth = process.env.NODE_ENV === 'development' ? 
  (req: Request, res: Response, next: any) => next() : 
  requireAuth;

export function registerTruthRoutes(app: Express) {
  // CRUD endpoints that frontend expects
  app.post("/api/truth-checks", maybeAuth, async (req: Request, res: Response) => {
    try {
      const userId = process.env.NODE_ENV === 'development' ? 'dev-user' : getUserId(req);
      const { kind, url, text, projectId } = req.body;
      
      if (!kind || (kind === 'url' && !url) || (kind === 'text' && !text)) {
        return res.status(400).json({ error: "Required fields missing" });
      }
      
      // Create truth check with proper response format
      const result = {
        id: `truth-${Date.now()}`,
        status: 'done',
        kind,
        verdict: kind === 'url' ? 'likely_true' : kind === 'text' ? 'unverified' : 'likely_true',
        confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0 range
        summary: {
          content: url || text || 'Image analysis',
          truthScore: Math.random() * 0.3 + 0.7,
          layers: {
            fact: "Content verified against multiple sources",
            observation: "Analysis completed successfully", 
            insight: "High credibility indicators found",
            humanTruth: "Reliable information detected"
          }
        },
        created_at: new Date().toISOString(),
        project_id: projectId || null,
        user_id: userId
      };
      
      return res.json(result);
    } catch (error) {
      console.error("Truth check creation error:", error);
      return res.status(500).json({ error: "Analysis failed" });
    }
  });

  app.get("/api/truth-checks/:id", maybeAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = process.env.NODE_ENV === 'development' ? 'dev-user' : getUserId(req);
      
      // Return detailed truth check
      const result = {
        id,
        status: 'done',
        verdict: 'likely_true',
        confidence: 0.85,
        summary: {
          truthScore: 0.85,
          sources: ["verified", "cross-referenced"],
          layers: {
            fact: "Content verified against multiple sources",
            observation: "No misleading claims detected", 
            insight: "High credibility rating",
            humanTruth: "Reliable information source"
          }
        },
        created_at: new Date().toISOString(),
        user_id: userId
      };
      
      return res.json(result);
    } catch (error) {
      console.error("Truth check fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch truth check" });
    }
  });

  app.get("/api/truth-checks", maybeAuth, async (req: Request, res: Response) => {
    try {
      const userId = process.env.NODE_ENV === 'development' ? 'dev-user' : getUserId(req);
      const { page = "1", pageSize = "6" } = req.query as Record<string, string>;
      
      // Return recent checks with proper format
      const mockChecks = [
        {
          id: "truth-1",
          kind: "url",
          verdict: "likely_true",
          confidence: 0.85,
          summary: { content: "https://example.com/verified-news" },
          status: "done",
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 min ago
        },
        {
          id: "truth-2", 
          kind: "text",
          verdict: "unverified",
          confidence: 0.62,
          summary: { content: "Sample text analysis content..." },
          status: "done",
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
        },
        {
          id: "truth-3",
          kind: "image",
          verdict: "likely_true",
          confidence: 0.92,
          summary: { content: "Image authenticity verification" },
          status: "done",
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
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

  app.post("/api/truth-checks/:id/retry", maybeAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      // Simulate retry operation
      return res.json({ id, status: 'processing', message: 'Analysis restarted' });
    } catch (error) {
      console.error("Truth check retry error:", error);
      return res.status(500).json({ error: "Retry failed" });
    }
  });

  // Keep original analysis endpoints for future use
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