// Temporary bridge file - redirects to new supabase schema
// This will be replaced with the new schema once migration is complete
export * from './supabase-schema';

// Backward compatibility aliases for smooth transition
import {
  users as newUsers,
  projects as newProjects,
  captures as newCaptures,
  briefs as newBriefs,
  contentRadar,
  briefCaptures,
  analysisResults,
  // Types
  type User,
  type Project,
  type Capture,
  type Brief,
  type ContentRadar,
  type BriefCapture,
  type AnalysisResult,
  type InsertUser,
  type InsertProject,
  type InsertCapture,
  type InsertBrief,
  type InsertContentRadar,
  type InsertBriefCapture,
  type InsertAnalysisResult,
} from './supabase-schema';

// Legacy table aliases (for existing code compatibility)
export const signals = newCaptures; // captures table now handles signals
export const users = newUsers;
export const projects = newProjects;
export const briefs = newBriefs;
export const captures = newCaptures;

// Additional legacy exports that might be needed
export { contentRadar, briefCaptures, analysisResults };

// Type aliases for backward compatibility
export type Signal = Capture; // signals are now captures
export type InsertSignal = InsertCapture;

// Export all the new types under their new names
export type {
  User,
  Project,
  Capture,
  Brief,
  ContentRadar,
  BriefCapture,
  AnalysisResult,
  InsertUser,
  InsertProject,
  InsertCapture,
  InsertBrief,
  InsertContentRadar,
  InsertBriefCapture,
  InsertAnalysisResult,
};

// Frontend compatibility exports
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Legacy table compatibility exports
export const briefTemplates = newBriefs; // alias for compatibility
export const briefSections = briefCaptures; // alias for compatibility
export const generatedBriefs = newBriefs; // alias for compatibility

// Additional frontend compatibility schemas
export const analyzeContentSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  platform: z.string().optional(),
  mode: z.enum(['quick', 'deep']).default('quick'),
  projectId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});