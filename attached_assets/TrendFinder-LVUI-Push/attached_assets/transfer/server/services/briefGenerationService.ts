// Brief Generation Service - Jimmy John's template automation
// Part of 2025 rebuild - Consolidated brief generation with AI

import { db } from '../db';
import { briefs, captures, briefCaptures } from '../../shared/supabase-schema';
import { eq, and, inArray } from 'drizzle-orm';
import { aiAnalysisService } from './aiAnalysisService';
import { googleIntegrationService } from './googleIntegrationService';
import type { InsertBrief, Brief, Capture } from '../../shared/supabase-schema';

interface BriefSection {
  id: string;
  title: string;
  content: any;
  captures: Capture[];
}

interface JimmyJohnsBrief {
  performance: BriefSection;
  culturalSignals: BriefSection;
  platformSignals: BriefSection;
  opportunities: BriefSection;
  cohorts: BriefSection;
  ideation: BriefSection;
}

export class BriefGenerationService {
  private static instance: BriefGenerationService;

  static getInstance(): BriefGenerationService {
    if (!BriefGenerationService.instance) {
      BriefGenerationService.instance = new BriefGenerationService();
    }
    return BriefGenerationService.instance;
  }

  async generateBrief(projectId: string, userId: string, captureIds: string[]): Promise<Brief> {
    try {
      // Create brief record
      const [brief] = await db
        .insert(briefs)
        .values({
          projectId,
          userId,
          title: `Strategic Brief - ${new Date().toLocaleDateString()}`,
          templateType: 'jimmy-johns',
          status: 'generating',
        })
        .returning();

      // Fetch captures for analysis
      const selectedCaptures = await db
        .select()
        .from(captures)
        .where(inArray(captures.id, captureIds));

      // Generate brief sections using AI
      const sections = await this.generateJimmyJohnsSections(selectedCaptures);

      // Update brief with generated content
      const [updatedBrief] = await db
        .update(briefs)
        .set({
          performanceSection: sections.performance.content,
          culturalSignalsSection: sections.culturalSignals.content,
          platformSignalsSection: sections.platformSignals.content,
          opportunitiesSection: sections.opportunities.content,
          cohortsSection: sections.cohorts.content,
          ideationSection: sections.ideation.content,
          status: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(briefs.id, brief.id))
        .returning();

      // Link captures to brief sections
      await this.linkCapturesToBrief(brief.id, sections);

      return updatedBrief;
    } catch (error) {
      console.error('Generate brief error:', error);
      throw new Error('Failed to generate brief');
    }
  }

  private async generateJimmyJohnsSections(captures: Capture[]): Promise<JimmyJohnsBrief> {
    // Categorize captures by their tags and analysis
    const performance = captures.filter(c => 
      c.tags?.includes('performance') || 
      c.truthAnalysis?.insight?.strategicImplications?.some(s => s.includes('performance'))
    );

    const cultural = captures.filter(c => 
      c.tags?.includes('cultural') || 
      c.truthAnalysis?.culturalMoment
    );

    const platform = captures.filter(c => 
      c.platform && ['instagram', 'tiktok', 'linkedin', 'reddit'].includes(c.platform)
    );

    // Generate section content using AI
    const sections: JimmyJohnsBrief = {
      performance: {
        id: 'performance',
        title: 'Performance & Results',
        content: await this.generateSectionContent('performance', performance),
        captures: performance,
      },
      culturalSignals: {
        id: 'cultural-signals',
        title: 'Cultural Signals & Moments',
        content: await this.generateSectionContent('cultural', cultural),
        captures: cultural,
      },
      platformSignals: {
        id: 'platform-signals',
        title: 'Platform-Specific Signals',
        content: await this.generateSectionContent('platform', platform),
        captures: platform,
      },
      opportunities: {
        id: 'opportunities',
        title: 'Strategic Opportunities',
        content: await this.generateSectionContent('opportunities', captures),
        captures: captures,
      },
      cohorts: {
        id: 'cohorts',
        title: 'Audience Cohorts',
        content: await this.generateSectionContent('cohorts', captures),
        captures: captures,
      },
      ideation: {
        id: 'ideation',
        title: 'Creative Ideation',
        content: await this.generateSectionContent('ideation', captures),
        captures: captures,
      },
    };

    return sections;
  }

  private async generateSectionContent(sectionType: string, captures: Capture[]): Promise<any> {
    if (captures.length === 0) {
      return { summary: 'No relevant signals for this section', insights: [] };
    }

    // Use GPT-4.1 to synthesize insights
    const prompt = this.buildSectionPrompt(sectionType, captures);
    
    try {
      const analysis = await aiAnalysisService.analyzeTruth(prompt, {
        mode: 'deep',
        contentType: 'text',
        truthAnalysisFramework: true,
      });

      return {
        summary: analysis?.insight?.strategicImplications?.[0] || 'Analysis in progress',
        insights: analysis?.insight?.strategicImplications || [],
        opportunities: analysis?.insight?.opportunityMapping || {},
        culturalContext: analysis?.culturalMoment || {},
      };
    } catch (error) {
      console.error(`Section generation error for ${sectionType}:`, error);
      return { summary: 'Section generation in progress', insights: [] };
    }
  }

  private buildSectionPrompt(sectionType: string, captures: Capture[]): string {
    const capturesSummary = captures
      .map(c => `- ${c.title || 'Untitled'}: ${c.summary || c.content?.substring(0, 100)}`)
      .join('\n');

    const sectionPrompts = {
      performance: `Analyze these performance signals and provide strategic insights:\n${capturesSummary}`,
      cultural: `Identify cultural moments and trends from these signals:\n${capturesSummary}`,
      platform: `Analyze platform-specific trends and behaviors:\n${capturesSummary}`,
      opportunities: `Identify strategic opportunities and recommendations:\n${capturesSummary}`,
      cohorts: `Define audience cohorts and their characteristics:\n${capturesSummary}`,
      ideation: `Generate creative ideas and campaign concepts:\n${capturesSummary}`,
    };

    return sectionPrompts[sectionType] || `Analyze these signals:\n${capturesSummary}`;
  }

  private async linkCapturesToBrief(briefId: string, sections: JimmyJohnsBrief): Promise<void> {
    const links: any[] = [];

    Object.entries(sections).forEach(([sectionId, section]) => {
      section.captures.forEach((capture, index) => {
        links.push({
          briefId,
          captureId: capture.id,
          section: sectionId,
          orderIndex: index,
        });
      });
    });

    if (links.length > 0) {
      await db.insert(briefCaptures).values(links);
    }
  }

  async exportToGoogleSlides(briefId: string): Promise<string | null> {
    try {
      const [brief] = await db
        .select()
        .from(briefs)
        .where(eq(briefs.id, briefId));

      if (!brief) {
        throw new Error('Brief not found');
      }

      // Create Google Slides presentation
      const slides = await googleIntegrationService.createSlidesDeck(
        brief.title,
        {
          performance: brief.performanceSection,
          culturalSignals: brief.culturalSignalsSection,
          platformSignals: brief.platformSignalsSection,
          opportunities: brief.opportunitiesSection,
          cohorts: brief.cohortsSection,
          ideation: brief.ideationSection,
        }
      );

      if (slides) {
        // Update brief with slides URL
        await db
          .update(briefs)
          .set({
            googleSlidesUrl: slides.url,
            exportedAt: new Date(),
          })
          .where(eq(briefs.id, briefId));

        return slides.url;
      }

      return null;
    } catch (error) {
      console.error('Export to slides error:', error);
      throw new Error('Failed to export to Google Slides');
    }
  }
}

export const briefGenerationService = BriefGenerationService.getInstance();