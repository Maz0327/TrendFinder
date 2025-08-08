// Supabase Schema - Clean database design for Content Radar Platform
// Strategic Intelligence and Truth Analysis Framework
// Fixed: snake_case columns mapped to camelCase TypeScript properties
import { pgTable, varchar, text, timestamp, jsonb, boolean, integer, decimal, index, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 1. Users table - Supabase Auth integration
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  password: text("password").notNull(),
  role: text("role").default("user"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  tourCompleted: boolean("tour_completed").default(false),
  progressData: jsonb("progress_data").default('{}'),
  googleTokens: jsonb("google_tokens"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  emailIdx: index("idx_users_email").on(table.email),
}));

// 2. Projects table - Strategic campaigns and initiatives
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  briefTemplate: text("brief_template").default("jimmy-johns"),
  status: text("status").default("active"),
  client: text("client"),
  deadline: timestamp("deadline", { withTimezone: true }),
  tags: jsonb("tags").default('[]'),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  userIdx: index("idx_projects_user_id").on(table.userId),
  statusIdx: index("idx_projects_status").on(table.status),
}));

// 3. Captures table - Content captured via Chrome Extension
export const captures = pgTable("captures", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id),
  
  // Capture metadata
  type: text("type").notNull(),
  title: text("title"),
  content: text("content"),
  url: text("url"),
  platform: text("platform"),
  
  // Enhanced content fields
  screenshotUrl: text("screenshot_url"),
  summary: text("summary"),
  tags: jsonb("tags").default('[]'),
  metadata: jsonb("metadata").default('{}'),
  
  // Truth Analysis Framework
  truthAnalysis: jsonb("truth_analysis").$type<{
    fact: { claims: string[]; sources: string[]; verificationStatus: string; confidence: number };
    observation: { behaviorPatterns: string[]; audienceSignals: any; contextualFactors: string[] };
    insight: { strategicImplications: string[]; opportunityMapping: any; riskAssessment: any };
    humanTruth: { emotionalUndercurrent: any; culturalContext: any; psychologicalDrivers: any };
  }>(),
  analysisStatus: text("analysis_status").default("pending"),
  
  // Google AI Analysis
  googleAnalysis: jsonb("google_analysis").$type<{
    vision?: {
      brandElements: any[];
      objectsDetected: any[];
      textContent: string[];
      dominantColors: any[];
      faces: any[];
      safetyAnalysis: any;
      strategicInsights: string[];
    };
    nlp?: {
      sentiment: {
        score: number;
        magnitude: number;
        label: string;
        confidence: number;
      };
      entities: any[];
      keyPhrases: any[];
      strategicInsights: string[];
    };
  }>(),
  
  // Additional capture fields from database
  autoTags: jsonb("auto_tags").default('[]'),
  signalScore: text("signal_score").default('0.0'),
  viralPotential: text("viral_potential").default('0.0'),
  promotionReason: text("promotion_reason"),
  workspaceNotes: text("workspace_notes"),
  briefSectionAssignment: text("brief_section_assignment"),
  batchQueueStatus: boolean("batch_queue_status").default(false),
  workspacePriority: integer("workspace_priority").default(0),
  voiceNoteUrl: text("voice_note_url"),
  voiceNoteDuration: integer("voice_note_duration"),
  transcription: text("transcription"),
  analysisMode: text("analysis_mode").default('quick'),
  visualAnalysis: text("visual_analysis"),
  isDraft: boolean("is_draft").default(false),
  
  // Status and timestamps
  status: text("status").default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  projectIdx: index("idx_captures_project_id").on(table.projectId),
  userIdx: index("idx_captures_user_id").on(table.userId),
  statusIdx: index("idx_captures_status").on(table.status),
  analysisStatusIdx: index("idx_captures_analysis_status").on(table.analysisStatus),
}));

// 4. Content Radar table - Trending content from platforms
export const contentRadar = pgTable("content_radar", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  title: text("title").notNull(),
  url: text("url").notNull(),
  content: text("content"),
  summary: text("summary"),
  hook1: text("hook1"),
  hook2: text("hook2"),
  category: text("category").notNull(),
  platform: text("platform").notNull(),
  viralScore: text("viral_score").default('0.0'),
  engagement: integer("engagement").default(0),
  growthRate: text("growth_rate").default('0.0'),
  metadata: jsonb("metadata").default('{}'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  categoryIdx: index("idx_content_radar_category").on(table.category),
  platformIdx: index("idx_content_radar_platform").on(table.platform),
  viralScoreIdx: index("idx_content_radar_viral_score").on(table.viralScore),
  createdAtIdx: index("idx_content_radar_created_at").on(table.createdAt),
}));

// 5. Briefs table - Generated strategic briefs
export const briefs = pgTable("briefs", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  templateType: text("template_type").default("jimmy-johns"),
  description: text("description"),
  status: text("status").default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  projectIdx: index("idx_briefs_project_id").on(table.projectId),
}));

// 6. Brief Captures junction table
export const briefCaptures = pgTable("brief_captures", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  briefId: uuid("brief_id").notNull().references(() => briefs.id, { onDelete: "cascade" }),
  captureId: uuid("capture_id").notNull().references(() => captures.id, { onDelete: "cascade" }),
  section: text("section"),
  orderIndex: integer("order_index").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCaptureSchema = createInsertSchema(captures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentRadarSchema = createInsertSchema(contentRadar).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBriefSchema = createInsertSchema(briefs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBriefCaptureSchema = createInsertSchema(briefCaptures).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Capture = typeof captures.$inferSelect;
export type InsertCapture = z.infer<typeof insertCaptureSchema>;

export type ContentRadar = typeof contentRadar.$inferSelect;
export type InsertContentRadar = z.infer<typeof insertContentRadarSchema>;

export type Brief = typeof briefs.$inferSelect;
export type InsertBrief = z.infer<typeof insertBriefSchema>;

export type BriefCapture = typeof briefCaptures.$inferSelect;
export type InsertBriefCapture = z.infer<typeof insertBriefCaptureSchema>;