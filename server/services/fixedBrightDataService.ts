import axios from 'axios';

export interface BrightDataResponse {
  snapshot_id?: string;
  status: string;
  data?: any[];
  error?: string;
}

export interface PlatformConfig {
  datasetId: string | null;
  fallbackMethod: 'api' | 'demo';
  enabled: boolean;
  requiresDatasetId: boolean;
}

export class FixedBrightDataService {
  private apiToken: string;
  private baseUrl = 'https://api.brightdata.com/datasets/v3';
  
  // Updated platform configurations - using real public dataset IDs when available
  private platformConfigs: Record<string, PlatformConfig> = {
    'linkedin': {
      datasetId: null, // User needs to provide their own dataset ID
      fallbackMethod: 'demo',
      enabled: true,
      requiresDatasetId: true
    },
    'twitter': {
      datasetId: null, // User needs to provide their own dataset ID
      fallbackMethod: 'demo',
      enabled: true,
      requiresDatasetId: true
    },
    'instagram': {
      datasetId: null, // User needs to provide their own dataset ID
      fallbackMethod: 'demo',
      enabled: true,
      requiresDatasetId: true
    },
    'reddit': {
      datasetId: null, // User needs to provide their own dataset ID
      fallbackMethod: 'api',
      enabled: true,
      requiresDatasetId: false // Can use Reddit API as fallback
    },
    'youtube': {
      datasetId: null, // User needs to provide their own dataset ID
      fallbackMethod: 'api',
      enabled: true,
      requiresDatasetId: false // Can use YouTube API as fallback
    }
  };

  constructor() {
    this.apiToken = process.env.BRIGHT_DATA_API_TOKEN || '';
  }

  /**
   * Test API connectivity and credentials
   */
  async testConnection(): Promise<{ status: 'success' | 'error'; message: string; details?: any }> {
    if (!this.apiToken) {
      return {
        status: 'error',
        message: 'Bright Data API token not configured'
      };
    }

    try {
      // Test with a simple request to validate credentials
      const headers = {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      };

      // Use the discovery endpoint which doesn't require a specific dataset ID
      const response = await axios.get(
        'https://brightdata.com/api/discovery',
        { headers, timeout: 10000 }
      );

      return {
        status: 'success',
        message: 'Bright Data API connection successful',
        details: {
          tokenLength: this.apiToken.length,
          endpoint: 'discovery'
        }
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: 'Bright Data API connection failed',
        details: {
          error: error.response?.data || error.message,
          status: error.response?.status,
          tokenLength: this.apiToken.length
        }
      };
    }
  }

  /**
   * Fetch data from a platform using Bright Data or fallback methods
   */
  async fetchPlatformData(platform: string, keywords: string[] = [], limit: number = 20): Promise<any[]> {
    const config = this.platformConfigs[platform];
    
    if (!config || !config.enabled) {
      throw new Error(`Platform ${platform} is not supported or disabled`);
    }

    console.log(`[Fixed Bright Data] Attempting to fetch from ${platform}`);

    // Try Bright Data first if we have a dataset ID
    if (config.datasetId && this.apiToken) {
      try {
        return await this.fetchViaBrightData(platform, config.datasetId, keywords, limit);
      } catch (error) {
        console.log(`[Fixed Bright Data] Failed with Bright Data API for ${platform}, falling back...`);
      }
    }

    // Fall back to alternative methods
    switch (config.fallbackMethod) {
      case 'api':
        return await this.fetchViaPublicAPI(platform, keywords, limit);
      case 'demo':
        return this.generateDemoData(platform, keywords, limit);
      default:
        throw new Error(`No fallback method available for ${platform}`);
    }
  }

  /**
   * Attempt to fetch data using Bright Data API
   */
  private async fetchViaBrightData(platform: string, datasetId: string, keywords: string[], limit: number): Promise<any[]> {
    if (!this.apiToken) {
      throw new Error('API token not available');
    }

    const headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json'
    };

    // Build URLs based on platform
    const urls = this.buildPlatformUrls(platform, keywords);
    
    const requestBody = urls.map(url => ({ url }));

    try {
      console.log(`[Fixed Bright Data] Making request to dataset ${datasetId} for ${platform}`);
      
      const response = await axios.post(
        `${this.baseUrl}/trigger?dataset_id=${datasetId}&format=json`,
        requestBody,
        { headers, timeout: 30000 }
      );

      if (response.data.snapshot_id) {
        // For async operations, we'd need to poll for results
        // For now, return empty array and handle async in production
        console.log(`[Fixed Bright Data] Async operation started for ${platform}: ${response.data.snapshot_id}`);
        return [];
      }

      return this.processBrightDataResponse(platform, response.data);
    } catch (error: any) {
      console.error(`[Fixed Bright Data] Error for ${platform}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Fetch data using public APIs as fallback
   */
  private async fetchViaPublicAPI(platform: string, keywords: string[], limit: number): Promise<any[]> {
    console.log(`[Fixed Bright Data] Using public API fallback for ${platform}`);
    
    switch (platform) {
      case 'reddit':
        return await this.fetchRedditViaAPI(keywords, limit);
      case 'youtube':
        return await this.fetchYouTubeViaAPI(keywords, limit);
      default:
        throw new Error(`Public API not available for ${platform}`);
    }
  }

  /**
   * Generate demo data for platforms requiring Bright Data
   */
  private generateDemoData(platform: string, keywords: string[], limit: number): any[] {
    console.log(`[Fixed Bright Data] Generating demo data for ${platform}`);
    
    const demoData = [];
    const keywordText = keywords.length > 0 ? keywords.join(', ') : 'trending topics';
    
    for (let i = 0; i < Math.min(limit, 5); i++) {
      demoData.push({
        title: `[${platform}] Sample trending content about ${keywordText}`,
        content: `This is demo content for ${platform} related to ${keywordText}. In production, this would be real data from Bright Data.`,
        url: `https://${platform}.com/demo-post-${i}`,
        platform,
        category: this.categorizeContent(keywordText),
        engagement: Math.floor(Math.random() * 5000) + 100,
        metadata: {
          source: 'demo',
          keywords: keywords,
          timestamp: new Date().toISOString(),
          note: 'This is demo data. Configure Bright Data dataset IDs for real data.'
        }
      });
    }
    
    return demoData;
  }

  /**
   * Reddit API fallback
   */
  private async fetchRedditViaAPI(keywords: string[], limit: number): Promise<any[]> {
    try {
      // Try multiple Reddit endpoints to get real live data
      const endpoints = [
        `https://www.reddit.com/r/technology/hot.json?limit=${Math.min(limit, 25)}`,
        `https://www.reddit.com/r/artificial/hot.json?limit=${Math.min(limit, 25)}`,
        `https://www.reddit.com/r/MachineLearning/hot.json?limit=${Math.min(limit, 25)}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`[Fixed Bright Data] Trying Reddit endpoint: ${endpoint}`);
          const response = await axios.get(endpoint, {
            headers: { 
              'User-Agent': 'Mozilla/5.0 (compatible; ContentRadar/1.0; +https://contentRadar.ai)',
              'Accept': 'application/json',
              'Accept-Language': 'en-US,en;q=0.9'
            },
            timeout: 10000
          });

          if (response.data?.data?.children) {
            const posts = response.data.data.children;
            console.log(`[Fixed Bright Data] Successfully fetched ${posts.length} real Reddit posts`);
            
            return posts.slice(0, limit).map((post: any) => ({
              title: post.data.title,
              content: post.data.selftext || post.data.title,
              url: `https://reddit.com${post.data.permalink}`,
              platform: 'reddit',
              category: this.categorizeContent(post.data.title),
              engagement: (post.data.ups || 0) + (post.data.num_comments || 0),
              metadata: {
                subreddit: post.data.subreddit,
                upvotes: post.data.ups || 0,
                comments: post.data.num_comments || 0,
                author: post.data.author,
                created: new Date(post.data.created_utc * 1000).toISOString(),
                source: 'reddit_api_live',
                isLiveData: true
              }
            }));
          }
        } catch (endpointError) {
          console.log(`[Fixed Bright Data] Reddit endpoint failed: ${endpoint}`);
          continue;
        }
      }
      
      // If all endpoints fail, try a simple fallback
      console.log('[Fixed Bright Data] All Reddit endpoints failed, trying RSS fallback');
      return await this.fetchRedditViaRSS(keywords, limit);
      
    } catch (error) {
      console.error('[Fixed Bright Data] Reddit API error:', error);
      return this.generateDemoData('reddit', keywords, limit);
    }
  }

  /**
   * Reddit RSS fallback for live data
   */
  private async fetchRedditViaRSS(keywords: string[], limit: number): Promise<any[]> {
    try {
      // Use Reddit RSS feeds which are more reliable
      const response = await axios.get('https://www.reddit.com/r/technology/.rss', {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (compatible; ContentRadar/1.0)',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        },
        timeout: 10000
      });

      // For now, return demo data with note about RSS
      // In production, would parse RSS XML
      console.log('[Fixed Bright Data] RSS endpoint accessible, would parse XML for live data');
      
      const demoWithNote = this.generateDemoData('reddit', keywords, limit);
      return demoWithNote.map(item => ({
        ...item,
        metadata: {
          ...item.metadata,
          source: 'reddit_rss_available',
          note: 'RSS feed accessible - would contain live Reddit data with XML parsing'
        }
      }));
      
    } catch (error) {
      console.error('[Fixed Bright Data] RSS fallback failed:', error);
      return this.generateDemoData('reddit', keywords, limit);
    }
  }

  /**
   * YouTube API fallback (requires YouTube API key)
   */
  private async fetchYouTubeViaAPI(keywords: string[], limit: number): Promise<any[]> {
    // For now, return demo data since YouTube API requires separate key
    // In production, implement with YOUTUBE_API_KEY
    console.log('[Fixed Bright Data] YouTube API fallback not implemented, using demo data');
    return this.generateDemoData('youtube', keywords, limit);
  }

  /**
   * Build platform-specific URLs
   */
  private buildPlatformUrls(platform: string, keywords: string[]): string[] {
    const searchQuery = keywords.join(' ');
    
    switch (platform) {
      case 'linkedin':
        return [`https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(searchQuery)}`];
      case 'twitter':
        return [`https://twitter.com/search?q=${encodeURIComponent(searchQuery)}&src=typed_query&f=top`];
      case 'instagram':
        return [`https://www.instagram.com/explore/tags/${encodeURIComponent(keywords[0] || 'trending')}/`];
      case 'reddit':
        return [`https://www.reddit.com/search/?q=${encodeURIComponent(searchQuery)}&sort=top&t=day`];
      case 'youtube':
        return [`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}&sp=CAI%253D`];
      default:
        return [`https://${platform}.com/search?q=${encodeURIComponent(searchQuery)}`];
    }
  }

  /**
   * Process Bright Data API response
   */
  private processBrightDataResponse(platform: string, data: any): any[] {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map(item => ({
      title: item.title || item.text || 'Untitled',
      content: item.content || item.description || item.text || '',
      url: item.url || item.link || `https://${platform}.com/post`,
      platform,
      category: this.categorizeContent(item.title || item.text),
      engagement: item.engagement || item.likes || item.upvotes || 0,
      metadata: {
        source: 'bright_data',
        original: item
      }
    }));
  }

  /**
   * Categorize content based on keywords
   */
  private categorizeContent(text: string): string {
    const content = (text || '').toLowerCase();
    
    if (content.includes('ai') || content.includes('artificial intelligence') || content.includes('machine learning')) {
      return 'ai_ml';
    }
    if (content.includes('tech') || content.includes('startup') || content.includes('software')) {
      return 'technology';
    }
    if (content.includes('business') || content.includes('marketing') || content.includes('strategy')) {
      return 'business';
    }
    if (content.includes('culture') || content.includes('trend') || content.includes('social')) {
      return 'culture';
    }
    
    return 'general';
  }

  /**
   * Get platform configuration status
   */
  getPlatformStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    
    for (const [platform, config] of Object.entries(this.platformConfigs)) {
      status[platform] = {
        enabled: config.enabled,
        hasDatasetId: !!config.datasetId,
        fallbackMethod: config.fallbackMethod,
        requiresDatasetId: config.requiresDatasetId,
        status: config.datasetId ? 'bright_data' : config.fallbackMethod
      };
    }
    
    return status;
  }

  /**
   * Update dataset ID for a platform
   */
  updateDatasetId(platform: string, datasetId: string): boolean {
    if (!this.platformConfigs[platform]) {
      return false;
    }
    
    this.platformConfigs[platform].datasetId = datasetId;
    console.log(`[Fixed Bright Data] Updated dataset ID for ${platform}: ${datasetId}`);
    return true;
  }

  /**
   * Get configuration instructions for users
   */
  getConfigurationInstructions(): any {
    return {
      brightDataSetup: {
        step1: "Sign up for Bright Data account at https://brightdata.com",
        step2: "Navigate to Dataset Marketplace and find the scrapers you need",
        step3: "Get dataset IDs for each platform (format: gd_xxxxxxxxxxxxxxxxx)",
        step4: "Update dataset IDs using the /api/bright-data/config endpoint",
        step5: "Test connection using /api/bright-data/test endpoint"
      },
      supportedPlatforms: Object.keys(this.platformConfigs),
      fallbackMethods: {
        reddit: "Public Reddit API (no authentication required)",
        youtube: "Demo data (YouTube API key needed for real data)",
        linkedin: "Demo data (requires Bright Data dataset)",
        twitter: "Demo data (requires Bright Data dataset)",
        instagram: "Demo data (requires Bright Data dataset)"
      },
      apiTokenSetup: "Set BRIGHT_DATA_API_TOKEN environment variable"
    };
  }
}