// Analysis Orchestrator Service - Phase 3
// Central coordination for all content analysis operations

import { aiAnalysisService } from './aiAnalysisService';
import { db } from '../db';
import { captures, projects } from '@shared/schema';
import { eq } from 'drizzle-orm';
import type { Capture } from '@shared/schema';
import { ApiError } from '../utils/errors';
import { debugLogger } from './debug-logger';
import { systemMonitor } from './system-monitor';
import { intelligentVisualAnalysisService } from './intelligentVisualAnalysisService';
import { analysisResults } from '@shared/schema';
import type { AnalysisResult, InsertAnalysisResult } from '@shared/schema';

export interface AnalysisTier {
  mode: 'quick' | 'standard' | 'deep';
  model: string;
  sentenceCount: string;
  maxTokens: number;
}

export interface AnalysisRequest {
  captureId: string;
  tier: AnalysisTier;
  includeVisual?: boolean;
  urgency?: 'low' | 'normal' | 'high';
}

export interface OrchestrationResult {
  captureId: string;
  truthAnalysis?: AnalysisResult;
  visualAnalysis?: any;
  metadata: {
    duration: number;
    servicesUsed: string[];
    cacheHit: boolean;
    tier: string;
  };
}

class AnalysisOrchestrator {
  private readonly tiers: Record<string, AnalysisTier> = {
    quick: {
      mode: 'quick',
      model: 'gpt-4o-mini',
      sentenceCount: '2-4',
      maxTokens: 150
    },
    standard: {
      mode: 'standard',
      model: 'gpt-4.1-2025-04-14',
      sentenceCount: '4-7',
      maxTokens: 300
    },
    deep: {
      mode: 'deep',
      model: 'gpt-4.1-2025-04-14',
      sentenceCount: '8-12',
      maxTokens: 500
    }
  };

  private analysisQueue: Map<string, Promise<OrchestrationResult>> = new Map();

  async analyzeCapture(request: AnalysisRequest): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const servicesUsed: string[] = [];

    try {
      // Check if analysis already in progress
      const existingAnalysis = this.analysisQueue.get(request.captureId);
      if (existingAnalysis) {
        debugLogger.info('Analysis already in progress, waiting...', { captureId: request.captureId });
        return await existingAnalysis;
      }

      // Create analysis promise
      const analysisPromise = this.performAnalysis(request);
      this.analysisQueue.set(request.captureId, analysisPromise);

      try {
        const result = await analysisPromise;
        return result;
      } finally {
        this.analysisQueue.delete(request.captureId);
      }
    } catch (error) {
      debugLogger.error('Analysis orchestration failed', error as Error);
      throw error;
    }
  }

  private async performAnalysis(request: AnalysisRequest): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const servicesUsed: string[] = [];
    let cacheHit = false;

    try {
      // 1. Fetch capture data
      const capture = await this.fetchCapture(request.captureId);
      if (!capture) {
        throw new ApiError(404, 'Capture not found');
      }

      // 2. Check for existing analysis at same or higher tier
      const existingAnalysis = await this.checkExistingAnalysis(capture.id, request.tier);
      if (existingAnalysis) {
        debugLogger.info('Using cached analysis', { captureId: capture.id, tier: request.tier.mode });
        cacheHit = true;
        
        return {
          captureId: capture.id,
          truthAnalysis: existingAnalysis,
          metadata: {
            duration: Date.now() - startTime,
            servicesUsed: ['cache'],
            cacheHit: true,
            tier: request.tier.mode
          }
        };
      }

      // 3. Extract metadata from capture
      const metadata = await this.extractMetadata(capture);

      // 4. Run parallel analysis based on content type
      const analysisPromises: Promise<any>[] = [];

      // Always run Truth Analysis
      analysisPromises.push(
        this.runTruthAnalysis(capture, request.tier, metadata)
          .then(result => {
            servicesUsed.push('truthAnalysis');
            return { type: 'truth', result };
          })
      );

      // Run visual analysis if content has images/videos
      if (request.includeVisual && this.hasVisualContent(capture)) {
        analysisPromises.push(
          this.runVisualAnalysis(capture)
            .then(result => {
              servicesUsed.push('visualAnalysis');
              return { type: 'visual', result };
            })
        );
      }

      // Wait for all analyses to complete
      const results = await Promise.allSettled(analysisPromises);

      // Process results
      let truthAnalysis: AnalysisResult | undefined;
      let visualAnalysis: any | undefined;

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { type, result: data } = result.value;
          if (type === 'truth') {
            truthAnalysis = data;
          } else if (type === 'visual') {
            visualAnalysis = data;
          }
        } else {
          debugLogger.error('Analysis component failed', result.reason as Error);
        }
      }

      // 5. Combine and cache results
      if (truthAnalysis) {
        await this.cacheAnalysis(capture.id, truthAnalysis, request.tier);
      }

      // 6. Track performance metrics
      const duration = Date.now() - startTime;
      systemMonitor.recordApiCall('POST', '/analyze/orchestrate', 200, duration);

      return {
        captureId: capture.id,
        truthAnalysis,
        visualAnalysis,
        metadata: {
          duration,
          servicesUsed,
          cacheHit,
          tier: request.tier.mode
        }
      };
    } catch (error) {
      systemMonitor.recordApiCall('POST', '/analyze/orchestrate', 500, Date.now() - startTime);
      throw error;
    }
  }

  private async fetchCapture(captureId: string): Promise<Capture | null> {
    const [capture] = await db
      .select()
      .from(captures)
      .where(eq(captures.id, captureId))
      .limit(1);

    return capture || null;
  }

  private async checkExistingAnalysis(
    captureId: string, 
    requestedTier: AnalysisTier
  ): Promise<AnalysisResult | null> {
    // Check for existing analysis at same or higher tier
    const tierPriority = { quick: 1, standard: 2, deep: 3 };
    const requestedPriority = tierPriority[requestedTier.mode];

    const [existing] = await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.captureId, captureId))
      .limit(1);

    if (existing) {
      const existingPriority = tierPriority[existing.tier as keyof typeof tierPriority] || 0;
      
      // Use existing if it's same or higher tier
      if (existingPriority >= requestedPriority) {
        return existing;
      }
    }

    return null;
  }

  private async extractMetadata(capture: Capture): Promise<any> {
    const metadata: any = {
      platform: this.detectPlatform(capture.sourceUrl),
      contentType: capture.contentType,
      hasText: !!capture.content?.text,
      hasImages: !!capture.content?.images?.length,
      hasVideo: !!capture.content?.videoUrl,
      wordCount: capture.content?.text?.split(/\s+/).length || 0
    };

    // Extract platform-specific metadata
    if (metadata.platform) {
      metadata.platformData = this.extractPlatformData(capture.sourceUrl, metadata.platform);
    }

    return metadata;
  }

  private detectPlatform(url: string): string | null {
    const platformPatterns = {
      instagram: /instagram\.com/i,
      youtube: /youtube\.com|youtu\.be/i,
      tiktok: /tiktok\.com/i,
      linkedin: /linkedin\.com/i,
      twitter: /twitter\.com|x\.com/i,
      reddit: /reddit\.com/i
    };

    for (const [platform, pattern] of Object.entries(platformPatterns)) {
      if (pattern.test(url)) {
        return platform;
      }
    }

    return null;
  }

  private extractPlatformData(url: string, platform: string): any {
    // Extract IDs and other platform-specific data
    const data: any = { platform };

    switch (platform) {
      case 'instagram':
        const instagramMatch = url.match(/\/p\/([^\/]+)/);
        if (instagramMatch) data.postId = instagramMatch[1];
        break;
      
      case 'youtube':
        const youtubeMatch = url.match(/[?&]v=([^&]+)/);
        if (youtubeMatch) data.videoId = youtubeMatch[1];
        break;
      
      case 'tiktok':
        const tiktokMatch = url.match(/\/video\/(\d+)/);
        if (tiktokMatch) data.videoId = tiktokMatch[1];
        break;
    }

    return data;
  }

  private hasVisualContent(capture: Capture): boolean {
    return !!(
      capture.screenshotUrl || 
      capture.visualAnalysis ||
      capture.type === 'screenshot' ||
      capture.type === 'image'
    );
  }

  private async runTruthAnalysis(
    capture: Capture,
    tier: AnalysisTier,
    metadata: any
  ): Promise<AnalysisResult> {
    try {
      // Prepare content for analysis
      const analysisContent = this.prepareContentForAnalysis(capture, metadata);

      // Run Truth Analysis with specified tier
      const result = await aiAnalysisService.analyzeTruth({
        content: analysisContent,
        context: {
          url: capture.url || '',
          platform: metadata.platform,
          contentType: capture.type
        },
        tier: tier.mode,
        projectId: capture.projectId || ''
      });

      // Create analysis result record
      const analysisResult: InsertAnalysisResult = {
        id: crypto.randomUUID(),
        captureId: capture.id,
        fact: result.fact,
        observation: result.observation,
        insight: result.insight,
        humanTruth: result.humanTruth,
        culturalMoment: result.culturalMoment,
        tier: tier.mode,
        processingTime: 0, // Calculate from result if available
        createdAt: new Date()
      };

      // Save to database
      const [saved] = await db
        .insert(analysisResults)
        .values(analysisResult)
        .returning();

      return saved;
    } catch (error) {
      debugLogger.error('Truth analysis failed', error as Error);
      throw new ApiError(500, 'Truth analysis failed');
    }
  }

  private async runVisualAnalysis(capture: Capture): Promise<any> {
    try {
      if (!capture.content?.images?.length && !capture.content?.videoUrl) {
        return null;
      }

      // Use intelligent visual analysis service
      const result = await intelligentVisualAnalysisService.analyzeVisual({
        images: capture.content.images || [],
        videoUrl: capture.content.videoUrl,
        context: {
          url: capture.sourceUrl,
          platform: this.detectPlatform(capture.sourceUrl)
        }
      });

      return result;
    } catch (error) {
      debugLogger.error('Visual analysis failed', error as Error);
      // Don't throw - visual analysis is optional
      return null;
    }
  }

  private prepareContentForAnalysis(capture: Capture, metadata: any): string {
    const parts: string[] = [];

    // Add main text content
    if (capture.content) {
      parts.push(capture.content);
    }

    // Add title if available
    if (capture.title) {
      parts.push(`Title: ${capture.title}`);
    }

    // Add relevant metadata
    if (metadata.platform) {
      parts.push(`Platform: ${metadata.platform}`);
    }

    // Add visual content descriptions if no text
    if (!capture.content && capture.screenshotUrl) {
      parts.push(`[Visual content: screenshot captured]`);
    }

    return parts.join('\n\n');
  }

  private async cacheAnalysis(
    captureId: string,
    analysis: AnalysisResult,
    tier: AnalysisTier
  ): Promise<void> {
    // Analysis is already saved in runTruthAnalysis
    // This method could be extended for additional caching strategies
    debugLogger.info('Analysis cached', { captureId, tier: tier.mode });
  }

  async getAnalysisStatus(captureId: string): Promise<{
    inProgress: boolean;
    completed: boolean;
    result?: AnalysisResult;
  }> {
    // Check if analysis is in progress
    const inProgress = this.analysisQueue.has(captureId);

    // Check for completed analysis
    const [result] = await db
      .select()
      .from(analysisResults)
      .where(eq(analysisResults.captureId, captureId))
      .limit(1);

    return {
      inProgress,
      completed: !!result,
      result: result || undefined
    };
  }

  async batchAnalyze(
    captureIds: string[],
    tier: AnalysisTier,
    options?: { parallel?: number }
  ): Promise<OrchestrationResult[]> {
    const parallel = options?.parallel || 3; // Default to 3 parallel analyses
    const results: OrchestrationResult[] = [];

    // Process in batches
    for (let i = 0; i < captureIds.length; i += parallel) {
      const batch = captureIds.slice(i, i + parallel);
      
      const batchPromises = batch.map(captureId =>
        this.analyzeCapture({
          captureId,
          tier,
          includeVisual: true
        }).catch(error => {
          debugLogger.error(`Batch analysis failed for ${captureId}`, error as Error);
          return null;
        })
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(Boolean) as OrchestrationResult[]);
    }

    return results;
  }

  // Get recommended tier based on content
  getRecommendedTier(capture: Capture): AnalysisTier {
    const wordCount = capture.content?.split(/\s+/).length || 0;
    const hasVisuals = this.hasVisualContent(capture);
    const platform = this.detectPlatform(capture.url || '');

    // Deep analysis for long-form content or important platforms
    if (wordCount > 500 || platform === 'linkedin') {
      return this.tiers.deep;
    }

    // Standard for medium content or visual-heavy
    if (wordCount > 150 || hasVisuals) {
      return this.tiers.standard;
    }

    // Quick for short content
    return this.tiers.quick;
  }
}

export const analysisOrchestrator = new AnalysisOrchestrator();