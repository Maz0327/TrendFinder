// Capture types for frontend - Phase 2 migration
// Replaces old signal-based types

export type CaptureStatus = 'capture' | 'potential' | 'signal' | 'validated';

export interface CaptureFilters {
  status?: CaptureStatus;
  projectId?: string;
  platform?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface CaptureAnalysis {
  fact: string;
  observation: string;
  insight: string;
  truth: string;
  moment: string;
}

export interface CaptureFormData {
  sourceUrl: string;
  title?: string;
  content?: string;
  platform?: string;
  projectId?: string;
  tags?: string[];
  notes?: string;
}