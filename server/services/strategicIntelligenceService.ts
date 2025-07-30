import { BrightDataService } from './brightDataService';
import { EnhancedBrightDataService } from './enhancedBrightDataService';
import { EnhancedAIAnalyzer, AnalysisContext } from './enhancedAIAnalyzer';
import { Signal, Source, SignalSource, InsertSignal, InsertSignalSource } from '@shared/schema';
import { IStorage } from '../storage';

// Tier 1 Platform Configurations
const TIER_1_SOURCES: Partial<Source>[] = [
  {
    name: 'linkedin',
    displayName: 'LinkedIn',
    tier: 1,
    category: 'business_intel',
    brightDataConfig: {
      datasetId: 'linkedin_dataset',
      browserRequired: true
    }
  },
  {
    name: 'instagram',
    displayName: 'Instagram',
    tier: 1,
    category: 'social_media',
    brightDataConfig: {
      datasetId: 'instagram_dataset',
      browserRequired: true
    }
  },
  {
    name: 'tiktok',
    displayName: 'TikTok',
    tier: 1,
    category: 'social_media',
    brightDataConfig: {
      datasetId: 'tiktok_dataset',
      browserRequired: true
    }
  },
  {
    name: 'twitter',
    displayName: 'Twitter/X',
    tier: 1,
    category: 'social_media',
    brightDataConfig: {
      datasetId: 'twitter_dataset',
      browserRequired: false
    }
  },
  {
    name: 'medium',
    displayName: 'Medium',
    tier: 1,
    category: 'thought_leadership',
    brightDataConfig: {
      datasetId: 'medium_dataset',
      browserRequired: false
    }
  }
];

export interface PlatformIntelligenceRequest {
  platforms: string[];
  keywords?: string[];
  competitors?: string[];
  timeWindow?: string; // '24h', '7d', '30d'
  limit?: number;
}

export interface CulturalMoment {
  title: string;
  description: string;
  platforms: string[];
  momentum: number; // 0-100
  signals: Signal[];
  timestamp: Date;
}

export interface TrendReport {
  trends: Array<{
    topic: string;
    platforms: string[];
    growthRate: number;
    signals: Signal[];
    prediction: string;
  }>;
  culturalMoments: CulturalMoment[];
  emergingOpportunities: string[];
}

export class StrategicIntelligenceService {
  private brightDataService: BrightDataService;
  private enhancedBrightDataService: EnhancedBrightDataService;
  private aiAnalyzer: EnhancedAIAnalyzer;
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.brightDataService = new BrightDataService();
    this.enhancedBrightDataService = new EnhancedBrightDataService();
    this.aiAnalyzer = new EnhancedAIAnalyzer();
    this.storage = storage;
  }

  /**
   * Initialize Tier 1 sources in the database
   */
  async initializeSources(): Promise<void> {
    for (const sourceData of TIER_1_SOURCES) {
      const existing = await this.storage.getSourceByName(sourceData.name!);
      if (!existing) {
        await this.storage.createSource({
          name: sourceData.name!,
          displayName: sourceData.displayName!,
          tier: sourceData.tier!,
          category: sourceData.category!,
          brightDataConfig: sourceData.brightDataConfig,
          isActive: true,
          rateLimit: 100
        });
      }
    }
  }

  /**
   * Fetch multi-platform intelligence with correlation
   */
  async fetchMultiPlatformIntelligence(
    request: PlatformIntelligenceRequest
  ): Promise<Signal[]> {
    const { platforms, keywords = [], competitors = [], timeWindow = '24h', limit = 50 } = request;
    
    console.log(`[Strategic Intelligence] Fetching from ${platforms.join(', ')} with keywords: ${keywords.join(', ')}`);
    
    const allSignals: Signal[] = [];
    
    // Fetch data from each platform in parallel
    const platformPromises = platforms.map(async (platform) => {
      try {
        const source = await this.storage.getSourceByName(platform);
        if (!source || !source.isActive) {
          console.warn(`[Strategic Intelligence] Source ${platform} not found or inactive`);
          return [];
        }

        // Fetch raw data from platform
        const rawData = await this.fetchPlatformData(platform, keywords, limit);
        
        // Process each piece of content into signals
        const signalPromises = rawData.map(async (item) => {
          const context: AnalysisContext = {
            platform,
            hasVisuals: this.hasVisuals(item),
            requiresCulturalContext: true
          };

          // AI analysis with enhanced truth framework
          const analysis = await this.aiAnalyzer.analyzeContent(
            item.title || item.text || 'Untitled',
            item.content || item.text || '',
            context
          );

          // Create signal with full analysis
          const signal: InsertSignal = {
            title: item.title || item.text?.substring(0, 100) || 'Untitled',
            url: item.url || '',
            content: item.content || item.text || '',
            summary: analysis.summary,
            hooks: analysis.hooks,
            viralScore: String(analysis.viralScore),
            truthAnalysis: analysis.truthAnalysis,
            category: analysis.category || 'uncategorized',
            signalType: this.determineSignalType(analysis),
            engagement: item.engagement || 0,
            growthRate: String(this.calculateGrowthRate(item)),
            hasVisuals: this.hasVisuals(item),
            visualAnalysis: analysis.visualAnalysis,
            screenshots: item.screenshots || [],
            metadata: item,
            aiModel: analysis.aiModel,
            isActive: true
          };

          // Save signal to database
          const savedSignal = await this.storage.createSignal(signal);

          // Create signal-source relationship
          if (savedSignal && source.id) {
            const signalSource: InsertSignalSource = {
              signalId: savedSignal.id,
              sourceId: source.id,
              platformUrl: item.url,
              platformMetrics: {
                likes: item.likes || 0,
                shares: item.shares || 0,
                comments: item.comments || 0,
                views: item.views || 0
              }
            };
            await this.storage.createSignalSource(signalSource);
          }

          return savedSignal;
        });

        const signals = await Promise.all(signalPromises);
        return signals.filter(Boolean) as Signal[];
      } catch (error) {
        console.error(`[Strategic Intelligence] Error fetching from ${platform}:`, error);
        return [];
      }
    });

    const platformResults = await Promise.all(platformPromises);
    platformResults.forEach(signals => allSignals.push(...signals));

    console.log(`[Strategic Intelligence] Collected ${allSignals.length} signals total`);
    
    return allSignals;
  }

  /**
   * Correlate signals across platforms to identify cultural moments
   */
  async correlateCulturalMoments(signals: Signal[]): Promise<CulturalMoment[]> {
    // Group signals by similar content/themes
    const themeGroups = this.groupSignalsByTheme(signals);
    
    const culturalMoments: CulturalMoment[] = [];
    
    for (const [theme, themeSignals] of Object.entries(themeGroups)) {
      if (themeSignals.length >= 3) { // At least 3 platforms discussing
        const momentum = this.calculateMomentum(themeSignals);
        
        if (momentum > 50) { // Significant momentum threshold
          culturalMoments.push({
            title: theme,
            description: themeSignals[0].summary || '',
            platforms: [...new Set(themeSignals.map(s => this.getPlatformFromSignal(s)))],
            momentum,
            signals: themeSignals,
            timestamp: new Date()
          });
        }
      }
    }
    
    return culturalMoments.sort((a, b) => b.momentum - a.momentum);
  }

  /**
   * Detect emerging trends from signals
   */
  async detectEmergingTrends(timeWindow: string = '7d'): Promise<TrendReport> {
    const signals = await this.storage.getRecentSignals(timeWindow);
    
    // Group by topics and calculate growth
    const topicGroups = this.groupSignalsByTopic(signals);
    
    const trends = Object.entries(topicGroups).map(([topic, topicSignals]) => ({
      topic,
      platforms: [...new Set(topicSignals.map(s => this.getPlatformFromSignal(s)))],
      growthRate: this.calculateTopicGrowthRate(topicSignals),
      signals: topicSignals.slice(0, 5), // Top 5 signals
      prediction: this.predictTrendDirection(topicSignals)
    })).filter(trend => trend.growthRate > 20); // 20% growth threshold
    
    // Get cultural moments
    const culturalMoments = await this.correlateCulturalMoments(signals);
    
    // Identify emerging opportunities
    const emergingOpportunities = this.identifyOpportunities(trends, culturalMoments);
    
    return {
      trends: trends.sort((a, b) => b.growthRate - a.growthRate),
      culturalMoments,
      emergingOpportunities
    };
  }

  /**
   * Platform-specific data fetching
   */
  private async fetchPlatformData(
    platform: string,
    keywords: string[],
    limit: number
  ): Promise<any[]> {
    try {
      // Check if we're in demo mode (for testing Phase 1)
      if (process.env.NODE_ENV === 'development' && process.env.DEMO_MODE !== 'false') {
        return this.generateDemoData(platform, keywords, limit);
      }
      
      switch (platform) {
        case 'linkedin':
          // Use enhanced service for LinkedIn
          return this.enhancedBrightDataService.fetchLinkedInProfessionalContent(keywords);
        
        case 'instagram':
          // Use hashtags for Instagram
          return this.brightDataService.fetchInstagramTrending(keywords);
        
        case 'tiktok':
          // TikTok not directly supported yet, use Instagram as proxy for now
          console.log(`[Strategic Intelligence] TikTok support coming soon, using Instagram proxy`);
          return this.brightDataService.fetchInstagramTrending(['tiktok', ...keywords]);
        
        case 'twitter':
          // Use hashtags for Twitter
          return this.brightDataService.fetchTwitterTrending(keywords);
        
        case 'medium':
          // Medium not directly supported yet
          console.log(`[Strategic Intelligence] Medium support coming soon`);
          return [];
        
        default:
          console.warn(`[Strategic Intelligence] Unknown platform: ${platform}`);
          return [];
      }
    } catch (error) {
      console.error(`[Strategic Intelligence] Error fetching data for ${platform}:`, error);
      // Fallback to demo data if API fails
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Strategic Intelligence] Using demo data as fallback for ${platform}`);
        return this.generateDemoData(platform, keywords, limit);
      }
      return [];
    }
  }
  
  /**
   * Generate demo data for testing Phase 1 functionality
   */
  private generateDemoData(platform: string, keywords: string[], limit: number): any[] {
    const demoContent = {
      linkedin: [
        { 
          title: "AI Revolution in Enterprise Strategy", 
          content: "Leading Fortune 500 companies are integrating AI into their core business strategies...", 
          url: "https://linkedin.com/post/ai-strategy-123" 
        },
        { 
          title: "The Future of Remote Work Post-2025", 
          content: "New research shows hybrid work models are becoming the standard...", 
          url: "https://linkedin.com/post/remote-work-456" 
        }
      ],
      twitter: [
        { 
          title: "Breaking: GPT-5 Announced", 
          content: "OpenAI announces next generation model with unprecedented capabilities...", 
          url: "https://twitter.com/status/gpt5-789" 
        },
        { 
          title: "Tech Industry Trends 2025", 
          content: "Top VCs predict the next big waves in technology innovation...", 
          url: "https://twitter.com/status/tech-trends-012" 
        }
      ],
      instagram: [
        { 
          title: "Visual AI Takes Over Creative Industry", 
          content: "New AI tools are transforming how creatives work...", 
          url: "https://instagram.com/p/ai-creative-345" 
        }
      ],
      tiktok: [
        { 
          title: "Viral AI Challenge", 
          content: "New TikTok trend showcases AI capabilities in everyday life...", 
          url: "https://tiktok.com/@ai-trend-678" 
        }
      ],
      medium: [
        { 
          title: "Deep Dive: AI Ethics in 2025", 
          content: "Comprehensive analysis of current AI ethical frameworks...", 
          url: "https://medium.com/ai-ethics-901" 
        }
      ]
    };
    
    const platformContent = demoContent[platform] || [];
    return platformContent
      .filter(item => 
        keywords.length === 0 || 
        keywords.some(keyword => 
          item.title.toLowerCase().includes(keyword.toLowerCase()) ||
          item.content.toLowerCase().includes(keyword.toLowerCase())
        )
      )
      .slice(0, limit)
      .map((item, index) => ({
        ...item,
        platform,
        category: this.categorizeContent(item.content),
        engagement: Math.floor(Math.random() * 10000) + 1000,
        metadata: {
          demo: true,
          fetchedAt: new Date().toISOString(),
          keywords: keywords
        }
      }));
  }

  /**
   * Fetch Medium content (placeholder for actual implementation)
   */
  private async fetchMediumContent(keywords: string[], limit: number): Promise<any[]> {
    // This would integrate with Medium's API or Bright Data's Medium dataset
    console.log(`[Strategic Intelligence] Fetching Medium content for: ${keywords.join(', ')}`);
    return [];
  }
  
  /**
   * Categorize content based on keywords and context
   */
  private categorizeContent(content: string): string {
    const lowerContent = content.toLowerCase();
    
    // Technology categories
    if (lowerContent.includes('ai') || lowerContent.includes('artificial intelligence') || 
        lowerContent.includes('machine learning') || lowerContent.includes('gpt')) {
      return 'ai_ml';
    }
    if (lowerContent.includes('crypto') || lowerContent.includes('blockchain') || 
        lowerContent.includes('bitcoin') || lowerContent.includes('web3')) {
      return 'crypto';
    }
    if (lowerContent.includes('tech') || lowerContent.includes('software') || 
        lowerContent.includes('coding') || lowerContent.includes('programming')) {
      return 'technology';
    }
    
    // Business categories
    if (lowerContent.includes('startup') || lowerContent.includes('entrepreneur') || 
        lowerContent.includes('venture') || lowerContent.includes('funding')) {
      return 'startup';
    }
    if (lowerContent.includes('business') || lowerContent.includes('strategy') || 
        lowerContent.includes('management') || lowerContent.includes('leadership')) {
      return 'business';
    }
    
    // Media & Entertainment
    if (lowerContent.includes('entertainment') || lowerContent.includes('movie') || 
        lowerContent.includes('music') || lowerContent.includes('celebrity')) {
      return 'entertainment';
    }
    if (lowerContent.includes('sports') || lowerContent.includes('game') || 
        lowerContent.includes('match') || lowerContent.includes('team')) {
      return 'sports';
    }
    
    // Social & Culture
    if (lowerContent.includes('trend') || lowerContent.includes('viral') || 
        lowerContent.includes('meme') || lowerContent.includes('challenge')) {
      return 'social_trend';
    }
    if (lowerContent.includes('health') || lowerContent.includes('wellness') || 
        lowerContent.includes('fitness') || lowerContent.includes('medical')) {
      return 'health';
    }
    
    // Default
    return 'general';
  }

  /**
   * Helper methods
   */
  private hasVisuals(item: any): boolean {
    return !!(item.images?.length || item.videos?.length || item.media?.length);
  }

  private determineSignalType(analysis: any): string {
    if (analysis.viralScore > 8) return 'viral_moment';
    if (analysis.truthAnalysis?.insight?.competitiveIntelligence) return 'competitive_intel';
    if (analysis.truthAnalysis?.humanTruth?.culturalContext?.relevance > 0.8) return 'cultural_moment';
    return 'trend';
  }

  private calculateGrowthRate(item: any): number {
    // Calculate based on engagement velocity
    const engagement = item.engagement || item.likes || 0;
    const hoursOld = item.timestamp ? 
      (Date.now() - new Date(item.timestamp).getTime()) / (1000 * 60 * 60) : 24;
    
    return hoursOld > 0 ? (engagement / hoursOld) : 0;
  }

  private groupSignalsByTheme(signals: Signal[]): Record<string, Signal[]> {
    const groups: Record<string, Signal[]> = {};
    
    signals.forEach(signal => {
      const theme = signal.category || 'uncategorized';
      if (!groups[theme]) groups[theme] = [];
      groups[theme].push(signal);
    });
    
    return groups;
  }

  private groupSignalsByTopic(signals: Signal[]): Record<string, Signal[]> {
    // More sophisticated topic grouping based on content similarity
    return this.groupSignalsByTheme(signals); // Simplified for now
  }

  private calculateMomentum(signals: Signal[]): number {
    const avgViralScore = signals.reduce((sum, s) => 
      sum + parseFloat(s.viralScore || '0'), 0) / signals.length;
    
    const platformDiversity = new Set(signals.map(s => 
      this.getPlatformFromSignal(s))).size;
    
    const totalEngagement = signals.reduce((sum, s) => 
      sum + (s.engagement || 0), 0);
    
    // Weighted momentum score
    return Math.min(100, 
      (avgViralScore * 5) + 
      (platformDiversity * 10) + 
      (Math.log10(totalEngagement + 1) * 5)
    );
  }

  private calculateTopicGrowthRate(signals: Signal[]): number {
    const growthRates = signals.map(s => parseFloat(s.growthRate || '0'));
    return growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
  }

  private predictTrendDirection(signals: Signal[]): string {
    const recentSignals = signals.filter(s => {
      const hoursSinceCreation = (Date.now() - new Date(s.createdAt).getTime()) / (1000 * 60 * 60);
      return hoursSinceCreation < 24;
    });
    
    const growthTrend = this.calculateTopicGrowthRate(recentSignals);
    
    if (growthTrend > 50) return 'Rapidly ascending - high opportunity window';
    if (growthTrend > 20) return 'Steady growth - sustainable trend';
    if (growthTrend > 0) return 'Emerging - monitor closely';
    return 'Plateauing - consider fresh angle';
  }

  private identifyOpportunities(
    trends: any[],
    culturalMoments: CulturalMoment[]
  ): string[] {
    const opportunities: string[] = [];
    
    // High-growth trends with low competition
    trends.forEach(trend => {
      if (trend.growthRate > 50 && trend.platforms.length < 3) {
        opportunities.push(`Expand "${trend.topic}" to underutilized platforms`);
      }
    });
    
    // Cultural moments with commercial potential
    culturalMoments.forEach(moment => {
      if (moment.momentum > 70) {
        opportunities.push(`Leverage "${moment.title}" cultural moment for brand alignment`);
      }
    });
    
    return opportunities;
  }

  private getPlatformFromSignal(signal: Signal): string {
    // Extract platform from metadata or other fields
    return (signal.metadata as any)?.platform || 'unknown';
  }
}