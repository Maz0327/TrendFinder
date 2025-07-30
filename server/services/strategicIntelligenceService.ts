// Strategic Intelligence Service - Clean Supabase Implementation
import { BrightDataService } from './brightDataService';
import { EnhancedAIAnalyzer, AnalysisContext } from './enhancedAIAnalyzer';
import { ContentRadar, Capture, Project, InsertContentRadar } from '@shared/supabase-schema';
import { IStorage } from '../storage';

export class StrategicIntelligenceService {
  private brightData: BrightDataService;
  private aiAnalyzer: EnhancedAIAnalyzer;
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.brightData = new BrightDataService();
    this.aiAnalyzer = new EnhancedAIAnalyzer();
    this.storage = storage;
  }

  async analyzeContentTrends(keywords: string[], timeframe = '24h'): Promise<ContentRadar[]> {
    try {
      // Fetch trending content from various platforms
      const results: ContentRadar[] = [];
      
      // Reddit trends
      const redditContent = await this.brightData.getRedditTrends(keywords);
      for (const item of redditContent.slice(0, 5)) {
        const contentRadar: InsertContentRadar = {
          userId: 'system', // System-generated content
          platform: 'reddit',
          title: item.title,
          content: item.content,
          url: item.url,
          engagementMetrics: {
            upvotes: item.upvotes || 0,
            comments: item.comments || 0,
            awards: item.awards || 0
          },
          viralScore: this.calculateViralScore(item),
          category: this.categorizeContent(item.title, item.content),
          status: 'active'
        };
        
        const created = await this.storage.createContentRadar(contentRadar);
        results.push(created);
      }

      return results;
    } catch (error) {
      console.error('Strategic Intelligence analysis failed:', error);
      return [];
    }
  }

  async generateStrategicInsights(project: Project, captures: Capture[]): Promise<any> {
    const context: AnalysisContext = {
      projectName: project.name,
      captureCount: captures.length,
      platforms: [...new Set(captures.map(c => c.platform).filter(Boolean))],
      timeRange: '7d',
      keywords: []
    };

    return await this.aiAnalyzer.generateComprehensiveInsights(captures, context);
  }

  private calculateViralScore(item: any): number {
    const engagement = (item.upvotes || 0) + (item.comments || 0) * 2;
    const recency = this.getRecencyScore(item.created_at);
    return Math.min(10, Math.round((engagement / 100) * recency));
  }

  private getRecencyScore(timestamp: string): number {
    const now = Date.now();
    const posted = new Date(timestamp).getTime();
    const hoursAgo = (now - posted) / (1000 * 60 * 60);
    
    if (hoursAgo < 1) return 1.0;
    if (hoursAgo < 6) return 0.8;
    if (hoursAgo < 24) return 0.6;
    return 0.3;
  }

  private categorizeContent(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase();
    
    if (text.includes('tech') || text.includes('ai') || text.includes('startup')) return 'technology';
    if (text.includes('business') || text.includes('marketing') || text.includes('strategy')) return 'business';
    if (text.includes('trend') || text.includes('viral') || text.includes('culture')) return 'culture';
    if (text.includes('politics') || text.includes('election') || text.includes('government')) return 'politics';
    
    return 'general';
  }
}