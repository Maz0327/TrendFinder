// AI Analysis Service - GPT-4.1 + Gemini 2.5 Pro unified
// Part of 2025 rebuild - Consolidated from multiple OpenAI services
// Intelligent routing between models based on content type

import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

interface AnalysisConfig {
  mode: 'quick' | 'deep';
  contentType: 'text' | 'image' | 'video' | 'audio';
  truthAnalysisFramework: boolean;
}

interface TruthAnalysisResult {
  fact: { claims: string[]; sources: string[]; verificationStatus: string; confidence: number };
  observation: { behaviorPatterns: string[]; audienceSignals: any; contextualFactors: string[] };
  insight: { strategicImplications: string[]; opportunityMapping: any; riskAssessment: any };
  humanTruth: { emotionalUndercurrent: any; culturalContext: any; psychologicalDrivers: any };
  culturalMoment: { trendAlignment: any; viralPotential: number; competitiveAdvantage: any };
}

export class AIAnalysisService {
  private openai: OpenAI;
  private gemini: GoogleGenAI;
  private isInitialized: boolean = false;

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY || '' 
    });
    
    this.gemini = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY || '' 
    });
  }

  async initialize(): Promise<boolean> {
    try {
      if (!process.env.OPENAI_API_KEY || !process.env.GEMINI_API_KEY) {
        console.log('⚠️  AI service credentials missing');
        return false;
      }

      // Test GPT-4.1 access
      await this.testGPT41Access();
      
      // Test Gemini 2.5 Pro access  
      await this.testGeminiAccess();
      
      this.isInitialized = true;
      console.log('✅ AI Analysis Service initialized - GPT-4.1 + Gemini 2.5 Pro ready');
      
      return true;
    } catch (error) {
      console.log('❌ AI Analysis Service initialization failed:', error.message);
      return false;
    }
  }

  async analyzeTruth(content: string, config: AnalysisConfig): Promise<TruthAnalysisResult | null> {
    try {
      if (!this.isInitialized) {
        throw new Error('AI Analysis Service not initialized');
      }

      const model = config.mode === 'quick' ? 'gpt-4o-mini' : 'gpt-4.1-2025-04-14';
      
      const prompt = this.buildTruthAnalysisPrompt(content);
      
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a strategic intelligence analyst specializing in the Truth Analysis Framework. Analyze content through the lens of fact → observation → insight → human truth → cultural moment.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: config.mode === 'quick' ? 1000 : 2000,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
      
    } catch (error) {
      console.log('❌ Truth analysis failed:', error.message);
      return null;
    }
  }

  async analyzeVisual(imageData: string, config: AnalysisConfig): Promise<any> {
    try {
      if (!this.isInitialized) {
        throw new Error('AI Analysis Service not initialized');
      }

      // Use Gemini 2.5 Pro for visual analysis
      const response = await this.gemini.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [
          {
            inlineData: {
              data: imageData,
              mimeType: 'image/jpeg',
            },
          },
          'Analyze this image for brand elements, cultural signals, and strategic intelligence insights. Return detailed JSON analysis.',
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      return JSON.parse(response.text || '{}');
      
    } catch (error) {
      console.log('❌ Visual analysis failed:', error.message);
      return null;
    }
  }

  private buildTruthAnalysisPrompt(content: string): string {
    return `Analyze this content using the Truth Analysis Framework. Return JSON with these exact fields:

{
  "fact": {
    "claims": ["specific factual claims"],
    "sources": ["source verification"],
    "verificationStatus": "verified/unverified/disputed",
    "confidence": 0.85
  },
  "observation": {
    "behaviorPatterns": ["observable patterns"],
    "audienceSignals": {"engagement": "high", "sentiment": "positive"},
    "contextualFactors": ["context elements"]
  },
  "insight": {
    "strategicImplications": ["strategic implications"],
    "opportunityMapping": {"opportunities": ["list"]},
    "riskAssessment": {"risks": ["list"]}
  },
  "humanTruth": {
    "emotionalUndercurrent": {"primary": "emotion", "intensity": "level"},
    "culturalContext": {"signals": ["cultural signals"]},
    "psychologicalDrivers": {"drivers": ["psychological factors"]}
  },
  "culturalMoment": {
    "trendAlignment": {"trends": ["aligned trends"]},
    "viralPotential": 0.75,
    "competitiveAdvantage": {"advantages": ["list"]}
  }
}

Content to analyze: ${content}`;
  }

  private async testGPT41Access(): Promise<void> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4.1-2025-04-14',
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 10,
    });
    if (!response.choices[0]?.message?.content) {
      throw new Error('GPT-4.1 access test failed');
    }
  }

  private async testGeminiAccess(): Promise<void> {
    const response = await this.gemini.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: 'Test',
    });
    if (!response.text) {
      throw new Error('Gemini 2.5 Pro access test failed');
    }
  }

  getStatus(): { initialized: boolean; models: { gpt41: boolean; gemini: boolean } } {
    return {
      initialized: this.isInitialized,
      models: {
        gpt41: Boolean(process.env.OPENAI_API_KEY),
        gemini: Boolean(process.env.GEMINI_API_KEY),
      },
    };
  }
}

export const aiAnalysisService = new AIAnalysisService();