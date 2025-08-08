// Intelligent Visual Analysis Service - Phase 3
// Routes visual analysis to Gemini 2.5 Pro or Google Vision based on content

import { GoogleGenerativeAI } from '@google/generative-ai';
import vision from '@google-cloud/vision';
import { ApiError } from '../utils/errors';
import { debugLogger } from './debug-logger';
import { systemMonitor } from './system-monitor';

interface VisualAnalysisRequest {
  images?: string[];
  videoUrl?: string;
  context?: {
    url?: string;
    platform?: string | null;
  };
  analysisType?: 'brand' | 'cultural' | 'competitive' | 'general';
}

interface VisualAnalysisResult {
  geminiAnalysis?: {
    brandElements?: string[];
    culturalContext?: string;
    visualTrends?: string[];
    competitiveInsights?: string;
    overallAssessment?: string;
  };
  visionAnalysis?: {
    text?: string[];
    logos?: string[];
    objects?: string[];
    dominantColors?: string[];
    faces?: number;
    landmarks?: string[];
  };
  combinedInsights?: string;
  processingTime: number;
}

class IntelligentVisualAnalysisService {
  private geminiClient: GoogleGenerativeAI;
  private visionClient: vision.ImageAnnotatorClient;
  private geminiModel: any;

  constructor() {
    // Initialize Gemini 2.5 Pro
    if (!process.env.GEMINI_API_KEY) {
      debugLogger.error('GEMINI_API_KEY not configured');
    }
    this.geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.geminiModel = this.geminiClient.getGenerativeModel({ model: 'gemini-2.5-pro' });

    // Initialize Google Vision
    try {
      this.visionClient = new vision.ImageAnnotatorClient();
    } catch (error) {
      debugLogger.error('Google Vision client initialization failed', error as Error);
    }
  }

  async analyzeVisual(request: VisualAnalysisRequest): Promise<VisualAnalysisResult> {
    const startTime = Date.now();

    try {
      const promises: Promise<any>[] = [];
      const result: VisualAnalysisResult = {
        processingTime: 0
      };

      // Determine which services to use based on content and request type
      const useGemini = this.shouldUseGemini(request);
      const useVision = this.shouldUseVision(request);

      if (useGemini && request.images?.length) {
        promises.push(
          this.analyzeWithGemini(request)
            .then(geminiResult => {
              result.geminiAnalysis = geminiResult;
            })
            .catch(error => {
              debugLogger.error('Gemini analysis failed', error);
            })
        );
      }

      if (useVision && request.images?.length) {
        promises.push(
          this.analyzeWithVision(request.images)
            .then(visionResult => {
              result.visionAnalysis = visionResult;
            })
            .catch(error => {
              debugLogger.error('Vision analysis failed', error);
            })
        );
      }

      // Wait for all analyses to complete
      await Promise.all(promises);

      // Combine insights if both analyses were performed
      if (result.geminiAnalysis && result.visionAnalysis) {
        result.combinedInsights = this.combineInsights(result);
      }

      result.processingTime = Date.now() - startTime;
      systemMonitor.recordApiCall('POST', '/analyze/visual', 200, result.processingTime);

      return result;
    } catch (error) {
      systemMonitor.recordApiCall('POST', '/analyze/visual', 500, Date.now() - startTime);
      throw new ApiError(500, 'Visual analysis failed', error as Error);
    }
  }

  private shouldUseGemini(request: VisualAnalysisRequest): boolean {
    // Use Gemini for complex visual understanding
    return !!(
      request.analysisType === 'brand' ||
      request.analysisType === 'cultural' ||
      request.analysisType === 'competitive' ||
      request.context?.platform === 'instagram' ||
      request.context?.platform === 'tiktok'
    );
  }

  private shouldUseVision(request: VisualAnalysisRequest): boolean {
    // Use Vision for specific detection tasks
    return !!(
      request.analysisType === 'general' ||
      !request.analysisType // Default to Vision for basic analysis
    );
  }

  private async analyzeWithGemini(request: VisualAnalysisRequest): Promise<any> {
    try {
      const prompt = this.buildGeminiPrompt(request);
      
      // Convert images to Gemini format
      const imageParts = await Promise.all(
        (request.images || []).slice(0, 5).map(async (imageUrl) => {
          const imageData = await this.fetchImageAsBase64(imageUrl);
          return {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageData
            }
          };
        })
      );

      // Generate content with Gemini
      const result = await this.geminiModel.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();

      // Parse structured response
      return this.parseGeminiResponse(text, request.analysisType);
    } catch (error) {
      debugLogger.error('Gemini visual analysis error', error as Error);
      throw error;
    }
  }

  private buildGeminiPrompt(request: VisualAnalysisRequest): string {
    const basePrompt = `Analyze these images with a focus on strategic intelligence for brands and marketers. `;

    const typePrompts = {
      brand: `Identify:
1. Brand elements (logos, colors, typography, visual identity)
2. Brand positioning and messaging cues
3. Target audience indicators
4. Competitive differentiation elements
5. Brand consistency and evolution patterns`,

      cultural: `Identify:
1. Cultural moments and references
2. Generational markers and trends
3. Social movements or causes represented
4. Lifestyle and value indicators
5. Emerging cultural patterns`,

      competitive: `Analyze:
1. Market positioning strategies
2. Unique selling propositions visible
3. Category conventions being followed or broken
4. Innovation elements
5. Competitive advantages displayed`,

      general: `Provide:
1. Overall visual assessment
2. Key themes and messages
3. Emotional tone and impact
4. Production quality and style
5. Strategic implications`
    };

    const contextPrompt = request.context?.platform 
      ? `\n\nContext: This content is from ${request.context.platform}.`
      : '';

    return basePrompt + (typePrompts[request.analysisType || 'general'] || typePrompts.general) + contextPrompt;
  }

  private async analyzeWithVision(images: string[]): Promise<any> {
    try {
      const analysisPromises = images.slice(0, 5).map(async (imageUrl) => {
        const imageBuffer = await this.fetchImageAsBuffer(imageUrl);
        
        // Perform multiple detection types
        const [result] = await this.visionClient.annotateImage({
          image: { content: imageBuffer.toString('base64') },
          features: [
            { type: 'TEXT_DETECTION' },
            { type: 'LOGO_DETECTION' },
            { type: 'OBJECT_LOCALIZATION' },
            { type: 'IMAGE_PROPERTIES' },
            { type: 'FACE_DETECTION' },
            { type: 'LANDMARK_DETECTION' }
          ]
        });

        return result;
      });

      const results = await Promise.all(analysisPromises);
      
      // Aggregate results
      return this.aggregateVisionResults(results);
    } catch (error) {
      debugLogger.error('Google Vision analysis error', error as Error);
      throw error;
    }
  }

  private aggregateVisionResults(results: any[]): any {
    const aggregated = {
      text: new Set<string>(),
      logos: new Set<string>(),
      objects: new Set<string>(),
      dominantColors: new Set<string>(),
      faces: 0,
      landmarks: new Set<string>()
    };

    for (const result of results) {
      // Text detection
      if (result.textAnnotations?.length) {
        result.textAnnotations.forEach((text: any) => {
          if (text.description) {
            aggregated.text.add(text.description);
          }
        });
      }

      // Logo detection
      if (result.logoAnnotations?.length) {
        result.logoAnnotations.forEach((logo: any) => {
          if (logo.description) {
            aggregated.logos.add(logo.description);
          }
        });
      }

      // Object detection
      if (result.localizedObjectAnnotations?.length) {
        result.localizedObjectAnnotations.forEach((object: any) => {
          if (object.name) {
            aggregated.objects.add(object.name);
          }
        });
      }

      // Color detection
      if (result.imagePropertiesAnnotation?.dominantColors?.colors) {
        result.imagePropertiesAnnotation.dominantColors.colors
          .slice(0, 3)
          .forEach((color: any) => {
            const rgb = color.color;
            if (rgb) {
              const hex = this.rgbToHex(rgb.red || 0, rgb.green || 0, rgb.blue || 0);
              aggregated.dominantColors.add(hex);
            }
          });
      }

      // Face detection
      if (result.faceAnnotations?.length) {
        aggregated.faces += result.faceAnnotations.length;
      }

      // Landmark detection
      if (result.landmarkAnnotations?.length) {
        result.landmarkAnnotations.forEach((landmark: any) => {
          if (landmark.description) {
            aggregated.landmarks.add(landmark.description);
          }
        });
      }
    }

    // Convert sets to arrays
    return {
      text: Array.from(aggregated.text),
      logos: Array.from(aggregated.logos),
      objects: Array.from(aggregated.objects),
      dominantColors: Array.from(aggregated.dominantColors),
      faces: aggregated.faces,
      landmarks: Array.from(aggregated.landmarks)
    };
  }

  private parseGeminiResponse(text: string, analysisType?: string): any {
    // Parse structured response from Gemini
    const result: any = {};

    // Extract sections based on analysis type
    const sections = text.split(/\n\d+\.\s+/);
    
    if (analysisType === 'brand') {
      result.brandElements = this.extractListItems(sections[1] || '');
      result.brandPositioning = sections[2] || '';
      result.targetAudience = sections[3] || '';
      result.differentiation = sections[4] || '';
      result.consistency = sections[5] || '';
    } else if (analysisType === 'cultural') {
      result.culturalMoments = this.extractListItems(sections[1] || '');
      result.generationalMarkers = sections[2] || '';
      result.socialMovements = sections[3] || '';
      result.lifestyleIndicators = sections[4] || '';
      result.emergingPatterns = sections[5] || '';
    } else {
      result.overallAssessment = text;
    }

    return result;
  }

  private extractListItems(text: string): string[] {
    return text
      .split(/[\n•\-]/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  private combineInsights(result: VisualAnalysisResult): string {
    const insights: string[] = [];

    // Add Gemini insights
    if (result.geminiAnalysis?.overallAssessment) {
      insights.push(`Strategic Assessment: ${result.geminiAnalysis.overallAssessment}`);
    }

    // Add Vision insights
    if (result.visionAnalysis?.logos?.length) {
      insights.push(`Brands Detected: ${result.visionAnalysis.logos.join(', ')}`);
    }

    if (result.visionAnalysis?.text?.length) {
      const keyText = result.visionAnalysis.text.slice(0, 3).join(' ');
      insights.push(`Key Text: ${keyText}`);
    }

    if (result.visionAnalysis?.dominantColors?.length) {
      insights.push(`Color Palette: ${result.visionAnalysis.dominantColors.join(', ')}`);
    }

    return insights.join('\n\n');
  }

  private async fetchImageAsBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    } catch (error) {
      debugLogger.error('Failed to fetch image', error as Error);
      throw new ApiError(400, 'Failed to fetch image for analysis');
    }
  }

  private async fetchImageAsBuffer(url: string): Promise<Buffer> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      debugLogger.error('Failed to fetch image', error as Error);
      throw new ApiError(400, 'Failed to fetch image for analysis');
    }
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  // Public method to check service availability
  async checkServiceHealth(): Promise<{
    gemini: boolean;
    vision: boolean;
  }> {
    const health = {
      gemini: false,
      vision: false
    };

    // Check Gemini
    try {
      await this.geminiModel.generateContent('Test');
      health.gemini = true;
    } catch (error) {
      debugLogger.error('Gemini health check failed', error as Error);
    }

    // Check Vision
    try {
      // Simple API call to check connectivity
      await this.visionClient.annotateImage({
        image: { source: { imageUri: 'gs://cloud-samples-data/vision/logo/google_logo.jpg' } },
        features: [{ type: 'LOGO_DETECTION' }]
      });
      health.vision = true;
    } catch (error) {
      debugLogger.error('Vision health check failed', error as Error);
    }

    return health;
  }
}

export const intelligentVisualAnalysisService = new IntelligentVisualAnalysisService();