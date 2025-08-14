import type { Database } from '@shared/database.types';
import type * as DTO from '../types/dto';

// Database row types
type DBProject = Database['public']['Tables']['projects']['Row'];
type DBCapture = Database['public']['Tables']['captures']['Row'];
type DBMoment = Database['public']['Tables']['cultural_moments']['Row'];
type DBBrief = Database['public']['Tables']['dsd_briefs']['Row'];
type DBFeed = Database['public']['Tables']['user_feeds']['Row'];

export function mapProject(row: DBProject): DTO.Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapCapture(row: DBCapture): DTO.Capture {
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    platform: row.platform,
    url: row.url,
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: (row.analysis_status as any) || 'new',
    imageUrl: row.image_url,
    videoUrl: null, // Not in current schema
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapMoment(row: DBMoment): DTO.Moment {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    intensity: row.intensity,
    tags: Array.isArray(row.tags) ? row.tags : [],
    platforms: Array.isArray(row.platforms) ? row.platforms : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapBrief(row: DBBrief & { slides?: any }): DTO.Brief {
  const slides = Array.isArray(row.slides) ? row.slides : [];
  
  return {
    id: row.id,
    projectId: row.client_profile_id, // Map to project
    title: row.title,
    status: (row.status as any) || 'draft',
    tags: Array.isArray(row.tags) ? row.tags : [],
    slideCount: slides.length,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapBriefDetail(row: DBBrief & { slides?: any }): DTO.BriefDetail {
  const brief = mapBrief(row);
  let slides: DTO.Slide[] = [];
  
  try {
    if (Array.isArray(row.slides)) {
      slides = row.slides.map((slide: any, index: number) => ({
        id: slide.id || `slide-${index}`,
        title: slide.title || null,
        blocks: Array.isArray(slide.blocks) ? slide.blocks : [],
        captureRefs: Array.isArray(slide.captureRefs) ? slide.captureRefs : []
      }));
    }
  } catch (error) {
    console.warn('Failed to parse slides JSON:', error);
    slides = [];
  }
  
  return {
    ...brief,
    slides
  };
}

export function mapFeed(row: DBFeed): DTO.Feed {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    feedUrl: row.feed_url,
    title: row.title,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Helper function to ensure valid slides JSON
export function validateSlidesJson(slides: any): DTO.Slide[] {
  if (!Array.isArray(slides)) {
    return [];
  }
  
  return slides.map((slide: any, index: number) => ({
    id: slide.id || `slide-${index}`,
    title: slide.title || null,
    blocks: Array.isArray(slide.blocks) ? slide.blocks : [],
    captureRefs: Array.isArray(slide.captureRefs) ? slide.captureRefs : []
  }));
}