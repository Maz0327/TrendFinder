import { supabase } from '@shared/supabase-client';

// Service for calling Supabase Edge Functions
export class SupabaseFunctionsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL 
      ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
      : '';
  }

  // Call content analysis edge function
  async analyzeContent(content: string, platform: string, captureId?: string) {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-content', {
        body: { content, platform, captureId },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error analyzing content:', error);
      return null;
    }
  }

  // Call truth analysis edge function
  async analyzeTruth(content: string, captureId?: string) {
    try {
      const { data, error } = await supabase.functions.invoke('truth-analysis', {
        body: { content, captureId },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error analyzing truth:', error);
      return null;
    }
  }

  // Call brief generation edge function
  async generateBrief(briefId: string, captureIds: string[], clientProfileId?: string) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-brief', {
        body: { briefId, captureIds, clientProfileId },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating brief:', error);
      return null;
    }
  }

  // Call cultural moment detection
  async detectCulturalMoment(captures: any[]) {
    try {
      const { data, error } = await supabase.functions.invoke('detect-cultural-moment', {
        body: { captures },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error detecting cultural moment:', error);
      return null;
    }
  }

  // Call hypothesis validation
  async validateHypothesis(hypothesisId: string, metrics: any) {
    try {
      const { data, error } = await supabase.functions.invoke('validate-hypothesis', {
        body: { hypothesisId, metrics },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error validating hypothesis:', error);
      return null;
    }
  }
}

// Export singleton instance
export const functionsService = new SupabaseFunctionsService();