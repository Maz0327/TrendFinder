import type { Express } from "express";
import { storage } from "../storage";
import { insertBriefSchema } from "@shared/schema";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

export function registerBriefRoutes(app: Express) {
  // Get all briefs for a project
  app.get("/api/briefs", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { projectId } = req.query;
      if (!projectId) {
        return res.status(400).json({ error: "Project ID required" });
      }
      
      const briefs = await storage.getBriefs(projectId as string);
      res.json(briefs);
    } catch (error) {
      console.error("Failed to fetch briefs:", error);
      res.status(500).json({ error: "Failed to fetch briefs" });
    }
  });

  // Get single brief
  app.get("/api/briefs/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const brief = await storage.getBriefById(req.params.id);
      if (!brief) {
        return res.status(404).json({ error: "Brief not found" });
      }
      
      res.json(brief);
    } catch (error) {
      console.error("Failed to fetch brief:", error);
      res.status(500).json({ error: "Failed to fetch brief" });
    }
  });

  // Create new brief
  app.post("/api/briefs", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const validatedData = insertBriefSchema.parse(req.body);
      
      // Verify project ownership
      const project = await storage.getProjectById(validatedData.projectId);
      if (!project || project.userId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const brief = await storage.createBrief(validatedData);
      res.json(brief);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Failed to create brief:", error);
      res.status(500).json({ error: "Failed to create brief" });
    }
  });

  // Update brief
  app.patch("/api/briefs/:id", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const brief = await storage.getBriefById(req.params.id);
      if (!brief) {
        return res.status(404).json({ error: "Brief not found" });
      }
      
      // Verify project ownership
      const project = await storage.getProjectById(brief.projectId);
      if (!project || project.userId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updatedBrief = await storage.updateBrief(req.params.id, req.body);
      res.json(updatedBrief);
    } catch (error) {
      console.error("Failed to update brief:", error);
      res.status(500).json({ error: "Failed to update brief" });
    }
  });

  // Generate brief content with AI
  app.post("/api/briefs/generate", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { projectId, title, description, sections, captures } = req.body;
      
      // Verify project ownership
      const project = await storage.getProjectById(projectId);
      if (!project || project.userId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Build AI prompt based on Jimmy John's format
      const prompt = buildBriefPrompt(title, description, sections, captures);
      
      // Call OpenAI to generate content
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a strategic creative brief writer who follows the Jimmy John's brief format. Generate compelling brief content based on the captures and insights provided. Focus on clear, actionable insights that drive creative strategy."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        throw new Error("AI generation failed");
      }
      
      const result = await response.json();
      const generatedContent = JSON.parse(result.choices[0].message.content);
      
      // Merge AI-generated content with existing sections
      const enhancedSections = mergeSectionsWithAI(sections, generatedContent);
      
      res.json({ sections: enhancedSections });
    } catch (error) {
      console.error("Failed to generate brief:", error);
      res.status(500).json({ error: "Failed to generate brief content" });
    }
  });

  // Export brief
  app.post("/api/briefs/export", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { format, title, description, sections, captures } = req.body;
      
      let exportData: Buffer;
      let contentType: string;
      let extension: string;
      
      switch (format) {
        case 'markdown':
          exportData = Buffer.from(generateMarkdown(title, description, sections, captures));
          contentType = 'text/markdown';
          extension = 'md';
          break;
          
        case 'pdf':
          // TODO: Implement PDF generation using puppeteer or similar
          exportData = Buffer.from(generateMarkdown(title, description, sections, captures));
          contentType = 'application/pdf';
          extension = 'pdf';
          break;
          
        case 'slides':
          // TODO: Implement slides generation
          exportData = Buffer.from(generateMarkdown(title, description, sections, captures));
          contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          extension = 'pptx';
          break;
          
        default:
          return res.status(400).json({ error: "Invalid export format" });
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '-')}.${extension}"`);
      res.send(exportData);
    } catch (error) {
      console.error("Failed to export brief:", error);
      res.status(500).json({ error: "Failed to export brief" });
    }
  });
}

function buildBriefPrompt(title: string, description: string, sections: any, captures: any[]) {
  const captureInsights = captures.map(c => ({
    title: c.title,
    content: c.content,
    truthAnalysis: c.truthAnalysis,
    platform: c.platform
  }));
  
  return `
Create a strategic brief titled "${title}" with the following context:
${description}

Based on these captures and insights:
${JSON.stringify(captureInsights, null, 2)}

Generate content for each section following the Jimmy John's brief format:
1. Performance - Key metrics and results that matter
2. Cultural Signals - Emerging cultural trends and behaviors
3. Platform Signals - Platform-specific trends and features
4. Opportunities - Strategic opportunities to pursue
5. Cohorts - Target audience segments
6. Ideation - Creative concepts and ideas

Current section drafts:
${JSON.stringify(sections, null, 2)}

Please enhance and complete each section with strategic insights drawn from the captures. Return as JSON with the same structure.
`;
}

function mergeSectionsWithAI(currentSections: any, aiGenerated: any) {
  const merged: any = {};
  
  for (const [key, section] of Object.entries(currentSections)) {
    merged[key] = {
      ...section as any,
      content: aiGenerated[key]?.content || (section as any).content || ""
    };
  }
  
  return merged;
}

function generateMarkdown(title: string, description: string, sections: any, captures: any[]) {
  let markdown = `# ${title}\n\n`;
  
  if (description) {
    markdown += `${description}\n\n---\n\n`;
  }
  
  const sectionOrder = ['performance', 'cultural-signals', 'platform-signals', 'opportunities', 'cohorts', 'ideation'];
  const sectionTitles: Record<string, string> = {
    'performance': '## Performance',
    'cultural-signals': '## Cultural Signals',
    'platform-signals': '## Platform Signals',
    'opportunities': '## Opportunities',
    'cohorts': '## Cohorts',
    'ideation': '## Ideation'
  };
  
  for (const sectionKey of sectionOrder) {
    const section = sections[sectionKey];
    if (section && section.content) {
      markdown += `${sectionTitles[sectionKey]}\n\n${section.content}\n\n`;
      
      // Add related captures
      if (section.captures && section.captures.length > 0) {
        markdown += `### Supporting Evidence\n\n`;
        for (const captureId of section.captures) {
          const capture = captures.find(c => c.id === captureId);
          if (capture) {
            markdown += `- **${capture.title}** (${capture.platform || 'Web'})\n`;
            if (capture.truthAnalysis?.humanTruth) {
              markdown += `  - Truth: ${capture.truthAnalysis.humanTruth}\n`;
            }
          }
        }
        markdown += '\n';
      }
    }
  }
  
  return markdown;
}