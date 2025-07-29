import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scheduler } from "./services/scheduler";
import { BrightDataService } from "./services/brightDataService";
import { BrightDataBrowserService } from "./services/brightDataBrowser";
import { EnhancedBrightDataService } from "./services/enhancedBrightDataService";
import { AIAnalyzer } from "./services/aiAnalyzer";
import { insertContentRadarSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const aiAnalyzer = new AIAnalyzer();
  const brightData = new BrightDataService();
  const brightDataBrowser = new BrightDataBrowserService();
  const enhancedBrightData = new EnhancedBrightDataService();

  // Get dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Get content items with filtering
  app.get("/api/content", async (req, res) => {
    try {
      const {
        category,
        platform,
        timeRange,
        sortBy,
        limit = '50',
        offset = '0'
      } = req.query;

      const filters = {
        category: category as string,
        platform: platform as string,
        timeRange: timeRange as string,
        sortBy: sortBy as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      const items = await storage.getContentItems(filters);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // Get single content item
  app.get("/api/content/:id", async (req, res) => {
    try {
      const item = await storage.getContentItemById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content item" });
    }
  });

  // Create content item
  app.post("/api/content", async (req, res) => {
    try {
      const validatedData = insertContentRadarSchema.parse(req.body);
      const item = await storage.createContentItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create content item" });
    }
  });

  // Update content item
  app.patch("/api/content/:id", async (req, res) => {
    try {
      const updates = req.body;
      const item = await storage.updateContentItem(req.params.id, updates);
      if (!item) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update content item" });
    }
  });

  // Delete content item
  app.delete("/api/content/:id", async (req, res) => {
    try {
      const success = await storage.deleteContentItem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete content item" });
    }
  });

  // Run manual scan
  app.post("/api/scan", async (req, res) => {
    try {
      const result = await scheduler.runScan();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to run scan" });
    }
  });

  // Test Bright Data API connection and fetch sample data
  app.post("/api/brightdata/test", async (req, res) => {
    try {
      console.log('Testing Bright Data API connection...');
      const { platform = 'reddit' } = req.body;
      
      let sampleData: any[] = [];
      
      switch (platform) {
        case 'reddit':
          sampleData = await brightData.fetchRedditTrending(['popular', 'technology']);
          break;
        case 'instagram':
          sampleData = await brightData.fetchInstagramTrending(['trending', 'tech']);
          break;
        case 'youtube':
          sampleData = await brightData.fetchYouTubeTrending(['trending', 'technology']);
          break;
        case 'tiktok':
          sampleData = await brightData.fetchTikTokTrending(['fyp', 'tech']);
          break;
        case 'twitter':
          sampleData = await brightData.fetchTwitterTrending(['trending', 'tech']);
          break;
        case 'all':
          sampleData = await brightData.fetchAllTrendingContent();
          break;
        default:
          return res.status(400).json({ error: 'Invalid platform' });
      }
      
      res.json({
        success: true,
        method: 'API',
        platform,
        itemsFound: sampleData.length,
        sampleData: sampleData.slice(0, 5), // Return first 5 items as sample
        message: `Successfully fetched ${sampleData.length} items from ${platform} using Bright Data API`
      });
      
    } catch (error: any) {
      console.error('Bright Data API test error:', error);
      res.status(500).json({ 
        error: "Bright Data API test failed", 
        details: error.message,
        platform: req.body.platform || 'unknown'
      });
    }
  });

  // Test Bright Data Browser automation and fetch sample data
  app.post("/api/brightdata/browser/test", async (req, res) => {
    try {
      console.log('Testing Bright Data Browser automation...');
      const { platform = 'reddit' } = req.body;
      
      let sampleData: any[] = [];
      
      switch (platform) {
        case 'reddit':
          sampleData = await brightDataBrowser.fetchInstagramContent(['reddit', 'technology']);
          break;
        case 'instagram':
          sampleData = await brightDataBrowser.fetchInstagramContent(['trending', 'tech']);
          break;
        case 'tiktok':
          sampleData = await brightDataBrowser.fetchTikTokTrends();
          break;
        case 'twitter':
          sampleData = await brightDataBrowser.fetchInstagramContent(['twitter', 'tech']);
          break;
        case 'all':
          sampleData = await brightDataBrowser.fetchInstagramContent(['trending', 'viral']);
          break;
        default:
          return res.status(400).json({ error: 'Invalid platform for browser scraping' });
      }
      
      res.json({
        success: true,
        method: 'Browser Automation',
        platform,
        itemsFound: sampleData.length,
        sampleData: sampleData.slice(0, 5), // Return first 5 items as sample
        message: `Successfully scraped ${sampleData.length} items from ${platform} using Bright Data Browser`
      });
      
    } catch (error: any) {
      console.error('Bright Data Browser test error:', error);
      res.status(500).json({ 
        error: "Bright Data Browser test failed", 
        details: error.message,
        platform: req.body.platform || 'unknown'
      });
    }
  });

  // Get scan history
  app.get("/api/scans", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const scans = await storage.getRecentScans(limit);
      res.json(scans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scan history" });
    }
  });

  // Generate additional hooks
  app.post("/api/content/:id/hooks", async (req, res) => {
    try {
      const item = await storage.getContentItemById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Content not found" });
      }

      const existingHooks = [item.hook1, item.hook2].filter(Boolean) as string[];
      const newHooks = await aiAnalyzer.generateAdditionalHooks(
        item.title,
        item.content || '',
        existingHooks
      );

      res.json({ hooks: newHooks });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate hooks" });
    }
  });

  // Export data
  app.get("/api/export", async (req, res) => {
    try {
      const format = req.query.format as string || 'json';
      const items = await storage.getContentItems({ limit: 1000 });

      if (format === 'csv') {
        const csv = convertToCSV(items);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=content-radar-export.csv');
        res.send(csv);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=content-radar-export.json');
        res.json(items);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // Schedule management
  app.post("/api/schedule/start", async (req, res) => {
    try {
      const { intervalMinutes = 15 } = req.body;
      scheduler.startScheduledScans(intervalMinutes);
      res.json({ success: true, message: `Scheduled scans started (every ${intervalMinutes} minutes)` });
    } catch (error) {
      res.status(500).json({ error: "Failed to start scheduled scans" });
    }
  });

  app.post("/api/schedule/stop", async (req, res) => {
    try {
      scheduler.stopScheduledScans();
      res.json({ success: true, message: "Scheduled scans stopped" });
    } catch (error) {
      res.status(500).json({ error: "Failed to stop scheduled scans" });
    }
  });

  app.get("/api/schedule/status", async (req, res) => {
    try {
      const isActive = scheduler.isScheduledScanActive();
      res.json({ isActive });
    } catch (error) {
      res.status(500).json({ error: "Failed to get schedule status" });
    }
  });

  // Search functionality
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query required" });
      }

      const allItems = await storage.getContentItems({ limit: 1000 });
      const filteredItems = allItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.content && item.content.toLowerCase().includes(query.toLowerCase())) ||
        (item.summary && item.summary.toLowerCase().includes(query.toLowerCase()))
      );

      res.json(filteredItems);
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Auto-scanning disabled by default - users must manually start it
  console.log('📋 Scheduler initialized (auto-scan disabled by default)');

  const httpServer = createServer(app);
  return httpServer;
}

function convertToCSV(items: any[]): string {
  if (items.length === 0) return '';
  
  const headers = Object.keys(items[0]).join(',');
  const rows = items.map(item => 
    Object.values(item).map(value => 
      typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
}
