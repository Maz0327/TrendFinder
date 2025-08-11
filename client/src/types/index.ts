// Import generated types from Supabase
import type { Database } from './supabase';

// Export Supabase-generated types for consistency
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Capture = Database['public']['Tables']['captures']['Row'];
export type CaptureInsert = Database['public']['Tables']['captures']['Insert'];
export type CaptureUpdate = Database['public']['Tables']['captures']['Update'];

export type CulturalMoment = Database['public']['Tables']['cultural_moments']['Row'];
export type CulturalMomentInsert = Database['public']['Tables']['cultural_moments']['Insert'];
export type CulturalMomentUpdate = Database['public']['Tables']['cultural_moments']['Update'];

export type DsdBrief = Database['public']['Tables']['dsd_briefs']['Row'];
export type DsdBriefInsert = Database['public']['Tables']['dsd_briefs']['Insert'];
export type DsdBriefUpdate = Database['public']['Tables']['dsd_briefs']['Update'];

// Legacy compatibility types (mapped to Supabase schema)
export type ContentRadarItem = Capture;

export interface DashboardStats {
  totalTrends: number;
  viralPotential: number;
  activeSources: number;
  avgScore: number;
}

export interface ScanHistory {
  id: string;
  platform: string;
  status: string;
  itemsFound: number;
  errorMessage?: string;
  scanDuration?: number;
  createdAt?: Date;
}

export interface ContentFilters {
  category?: string;
  platform?: string;
  timeRange?: string;
  sortBy?: string;
  searchQuery?: string;
}

export interface ScanResult {
  success: boolean;
  itemsProcessed: number;
  errors: string[];
}
