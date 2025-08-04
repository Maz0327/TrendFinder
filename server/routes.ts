import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { captureAnalysisService } from "./services/capture-analysis-service";
import { scheduler } from "./services/scheduler";
import { BrightDataService } from "./services/brightDataService";
import { BrightDataBrowserService } from "./services/brightDataBrowser";
import { EnhancedBrightDataService } from "./services/enhancedBrightDataService";
import { AIAnalyzer } from "./services/aiAnalyzer";
import { StrategicIntelligenceService } from "./services/strategicIntelligenceService";
import { TruthAnalysisFramework } from "./services/truthAnalysisFramework";
import { Tier2PlatformService } from "./services/tier2PlatformService";
import { BriefGenerationService } from "./services/briefGenerationService";
import { ChromeExtensionService } from "./services/chromeExtensionService";
import { FixedBrightDataService } from "./services/fixedBrightDataService";
import { LiveBrightDataService } from "./services/liveBrightDataService";
import { insertContentRadarSchema } from "@shared/supabase-schema";
import { z } from "zod";

import { registerProjectRoutes } from "./routes/projects";
import { registerBriefRoutes } from "./routes/briefs";
import googleExportsRouter from "./routes/google-exports";

export async function registerRoutes(app: Express): Promise<Server> {
  const aiAnalyzer = new AIAnalyzer();
  const brightData = new BrightDataService();
  const brightDataBrowser = new BrightDataBrowserService();
  const enhancedBrightData = new EnhancedBrightDataService();
  // Force use of working DatabaseStorage (bypasses faulty SUPABASE_DATABASE_URL)
  console.log("🔄 Using working DatabaseStorage with correct schema...");
  const db = storage; // DatabaseStorage now uses correct Supabase schema
  console.log("✅ Connected to database with public schema");
  
  const strategicIntelligence = new StrategicIntelligenceService(db);
  const truthFramework = new TruthAnalysisFramework();
  const tier2Service = new Tier2PlatformService();
  const briefService = new BriefGenerationService();
  const chromeExtensionService = new ChromeExtensionService();
  const fixedBrightData = new FixedBrightDataService();
  const liveBrightData = new LiveBrightDataService();
  
  // Initialize Tier 1 sources on startup
  // Strategic Intelligence Service ready

  // Register project and capture routes
  registerProjectRoutes(app);
  registerBriefRoutes(app);
  
  // Register Google exports routes
  app.use("/api/google", googleExportsRouter);

  // Get all captures for the user (for My Captures page)
  app.get("/api/captures/all", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const captures = await db.getUserCaptures(req.session.user.id);
      res.json(captures);
    } catch (error) {
      console.error("Error fetching user captures:", error);
      res.status(500).json({ error: "Failed to fetch captures" });
    }
  });

  // Update capture notes, custom copy, and tags
  app.patch("/api/captures/:id", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      const { notes, customCopy, tags } = req.body;

      const updatedCapture = await db.updateCapture(id, {
        userNote: notes,
        customCopy,
        tags,
        updatedAt: new Date()
      });

      res.json(updatedCapture);
    } catch (error) {
      console.error("Error updating capture:", error);
      res.status(500).json({ error: "Failed to update capture" });
    }
  });

  // Delete capture
  app.delete("/api/captures/:id", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id } = req.params;
      await storage.deleteCapture(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting capture:", error);
      res.status(500).json({ error: "Failed to delete capture" });
    }
  });

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
        details: error instanceof Error ? error.message : 'Unknown error',
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
          sampleData = []; // TODO: Implement browser scraping
          break;
        case 'instagram':
          sampleData = []; // TODO: Implement browser scraping
          break;
        case 'tiktok':
          sampleData = []; // TODO: Implement browser scraping
          break;
        case 'twitter':
          sampleData = []; // TODO: Implement browser scraping
          break;
        case 'all':
          sampleData = []; // TODO: Implement browser scraping
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
        details: error instanceof Error ? error.message : 'Unknown error',
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

      const existingHooks = item.hooks || [];
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

  // Strategic Intelligence API Endpoints
  
  // Get all sources
  app.get("/api/sources", async (req, res) => {
    try {
      const tier = req.query.tier ? parseInt(req.query.tier as string) : undefined;
      const sources = await storage.getAllSources(tier);
      res.json(sources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sources" });
    }
  });
  
  // Get signals with enhanced filtering
  app.get("/api/signals", async (req, res) => {
    try {
      const {
        category,
        signalType,
        timeRange,
        sortBy,
        limit = '50',
        offset = '0'
      } = req.query;

      const filters = {
        category: category as string,
        signalType: signalType as string,
        timeRange: timeRange as string,
        sortBy: sortBy as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      const signals = await storage.getSignals(filters);
      res.json(signals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch signals" });
    }
  });
  
  // Fetch multi-platform intelligence
  app.post("/api/intelligence/fetch", async (req, res) => {
    try {
      const { platforms, keywords = [], competitors = [], timeWindow = '24h', limit = 50 } = req.body;
      
      if (!platforms || platforms.length === 0) {
        return res.status(400).json({ error: "At least one platform is required" });
      }
      
      const signals = await strategicIntelligence.fetchMultiPlatformIntelligence({
        platforms,
        keywords,
        competitors,
        timeWindow,
        limit
      });
      
      res.json({ 
        success: true, 
        count: signals.length,
        signals 
      });
    } catch (error) {
      console.error('Error fetching intelligence:', error);
      res.status(500).json({ error: "Failed to fetch intelligence", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Get emerging trends analysis
  app.get("/api/intelligence/trends", async (req, res) => {
    try {
      const timeWindow = req.query.timeWindow as string || '7d';
      const trendReport = await strategicIntelligence.detectEmergingTrends(timeWindow);
      res.json(trendReport);
    } catch (error) {
      res.status(500).json({ error: "Failed to analyze trends" });
    }
  });

  // Phase 2: Tier 2 Platform Intelligence Routes
  
  // Get Tier 2 sources
  app.get("/api/tier2/sources", async (req, res) => {
    try {
      const sources = tier2Service.getTier2Sources();
      res.json(sources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Tier 2 sources" });
    }
  });
  
  // Fetch from specific Tier 2 platform
  app.post("/api/tier2/fetch", async (req, res) => {
    try {
      const { platform, keywords = [], limit = 20 } = req.body;
      
      if (!platform) {
        return res.status(400).json({ error: "Platform is required" });
      }
      
      const data = await tier2Service.fetchPlatformData(platform, keywords, limit);
      res.json({ 
        success: true, 
        platform,
        count: data.length,
        data 
      });
    } catch (error) {
      console.error('Error fetching Tier 2 data:', error);
      res.status(500).json({ error: "Failed to fetch Tier 2 data", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Phase 3: Truth Analysis Framework Routes
  
  // Analyze content with truth framework
  app.post("/api/truth-analysis/analyze", async (req, res) => {
    try {
      const { content, platform, metadata = {} } = req.body;
      
      if (!content || !platform) {
        return res.status(400).json({ error: "Content and platform are required" });
      }
      
      const analysis = await truthFramework.analyzeContent(content, platform, metadata);
      res.json(analysis);
    } catch (error) {
      console.error('Error in truth analysis:', error);
      res.status(500).json({ error: "Failed to analyze content", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Phase 4: Strategic Brief Generation Routes
  
  // Get available brief templates
  app.get("/api/briefs/templates", async (req, res) => {
    try {
      const templates = briefService.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });
  
  // Generate strategic brief
  app.post("/api/briefs/generate", async (req, res) => {
    try {
      const { 
        templateId, 
        signals = [], 
        culturalMoments = [], 
        trends = [], 
        metadata = {} 
      } = req.body;
      
      if (!templateId) {
        return res.status(400).json({ error: "Template ID is required" });
      }
      
      const brief = await briefService.generateBrief(
        templateId,
        signals,
        culturalMoments,
        trends,
        metadata
      );
      
      res.json(brief);
    } catch (error) {
      console.error('Error generating brief:', error);
      res.status(500).json({ error: "Failed to generate brief", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Phase 5: Comprehensive Intelligence Pipeline
  
  // Run complete intelligence pipeline
  app.post("/api/intelligence/comprehensive", async (req, res) => {
    try {
      const { 
        tier1Platforms = ['twitter', 'linkedin'], 
        tier2Platforms = ['reddit', 'hackernews'],
        keywords = [], 
        limit = 50,
        generateBrief = false,
        templateId = 'jimmyjohns_strategic'
      } = req.body;
      
      console.log('[Comprehensive Intelligence] Starting pipeline...');
      
      // Step 1: Fetch Tier 1 intelligence
      const tier1Signals = await strategicIntelligence.fetchMultiPlatformIntelligence({
        platforms: tier1Platforms,
        keywords,
        timeWindow: '24h',
        limit: Math.floor(limit * 0.7) // 70% from Tier 1
      });
      
      // Step 2: Fetch Tier 2 intelligence
      const tier2Data = [];
      for (const platform of tier2Platforms) {
        const data = await tier2Service.fetchPlatformData(platform, keywords, Math.floor(limit * 0.3 / tier2Platforms.length));
        tier2Data.push(...data);
      }
      
      // Step 3: Analyze trends and cultural moments
      const allSignals = [...tier1Signals, ...tier2Data];
      const trends = await strategicIntelligence.detectEmergingTrends('7d');
      const culturalMoments = await strategicIntelligence.correlateCulturalMoments(allSignals);
      
      // Step 4: Generate brief if requested
      let brief = null;
      if (generateBrief && allSignals.length > 0) {
        brief = await briefService.generateBrief(
          templateId,
          allSignals,
          Array.isArray(culturalMoments) ? culturalMoments : [],
          trends.trends || [],
          {
            project: `Intelligence Report ${new Date().toLocaleDateString()}`,
            platforms: [...tier1Platforms, ...tier2Platforms],
            keywords,
            timeRange: '24h'
          }
        );
      }
      
      console.log(`[Comprehensive Intelligence] Collected ${allSignals.length} total signals`);
      
      res.json({
        success: true,
        tier1Signals: tier1Signals.length,
        tier2Signals: tier2Data.length,
        totalSignals: allSignals.length,
        trends: trends.trends?.length || 0,
        culturalMoments: Array.isArray(culturalMoments) ? culturalMoments.length : 0,
        brief: brief ? brief.id : null,
        data: {
          signals: allSignals,
          trends,
          culturalMoments,
          brief
        }
      });
      
    } catch (error) {
      console.error('Error in comprehensive intelligence:', error);
      res.status(500).json({ error: "Failed to run comprehensive intelligence", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Phase 6: Chrome Extension Integration Routes
  
  // Process content captured from Chrome extension
  app.post("/api/chrome-extension/capture", async (req, res) => {
    try {
      const contentData = req.body;
      
      // Validate content data
      const validation = chromeExtensionService.validateContentData(contentData);
      if (!validation.valid) {
        return res.status(400).json({ error: "Invalid content data", details: validation.errors });
      }
      
      const analysis = await chromeExtensionService.processCapturedContent(contentData);
      res.json(analysis);
    } catch (error) {
      console.error('Error processing extension capture:', error);
      res.status(500).json({ error: "Failed to process captured content", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Batch process multiple captured contents
  app.post("/api/chrome-extension/batch", async (req, res) => {
    try {
      const { contents } = req.body;
      
      if (!Array.isArray(contents)) {
        return res.status(400).json({ error: "Contents array is required" });
      }
      
      const analyses = await chromeExtensionService.processBatchContent(contents);
      res.json({
        success: true,
        processed: analyses.length,
        analyses
      });
    } catch (error) {
      console.error('Error processing extension batch:', error);
      res.status(500).json({ error: "Failed to process batch content", details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });
  
  // Get extension stats and capabilities
  app.get("/api/chrome-extension/stats", async (req, res) => {
    try {
      const stats = chromeExtensionService.getExtensionStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch extension stats" });
    }
  });

  // Phase 7: System Health and Status Routes
  
  // Get comprehensive system status
  app.get("/api/system/status", async (req, res) => {
    try {
      const status = {
        timestamp: new Date().toISOString(),
        services: {
          strategicIntelligence: 'operational',
          truthAnalysis: 'operational',
          tier2Platforms: 'operational',
          briefGeneration: 'operational',
          chromeExtension: 'operational'
        },
        platforms: {
          tier1: {
            twitter: 'configured',
            linkedin: 'configured',
            instagram: 'configured',
            tiktok: 'configured',
            medium: 'configured'
          },
          tier2: tier2Service.getTier2Sources().reduce((acc, source) => {
            acc[source.name] = source.isActive ? 'active' : 'inactive';
            return acc;
          }, {} as Record<string, string>)
        },
        briefTemplates: briefService.getTemplates().length,
        version: '2.0.0',
        buildInfo: {
          phase1: 'complete',
          phase2: 'complete',
          phase3: 'complete',
          phase4: 'complete',
          phase5: 'complete',
          phase6: 'complete'
        }
      };
      
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get system status" });
    }
  });

  // Bright Data API Configuration and Testing Routes
  
  // Test Bright Data API connection
  app.get("/api/bright-data/test", async (req, res) => {
    try {
      const testResult = await fixedBrightData.testConnection();
      res.json(testResult);
    } catch (error) {
      res.status(500).json({ 
        status: 'error', 
        message: 'Failed to test Bright Data connection',
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
  
  // Get platform configuration status
  app.get("/api/bright-data/status", async (req, res) => {
    try {
      const status = fixedBrightData.getPlatformStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get platform status" });
    }
  });
  
  // Get configuration instructions
  app.get("/api/bright-data/instructions", async (req, res) => {
    try {
      const instructions = fixedBrightData.getConfigurationInstructions();
      res.json(instructions);
    } catch (error) {
      res.status(500).json({ error: "Failed to get instructions" });
    }
  });
  
  // Update dataset ID for a platform
  app.post("/api/bright-data/config", async (req, res) => {
    try {
      const { platform, datasetId } = req.body;
      
      if (!platform || !datasetId) {
        return res.status(400).json({ error: "Platform and datasetId are required" });
      }
      
      const success = fixedBrightData.updateDatasetId(platform, datasetId);
      if (success) {
        res.json({ success: true, message: `Dataset ID updated for ${platform}` });
      } else {
        res.status(400).json({ error: `Platform ${platform} not supported` });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update configuration" });
    }
  });
  
  // Fetch data using fixed Bright Data service
  app.post("/api/bright-data/fetch", async (req, res) => {
    try {
      const { platform, keywords = [], limit = 20 } = req.body;
      
      if (!platform) {
        return res.status(400).json({ error: "Platform is required" });
      }
      
      const data = await fixedBrightData.fetchPlatformData(platform, keywords, limit);
      res.json({
        success: true,
        platform,
        count: data.length,
        data,
        method: data[0]?.metadata?.source || 'unknown'
      });
    } catch (error) {
      console.error('Error fetching via fixed Bright Data:', error);
      res.status(500).json({ 
        error: "Failed to fetch data", 
        details: error instanceof Error ? error.message : 'Unknown error',
        platform: req.body.platform 
      });
    }
  });

  // Fetch LIVE data using enhanced Bright Data service with browser automation
  app.post("/api/bright-data/live", async (req, res) => {
    try {
      const { platform, keywords = [], limit = 20 } = req.body;
      
      if (!platform) {
        return res.status(400).json({ error: "Platform is required" });
      }
      
      console.log(`[Live API] Fetching live data from ${platform} with browser automation`);
      
      const result = await liveBrightData.fetchLiveData(platform, keywords, limit);
      res.json(result);
      
    } catch (error) {
      console.error('Error fetching live data:', error);
      res.status(500).json({ 
        error: "Failed to fetch live data", 
        details: error instanceof Error ? error.message : 'Unknown error',
        platform: req.body.platform 
      });
    }
  });

  // Get live system status
  app.get("/api/bright-data/live/status", async (req, res) => {
    try {
      const status = liveBrightData.getSystemStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get live system status" });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { AuthService, registerSchema } = await import("./services/authService");
      const authService = new AuthService(db);
      const validatedData = registerSchema.parse(req.body);
      const user = await authService.register(validatedData);
      
      // Set session
      req.session.user = { id: user.id, email: user.email, username: user.username || "" };
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        res.status(201).json({ 
          success: true, 
          user: { id: user.id, email: user.email, username: user.username || "" } 
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      if (error instanceof Error) {
        console.error("Registration error:", error);
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { AuthService, loginSchema } = await import("./services/authService");
      const authService = new AuthService(db);
      const validatedData = loginSchema.parse(req.body);
      const user = await authService.login(validatedData);
      
      // Set session
      req.session.user = { id: user.id, email: user.email, username: user.username || "" };
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        res.json({ 
          success: true, 
          user: { id: user.id, email: user.email, username: user.username || "" } 
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      if (error instanceof Error) {
        console.error("Login error:", error);
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session?.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { AuthService } = await import("./services/authService");
      const authService = new AuthService(db);
      const user = await authService.getUserById(req.session.user.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ 
        user: { id: user.id, email: user.email, username: user.username } 
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
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
