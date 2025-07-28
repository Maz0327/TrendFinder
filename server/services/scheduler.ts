import * as cron from 'node-cron';
import { ContentFetcher } from './contentFetcher';
import { AIAnalyzer } from './aiAnalyzer';
import { storage } from '../storage';

export class ContentScheduler {
  private fetcher: ContentFetcher;
  private analyzer: AIAnalyzer;
  private isRunning = false;
  private scheduledTask: cron.ScheduledTask | null = null;

  constructor() {
    this.fetcher = new ContentFetcher();
    this.analyzer = new AIAnalyzer();
  }

  async runScan(): Promise<{
    success: boolean;
    itemsProcessed: number;
    errors: string[];
  }> {
    if (this.isRunning) {
      return {
        success: false,
        itemsProcessed: 0,
        errors: ['Scan already in progress']
      };
    }

    this.isRunning = true;
    const startTime = Date.now();
    const errors: string[] = [];
    let itemsProcessed = 0;

    try {
      console.log('Starting content scan...');
      
      // Record scan start for each platform
      const platforms = ['reddit', 'youtube', 'news'];
      
      for (const platform of platforms) {
        try {
          let items: any[] = [];
          
          switch (platform) {
            case 'reddit':
              items = await this.fetcher.fetchRedditTrends();
              break;
            case 'youtube':
              items = await this.fetcher.fetchYouTubeTrends();
              break;
            case 'news':
              items = await this.fetcher.fetchNewsTrends();
              break;
          }

          if (items.length > 0) {
            // Analyze items in batches
            const analysisResults = await this.analyzer.batchAnalyze(
              items.map(item => ({
                title: item.title,
                content: item.content,
                platform: item.platform
              }))
            );

            // Save to storage
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              const analysis = analysisResults[i];
              
              try {
                await storage.createContentItem({
                  title: item.title,
                  url: item.url,
                  content: item.content,
                  summary: analysis.summary,
                  hook1: analysis.hook1,
                  hook2: analysis.hook2,
                  category: analysis.category || item.category,
                  platform: item.platform,
                  viralScore: analysis.viralScore.toString(),
                  engagement: item.engagement || 0,
                  growthRate: '0.00',
                  metadata: item.metadata,
                  isActive: true
                });
                
                itemsProcessed++;
              } catch (error) {
                errors.push(`Failed to save item: ${item.title}`);
              }
            }
          }

          // Record scan completion
          await storage.createScanHistory({
            platform,
            status: items.length > 0 ? 'success' : 'partial',
            itemsFound: items.length,
            errorMessage: null,
            scanDuration: Date.now() - startTime
          });

        } catch (error) {
          const errorMsg = `${platform} scan failed: ${error}`;
          errors.push(errorMsg);
          
          await storage.createScanHistory({
            platform,
            status: 'error',
            itemsFound: 0,
            errorMessage: errorMsg,
            scanDuration: Date.now() - startTime
          });
        }
      }

      console.log(`Scan completed. Processed ${itemsProcessed} items with ${errors.length} errors.`);
      
      return {
        success: errors.length === 0,
        itemsProcessed,
        errors
      };

    } catch (error) {
      errors.push(`Scan failed: ${error}`);
      return {
        success: false,
        itemsProcessed,
        errors
      };
    } finally {
      this.isRunning = false;
    }
  }

  startScheduledScans(intervalMinutes = 15): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
    }

    // Run every N minutes
    const cronExpression = `*/${intervalMinutes} * * * *`;
    
    this.scheduledTask = cron.schedule(cronExpression, async () => {
      console.log(`Running scheduled scan (every ${intervalMinutes} minutes)...`);
      await this.runScan();
    });

    this.scheduledTask.start();
    console.log(`Scheduled scans started (every ${intervalMinutes} minutes)`);
  }

  stopScheduledScans(): void {
    if (this.scheduledTask) {
      this.scheduledTask.stop();
      this.scheduledTask = null;
      console.log('Scheduled scans stopped');
    }
  }

  isScheduledScanActive(): boolean {
    return this.scheduledTask !== null;
  }
}

export const scheduler = new ContentScheduler();
