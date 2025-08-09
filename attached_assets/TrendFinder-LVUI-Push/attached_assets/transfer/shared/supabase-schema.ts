// Supabase Schema - Clean database design for Content Intelligence Platform
// 2025 Rebuild - Foundation & Architecture
// Fixed: snake_case columns mapped to camelCase TypeScript properties
import { pgTable, varchar, text, timestamp, jsonb, boolean, integer, decimal, index, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 1. Users table - Supabase Auth integration ready
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
  settings: jsonb("settings").default('{}'),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  userIdx: index("idx_projects_user_id").on(table.userId),
  statusIdx: index("idx_projects_status").on(table.status),
}));

// 3. Captures table - Content captured via Chrome Extension + Platform Scraping
export const captures = pgTable("captures", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id),
  
  // Core capture data
  type: text("type").notNull(), // "url", "screenshot", "text", "voice_note", "scrape"
  title: text("title"),
  content: text("content"),
  url: text("url"),
  platform: text("platform"), // "instagram", "tiktok", "linkedin", "reddit", etc.
  
  // Enhanced content fields
  screenshotUrl: text("screenshot_url"),
  summary: text("summary"),
  tags: jsonb("tags").default('[]'),
  autoTags: jsonb("auto_tags").default('[]'),
  metadata: jsonb("metadata").default('{}'),
  
  // Truth Analysis Framework (GPT-4.1 + Gemini 2.5 Pro)
  truthAnalysis: jsonb("truth_analysis").$type<{
    fact?: { claims: string[]; sources: string[]; verificationStatus: string; confidence: number };
    observation?: { behaviorPatterns: string[]; audienceSignals: any; contextualFactors: string[] };
    insight?: { strategicImplications: string[]; opportunityMapping: any; riskAssessment: any };
    humanTruth?: { emotionalUndercurrent: any; culturalContext: any; psychologicalDrivers: any };
    culturalMoment?: { trendAlignment: any; viralPotential: number; competitiveAdvantage: any };
  }>(),
  analysisStatus: text("analysis_status").default("pending"), // "pending", "analyzing", "completed", "error"
  analysisMode: text("analysis_mode").default("quick"), // "quick" (GPT-4o-mini), "deep" (GPT-4.1)
  
  // Google AI Analysis (Gemini 2.5 Pro + Google Vision)
  visualAnalysis: jsonb("visual_analysis").$type<{
    brandElements?: any[];
    objectsDetected?: any[];
    textContent?: string[];
    dominantColors?: any[];
    faces?: any[];
    safetyAnalysis?: any;
    strategicInsights?: string[];
    culturalSignals?: any[];
  }>(),
  
  // Signal progression system
  status: text("status").default("capture"), // "capture" → "potential_signal" → "signal" → "validated_signal"
  signalScore: decimal("signal_score", { precision: 5, scale: 2 }).default('0.0'),
  viralPotential: decimal("viral_potential", { precision: 5, scale: 2 }).default('0.0'),
  promotionReason: text("promotion_reason"),
  
  // Workspace & Brief integration
  workspaceNotes: text("workspace_notes"),
  briefSectionAssignment: text("brief_section_assignment"), // "performance", "cultural-signals", "opportunities", etc.
  batchQueueStatus: boolean("batch_queue_status").default(false),
  workspacePriority: integer("workspace_priority").default(0),
  
  // Voice notes & Chrome extension
  isDraft: boolean("is_draft").default(false),
  capturedAt: timestamp("captured_at", { withTimezone: true }),
  browserContext: jsonb("browser_context"),
  voiceNoteUrl: text("voice_note_url"),
  transcription: text("transcription"),
  
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  projectIdx: index("idx_captures_project_id").on(table.projectId),
  userIdx: index("idx_captures_user_id").on(table.userId),
  statusIdx: index("idx_captures_status").on(table.status),
  analysisStatusIdx: index("idx_captures_analysis_status").on(table.analysisStatus),
  platformIdx: index("idx_captures_platform").on(table.platform),
  signalScoreIdx: index("idx_captures_signal_score").on(table.signalScore),
}));

// 4. Content Radar table - Trending content from platforms (Bright Data scraping)
export const contentRadar = pgTable("content_radar", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  title: text("title").notNull(),
  url: text("url").notNull(),
  content: text("content"),
  summary: text("summary"),
  hook1: text("hook1"),
  hook2: text("hook2"),
  category: text("category").notNull(),
  platform: text("platform").notNull(), // "instagram", "tiktok", "linkedin", "reddit", "twitter"
  
  // Viral & engagement metrics
  viralScore: decimal("viral_score", { precision: 5, scale: 2 }).default('0.0'),
  engagement: integer("engagement").default(0),
  growthRate: decimal("growth_rate", { precision: 10, scale: 2 }).default('0.0'),
  trendingStatus: text("trending_status").default("emerging"), // "emerging", "viral", "declining"
  
  // Enhanced metadata
  metadata: jsonb("metadata").default('{}'),
  demographicData: jsonb("demographic_data").default('{}'),
  competitiveContext: jsonb("competitive_context").default('{}'),
  
  // AI analysis
  strategicInsights: jsonb("strategic_insights").default('[]'),
  culturalSignificance: text("cultural_significance"),
  brandOpportunities: jsonb("brand_opportunities").default('[]'),
  
  isActive: boolean("is_active").default(true),
  scrapedAt: timestamp("scraped_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  categoryIdx: index("idx_content_radar_category").on(table.category),
  platformIdx: index("idx_content_radar_platform").on(table.platform),
  viralScoreIdx: index("idx_content_radar_viral_score").on(table.viralScore),
  trendingStatusIdx: index("idx_content_radar_trending_status").on(table.trendingStatus),
  createdAtIdx: index("idx_content_radar_created_at").on(table.createdAt),
}));

// 5. Briefs table - Generated strategic briefs (Jimmy John's template)
export const briefs = pgTable("briefs", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  templateType: text("template_type").default("jimmy-johns"),
  description: text("description"),
  
  // Brief sections (Jimmy John's template)
  performanceSection: jsonb("performance_section").default('{}'),
  culturalSignalsSection: jsonb("cultural_signals_section").default('{}'),
  platformSignalsSection: jsonb("platform_signals_section").default('{}'),
  opportunitiesSection: jsonb("opportunities_section").default('{}'),
  cohortsSection: jsonb("cohorts_section").default('{}'),
  ideationSection: jsonb("ideation_section").default('{}'),
  
  // Google integration
  googleSlidesUrl: text("google_slides_url"),
  googleDocsUrl: text("google_docs_url"),
  exportedAt: timestamp("exported_at", { withTimezone: true }),
  
  status: text("status").default("draft"), // "draft", "generating", "completed", "exported"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  projectIdx: index("idx_briefs_project_id").on(table.projectId),
  userIdx: index("idx_briefs_user_id").on(table.userId),
  statusIdx: index("idx_briefs_status").on(table.status),
}));

// 6. Brief Captures junction table - Links captures to brief sections
export const briefCaptures = pgTable("brief_captures", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  briefId: uuid("brief_id").notNull().references(() => briefs.id, { onDelete: "cascade" }),
  captureId: uuid("capture_id").notNull().references(() => captures.id, { onDelete: "cascade" }),
  section: text("section").notNull(), // "performance", "cultural-signals", "opportunities", etc.
  orderIndex: integer("order_index").default(0),
  notes: text("notes"),
  contribution: text("contribution"), // How this capture contributes to the section
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  briefIdx: index("idx_brief_captures_brief_id").on(table.briefId),
  captureIdx: index("idx_brief_captures_capture_id").on(table.captureId),
  sectionIdx: index("idx_brief_captures_section").on(table.section),
}));

// 7. Analysis Results table - Stores Truth Analysis results for caching
export const analysisResults = pgTable("analysis_results", {
  id: uuid("id").primaryKey().default(sql`uuid_generate_v4()`),
  captureId: uuid("capture_id").notNull().references(() => captures.id, { onDelete: "cascade" }),
  fact: text("fact"),
  observation: text("observation"),
  insight: text("insight"),
  humanTruth: text("human_truth"),
  culturalMoment: text("cultural_moment"),
  tier: text("tier").notNull(), // "quick", "standard", "deep"
  model: text("model"), // "gpt-4o-mini", "gpt-4.1-2025-04-14"
  processingTime: integer("processing_time"), // milliseconds
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  captureIdx: index("idx_analysis_results_capture_id").on(table.captureId),
  tierIdx: index("idx_analysis_results_tier").on(table.tier),
}));

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
  scrapedAt: true,
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

export type AnalysisResult = typeof analysisResults.$inferSelect;
export type InsertAnalysisResult = typeof analysisResults.$inferInsert;

// Relations (for Drizzle ORM)
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  captures: many(captures),
  briefs: many(briefs),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  captures: many(captures),
  briefs: many(briefs),
}));

export const capturesRelations = relations(captures, ({ one, many }) => ({
  user: one(users, {
    fields: [captures.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [captures.projectId],
    references: [projects.id],
  }),
  briefCaptures: many(briefCaptures),
}));

export const briefsRelations = relations(briefs, ({ one, many }) => ({
  user: one(users, {
    fields: [briefs.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [briefs.projectId],
    references: [projects.id],
  }),
  briefCaptures: many(briefCaptures),
}));

export const briefCapturesRelations = relations(briefCaptures, ({ one }) => ({
  brief: one(briefs, {
    fields: [briefCaptures.briefId],
    references: [briefs.id],
  }),
  capture: one(captures, {
    fields: [briefCaptures.captureId],
    references: [captures.id],
  }),
}));