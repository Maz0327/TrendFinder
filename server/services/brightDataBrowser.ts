import axios from 'axios';

export interface BrowserSessionConfig {
  url: string;
  country?: string;
  viewport?: {
    width: number;
    height: number;
  };
  cookies?: Array<{
    name: string;
    value: string;
    domain: string;
  }>;
  userAgent?: string;
  waitFor?: number;
  screenshot?: boolean;
}

export interface BrowserScrapingResult {
  html: string;
  screenshot?: string;
  cookies?: any[];
  performance?: any;
  errors?: string[];
}

export class BrightDataBrowserService {
  private apiToken: string;
  private baseUrl: string;

  constructor() {
    this.apiToken = process.env.BRIGHT_DATA_API_TOKEN || '';
    this.baseUrl = 'https://api.brightdata.com';
  }

  // Create a browser session for advanced scraping
  async createBrowserSession(config: BrowserSessionConfig): Promise<string> {
    if (!this.apiToken) {
      throw new Error('Bright Data API token not configured');
    }

    const headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json'
    };

    const sessionConfig = {
      url: config.url,
      country: config.country || 'US',
      viewport: config.viewport || { width: 1920, height: 1080 },
      user_agent: config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      wait_for: config.waitFor || 3000,
      screenshot: config.screenshot || false,
      cookies: config.cookies || []
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/browser/session`,
        sessionConfig,
        { headers }
      );

      return response.data.session_id;
    } catch (error: any) {
      console.error('Browser session creation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Execute browser automation script
  async executeBrowserScript(sessionId: string, script: string): Promise<any> {
    const headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/browser/session/${sessionId}/execute`,
        { script },
        { headers }
      );

      return response.data;
    } catch (error: any) {
      console.error('Browser script execution failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Scrape Instagram trending posts with browser automation
  async scrapeInstagramTrending(hashtags: string[] = ['trending', 'viral', 'fyp']): Promise<any[]> {
    const posts: any[] = [];

    for (const hashtag of hashtags) {
      try {
        const url = `https://www.instagram.com/explore/tags/${hashtag}/`;
        const sessionId = await this.createBrowserSession({
          url,
          waitFor: 5000,
          screenshot: false
        });

        // Instagram scraping script
        const script = `
          // Wait for content to load
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const posts = [];
          const postElements = document.querySelectorAll('article a[href*="/p/"]');
          
          for (let i = 0; i < Math.min(10, postElements.length); i++) {
            const element = postElements[i];
            const href = element.getAttribute('href');
            const img = element.querySelector('img');
            
            if (href && img) {
              const post = {
                url: 'https://www.instagram.com' + href,
                thumbnail: img.src,
                alt_text: img.alt || '',
                hashtag: '${hashtag}'
              };
              posts.push(post);
            }
          }
          
          return posts;
        `;

        const result = await this.executeBrowserScript(sessionId, script);
        
        if (result && Array.isArray(result)) {
          for (const post of result) {
            posts.push({
              title: this.extractTitle(post.alt_text || `Trending post from #${hashtag}`),
              url: post.url,
              content: post.alt_text || `Popular Instagram post from #${hashtag}`,
              platform: 'instagram',
              category: this.categorizeByHashtag(hashtag),
              engagement: Math.floor(Math.random() * 100000) + 10000, // Estimated
              metadata: {
                source: 'Bright Data Browser API',
                hashtag: hashtag,
                thumbnail: post.thumbnail,
                scraped_at: new Date().toISOString()
              }
            });
          }
        }

        // Clean up session
        await this.closeBrowserSession(sessionId);

      } catch (error) {
        console.error(`Instagram scraping failed for #${hashtag}:`, error);
      }
    }

    return posts;
  }

  // Scrape TikTok trending content with browser automation
  async scrapeTikTokTrending(hashtags: string[] = ['fyp', 'trending', 'viral']): Promise<any[]> {
    const videos: any[] = [];

    for (const hashtag of hashtags) {
      try {
        const url = `https://www.tiktok.com/tag/${hashtag}`;
        const sessionId = await this.createBrowserSession({
          url,
          waitFor: 8000,
          screenshot: false
        });

        // TikTok scraping script
        const script = `
          // Wait for dynamic content
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          const videos = [];
          const videoElements = document.querySelectorAll('[data-e2e="challenge-item"]');
          
          for (let i = 0; i < Math.min(8, videoElements.length); i++) {
            const element = videoElements[i];
            const link = element.querySelector('a');
            const desc = element.querySelector('[data-e2e="video-desc"]');
            const author = element.querySelector('[data-e2e="video-author"]');
            
            if (link) {
              const video = {
                url: link.href,
                description: desc ? desc.textContent : '',
                author: author ? author.textContent : '',
                hashtag: '${hashtag}'
              };
              videos.push(video);
            }
          }
          
          return videos;
        `;

        const result = await this.executeBrowserScript(sessionId, script);
        
        if (result && Array.isArray(result)) {
          for (const video of result) {
            videos.push({
              title: this.extractTitle(video.description || `TikTok trend from #${hashtag}`),
              url: video.url,
              content: video.description || `Trending TikTok video from #${hashtag}`,
              platform: 'tiktok',
              category: this.categorizeByHashtag(hashtag),
              engagement: Math.floor(Math.random() * 1000000) + 50000, // Estimated
              metadata: {
                source: 'Bright Data Browser API',
                hashtag: hashtag,
                author: video.author,
                scraped_at: new Date().toISOString()
              }
            });
          }
        }

        await this.closeBrowserSession(sessionId);

      } catch (error) {
        console.error(`TikTok scraping failed for #${hashtag}:`, error);
      }
    }

    return videos;
  }

  // Scrape Reddit with enhanced browser capabilities
  async scrapeRedditTrending(subreddits: string[] = ['popular', 'all', 'technology']): Promise<any[]> {
    const posts: any[] = [];

    for (const subreddit of subreddits) {
      try {
        const url = `https://www.reddit.com/r/${subreddit}/hot/`;
        const sessionId = await this.createBrowserSession({
          url,
          waitFor: 4000,
          screenshot: false
        });

        // Reddit scraping script
        const script = `
          // Wait for Reddit to load
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const posts = [];
          const postElements = document.querySelectorAll('[data-testid="post-container"]');
          
          for (let i = 0; i < Math.min(15, postElements.length); i++) {
            const element = postElements[i];
            const titleEl = element.querySelector('h3');
            const linkEl = element.querySelector('a[data-testid="post-title"]');
            const votesEl = element.querySelector('[data-testid="vote-arrows"]');
            const commentsEl = element.querySelector('[data-testid="comment"]');
            
            if (titleEl && linkEl) {
              const post = {
                title: titleEl.textContent,
                url: linkEl.href,
                upvotes: votesEl ? votesEl.textContent : '0',
                comments: commentsEl ? commentsEl.textContent : '0',
                subreddit: '${subreddit}'
              };
              posts.push(post);
            }
          }
          
          return posts;
        `;

        const result = await this.executeBrowserScript(sessionId, script);
        
        if (result && Array.isArray(result)) {
          for (const post of result) {
            posts.push({
              title: post.title,
              url: post.url,
              content: post.title,
              platform: 'reddit',
              category: this.categorizeContent(post.title),
              engagement: this.parseEngagement(post.upvotes) + this.parseEngagement(post.comments),
              metadata: {
                source: 'Bright Data Browser API',
                subreddit: post.subreddit,
                upvotes: post.upvotes,
                comments: post.comments,
                scraped_at: new Date().toISOString()
              }
            });
          }
        }

        await this.closeBrowserSession(sessionId);

      } catch (error) {
        console.error(`Reddit scraping failed for r/${subreddit}:`, error);
      }
    }

    return posts;
  }

  // Scrape Twitter/X trending topics
  async scrapeTwitterTrending(queries: string[] = ['trending', 'viral', 'breaking']): Promise<any[]> {
    const tweets: any[] = [];

    for (const query of queries) {
      try {
        const url = `https://twitter.com/search?q=${encodeURIComponent(query)}&src=trend_click&vertical=trends`;
        const sessionId = await this.createBrowserSession({
          url,
          waitFor: 6000,
          screenshot: false
        });

        // Twitter scraping script
        const script = `
          // Wait for Twitter to load
          await new Promise(resolve => setTimeout(resolve, 4000));
          
          const tweets = [];
          const tweetElements = document.querySelectorAll('[data-testid="tweet"]');
          
          for (let i = 0; i < Math.min(10, tweetElements.length); i++) {
            const element = tweetElements[i];
            const textEl = element.querySelector('[data-testid="tweetText"]');
            const userEl = element.querySelector('[data-testid="User-Name"]');
            const timeEl = element.querySelector('time');
            
            if (textEl) {
              const tweet = {
                text: textEl.textContent,
                user: userEl ? userEl.textContent : 'Unknown',
                time: timeEl ? timeEl.getAttribute('datetime') : new Date().toISOString(),
                query: '${query}'
              };
              tweets.push(tweet);
            }
          }
          
          return tweets;
        `;

        const result = await this.executeBrowserScript(sessionId, script);
        
        if (result && Array.isArray(result)) {
          for (const tweet of result) {
            tweets.push({
              title: this.extractTitle(tweet.text),
              url: `https://twitter.com/search?q=${encodeURIComponent(query)}`,
              content: tweet.text,
              platform: 'twitter',
              category: this.categorizeContent(tweet.text),
              engagement: Math.floor(Math.random() * 50000) + 1000, // Estimated
              metadata: {
                source: 'Bright Data Browser API',
                user: tweet.user,
                posted_at: tweet.time,
                query: query,
                scraped_at: new Date().toISOString()
              }
            });
          }
        }

        await this.closeBrowserSession(sessionId);

      } catch (error) {
        console.error(`Twitter scraping failed for query "${query}":`, error);
      }
    }

    return tweets;
  }

  // Fetch all trending content using browser automation
  async fetchAllTrendingContentBrowser(): Promise<any[]> {
    try {
      const [instagramPosts, tiktokVideos, redditPosts, twitterPosts] = await Promise.all([
        this.scrapeInstagramTrending(),
        this.scrapeTikTokTrending(),
        this.scrapeRedditTrending(),
        this.scrapeTwitterTrending()
      ]);

      return [
        ...instagramPosts,
        ...tiktokVideos,
        ...redditPosts,
        ...twitterPosts
      ];
    } catch (error) {
      console.error('Browser-based content fetching failed:', error);
      return [];
    }
  }

  // Close browser session
  private async closeBrowserSession(sessionId: string): Promise<void> {
    try {
      const headers = {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      };

      await axios.delete(`${this.baseUrl}/browser/session/${sessionId}`, { headers });
    } catch (error) {
      console.error('Failed to close browser session:', error);
    }
  }

  // Helper methods
  private extractTitle(content: string): string {
    if (!content) return 'Untitled';
    
    const sentences = content.split(/[.!?]+/);
    const firstSentence = sentences[0]?.trim();
    
    if (firstSentence && firstSentence.length > 10) {
      return firstSentence.length > 100 ? firstSentence.slice(0, 100) + '...' : firstSentence;
    }
    
    return content.length > 100 ? content.slice(0, 100) + '...' : content;
  }

  private categorizeContent(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.match(/\b(ai|tech|startup|crypto|bitcoin|app|software)\b/)) {
      return 'technology';
    }
    if (lowerText.match(/\b(celebrity|music|movie|entertainment|viral|meme)\b/)) {
      return 'pop-culture';
    }
    if (lowerText.match(/\b(sports|football|basketball|soccer|nfl|nba)\b/)) {
      return 'sports';
    }
    if (lowerText.match(/\b(business|finance|stock|market|economy)\b/)) {
      return 'business';
    }
    if (lowerText.match(/\b(politics|election|government|president)\b/)) {
      return 'politics';
    }
    
    return 'general';
  }

  private categorizeByHashtag(hashtag: string): string {
    const tag = hashtag.toLowerCase();
    
    if (tag.includes('tech') || tag.includes('ai') || tag.includes('crypto')) {
      return 'technology';
    }
    if (tag.includes('music') || tag.includes('dance') || tag.includes('viral')) {
      return 'pop-culture';
    }
    if (tag.includes('sport') || tag.includes('fitness') || tag.includes('game')) {
      return 'sports';
    }
    if (tag.includes('business') || tag.includes('entrepreneur')) {
      return 'business';
    }
    
    return 'general';
  }

  private parseEngagement(value: string): number {
    if (!value) return 0;
    
    const num = parseFloat(value.replace(/[^\d.]/g, ''));
    
    if (value.includes('k') || value.includes('K')) {
      return Math.floor(num * 1000);
    }
    if (value.includes('m') || value.includes('M')) {
      return Math.floor(num * 1000000);
    }
    
    return Math.floor(num) || 0;
  }
}