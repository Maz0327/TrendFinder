import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Strategic Intelligence Platform - Project-Based Architecture
// Phase 1: Core schema for Projects → Captures → Analysis → Briefs workflow

// 1. Users table - User accounts and authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").default("strategist"), // 'user', 'admin', 'strategist'
  
  // Onboarding and progress tracking
  onboardingCompleted: boolean("onboarding_completed").default(false),
  tourCompleted: boolean("tour_completed").default(false),
  progressData: jsonb("progress_data").$type<{
    projectsCreated: number;
    capturesMade: number;
    briefsGenerated: number;
    daysActive: number;
    unlockedFeatures: string[];
    lastActive: string;
  }>(),
  
  // Google integration tokens
  googleTokens: jsonb("google_tokens").$type<{
    access_token: string;
    refresh_token: string;
    expiry_date: number;
    token_type: string;
    scope: string;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  usernameIdx: index("idx_users_username").on(table.username),
}));

// 2. Projects table - Strategic campaigns and initiatives
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(), // "Nike Spring Campaign", "Mother's Day 2025"
  description: text("description"),
  briefTemplate: text("brief_template").default("jimmy-johns"), // 'jimmy-johns', 'custom'
  status: text("status").default("active"), // 'active', 'archived', 'completed'
  
  // Project metadata
  client: text("client"),
  deadline: timestamp("deadline"),
  tags: jsonb("tags").$type<string[]>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("idx_projects_user_id").on(table.userId),
  statusIdx: index("idx_projects_status").on(table.status),
}));

// 3. Captures table - Content captured via Chrome Extension or manual input
export const captures = pgTable("captures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // Capture metadata
  type: text("type").notNull(), // 'screenshot', 'text', 'url', 'video-frame', 'thread'
  sourceUrl: text("source_url"),
  platform: text("platform"), // 'reddit', 'twitter', 'tiktok', 'instagram', etc.
  
  // Content
  title: text("title"),
  content: text("content"), // Raw text content or OCR result
  screenshotUrl: text("screenshot_url"), // S3 or local path
  metadata: jsonb("metadata"), // Platform-specific data (likes, comments, etc.)
  
  // User notes and custom content
  userNote: text("user_note"),
  customCopy: text("custom_copy"), // User's custom copy variations
  tags: jsonb("tags").$type<string[]>().default('[]'),
  
  // Enhanced Google analysis
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
  imageData: text("image_data"), // Base64 image for Google Vision analysis
  
  // Truth Analysis Framework (populated after AI processing)
  truthAnalysis: jsonb("truth_analysis").$type<{
    fact: { claims: string[]; metrics: any; timestamp: string };
    observation: { patterns: string[]; behaviors: string[]; context: string };
    insight: { implications: string[]; opportunities: string[]; risks: string[] };
    humanTruth: { core: string; emotional: string; cultural: string; psychological: string };
  }>(),
  
  // Strategic Intelligence
  suggestedBriefSection: text("suggested_brief_section"), // 'performance', 'cultural-signals', etc.
  culturalRelevance: decimal("cultural_relevance", { precision: 3, scale: 1 }),
  strategicValue: decimal("strategic_value", { precision: 3, scale: 1 }),
  
  // Processing status
  status: text("status").default("pending"), // 'pending', 'processing', 'analyzed', 'error'
  processedAt: timestamp("processed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  projectIdx: index("idx_captures_project_id").on(table.projectId),
  statusIdx: index("idx_captures_status").on(table.status),
  platformIdx: index("idx_captures_platform").on(table.platform),
}));

// 4. Signals table - Legacy signal mining system (actual database structure)
export const signals = pgTable("signals", {
  id: integer("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  url: text("url"),
  summary: text("summary"),
  sentiment: text("sentiment"),
  tone: text("tone"),
  keywords: text("keywords").array(),
  tags: text("tags").array(),
  confidence: text("confidence"),
  status: text("status"),
  
  // Truth Analysis Framework columns (existing)
  truthFact: text("truth_fact"),
  truthObservation: text("truth_observation"),
  truthInsight: text("truth_insight"),
  humanTruth: text("human_truth"),
  
  // Strategic Intelligence columns  
  culturalMoment: text("cultural_moment"),
  attentionValue: text("attention_value"),
  platformContext: text("platform_context"),
  viralPotential: text("viral_potential"),
  cohortSuggestions: text("cohort_suggestions").array(),
  competitiveInsights: text("competitive_insights").array(),
  nextActions: text("next_actions").array(),
  
  // User and project management
  userNotes: text("user_notes"),
  promotionReason: text("promotion_reason"),
  systemSuggestionReason: text("system_suggestion_reason"),
  
  // Timestamps
  flaggedAt: timestamp("flagged_at"),
  promotedAt: timestamp("promoted_at"),
  createdAt: timestamp("created_at"),
  capturedAt: timestamp("captured_at"),
  
  // Additional fields
  isDraft: boolean("is_draft"),
  browserContext: jsonb("browser_context"),
  visualAssets: jsonb("visual_assets"),
  transcription: text("transcription"),
  projectId: integer("project_id"),
  templateSection: text("template_section"),
  captureSessionId: text("capture_session_id"),
  engagementData: jsonb("engagement_data"),
  qualScore: text("qual_score"),
  autoTags: text("auto_tags").array(),
  workspaceNotes: text("workspace_notes"),
  analysisStatus: text("analysis_status"),
  briefSectionAssignment: text("brief_section_assignment"),
  batchQueueStatus: boolean("batch_queue_status"),
  workspacePriority: integer("workspace_priority"),
}, (table) => ({
  userIdx: index("idx_signals_user_id").on(table.userId),
  projectIdx: index("idx_signals_project_id").on(table.projectId),
  statusIdx: index("idx_signals_status").on(table.status),
  createdAtIdx: index("idx_signals_created_at").on(table.createdAt),
}));

// 5. Briefs table - Strategic brief documents
export const briefs = pgTable("briefs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // Brief metadata
  title: text("title").notNull(),
  template: text("template").default("jimmy-johns"), // Template used
  status: text("status").default("draft"), // 'draft', 'review', 'final', 'delivered'
  
  // Brief sections (Jimmy John's format)
  sections: jsonb("sections").$type<{
    performance?: { title: string; content: string; captures: string[] };
    culturalSignals?: { title: string; content: string; captures: string[] };
    platformSignals?: { title: string; content: string; captures: string[] };
    opportunities?: { title: string; content: string; captures: string[] };
    cohorts?: { title: string; content: string; captures: string[] };
    ideation?: { title: string; content: string; captures: string[] };
  }>(),
  
  // Export metadata
  lastExportedAt: timestamp("last_exported_at"),
  exportFormats: jsonb("export_formats").$type<string[]>(), // ['pdf', 'slides', 'docx']
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  projectIdx: index("idx_briefs_project_id").on(table.projectId),
  statusIdx: index("idx_briefs_status").on(table.status),
}));

// 6. Brief Captures table - Relationship between briefs and captures
export const briefCaptures = pgTable("brief_captures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  briefId: varchar("brief_id").notNull().references(() => briefs.id, { onDelete: "cascade" }),
  captureId: varchar("capture_id").notNull().references(() => captures.id, { onDelete: "cascade" }),
  
  section: text("section").notNull(), // 'performance', 'cultural-signals', etc.
  position: integer("position").notNull().default(0), // Order within section
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  briefIdx: index("idx_brief_captures_brief_id").on(table.briefId),
  captureIdx: index("idx_brief_captures_capture_id").on(table.captureId),
  sectionIdx: index("idx_brief_captures_section").on(table.section),
}));

// 7. Sources table - Platform definitions and configurations (keeping for compatibility)
export const sources = pgTable("sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(), // 'linkedin', 'instagram', 'tiktok', etc.
  displayName: text("display_name").notNull(), // 'LinkedIn', 'Instagram', 'TikTok'
  tier: integer("tier").notNull().default(1), // 1 = Tier 1, 2 = Tier 2
  category: text("category").notNull(), // 'social_media', 'business_intel', 'ecommerce'
  
  // Configuration
  apiEndpoint: text("api_endpoint"),
  rateLimit: integer("rate_limit").default(100), // requests per hour
  isActive: boolean("is_active").default(true),
  
  // Bright Data Configuration
  brightDataConfig: jsonb("bright_data_config").$type<{
    datasetId?: string;
    collectorId?: string;
    browserRequired?: boolean;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  nameIdx: index("idx_sources_name").on(table.name),
  tierIdx: index("idx_sources_tier").on(table.tier),
}));

// 4. Signal Sources table - Relationship between signals and their sources
export const signalSources = pgTable("signal_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  signalId: varchar("signal_id").notNull().references(() => signals.id, { onDelete: "cascade" }),
  sourceId: varchar("source_id").notNull().references(() => sources.id, { onDelete: "cascade" }),
  
  // Source-specific metadata
  platformUrl: text("platform_url"),
  platformMetrics: jsonb("platform_metrics"), // likes, shares, comments, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  signalIdx: index("idx_signal_sources_signal_id").on(table.signalId),
  sourceIdx: index("idx_signal_sources_source_id").on(table.sourceId),
}));

// 5. User Preferences table - User settings and saved configurations
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Notification Preferences
  notificationSettings: jsonb("notification_settings").$type<{
    realTimeAlerts: boolean;
    dailyDigest: boolean;
    weeklyReport: boolean;
    alertThreshold: number;
  }>(),
  
  // Content Preferences
  preferredSources: jsonb("preferred_sources").$type<string[]>(), // ['linkedin', 'tiktok']
  preferredCategories: jsonb("preferred_categories").$type<string[]>(),
  keywords: jsonb("keywords").$type<string[]>(), // Keywords to track
  competitors: jsonb("competitors").$type<string[]>(), // Competitor brands to monitor
  
  // Brief Preferences
  briefMode: text("brief_mode").default("ai-assisted"), // 'ai-generated', 'ai-assisted', 'user-controlled'
  briefTemplate: text("brief_template"), // Custom template preferences
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("idx_user_preferences_user_id").on(table.userId),
}));

// Insert schemas with proper validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
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
  processedAt: true,
});

export const insertBriefSchema = createInsertSchema(briefs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastExportedAt: true,
});

export const insertBriefCaptureSchema = createInsertSchema(briefCaptures).omit({
  id: true,
  createdAt: true,
});

export const insertSignalSchema = createInsertSchema(signals).omit({
  id: true,
  createdAt: true,
  flaggedAt: true,
  promotedAt: true,
  capturedAt: true,
});

export const insertSourceSchema = createInsertSchema(sources).omit({
  id: true,
  createdAt: true,
});

export const insertSignalSourceSchema = createInsertSchema(signalSources).omit({
  id: true,
  createdAt: true,
});

export const insertUserPreferenceSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports for type safety across the application
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertCapture = z.infer<typeof insertCaptureSchema>;
export type Capture = typeof captures.$inferSelect;

export type InsertBrief = z.infer<typeof insertBriefSchema>;
export type Brief = typeof briefs.$inferSelect;

export type InsertBriefCapture = z.infer<typeof insertBriefCaptureSchema>;
export type BriefCapture = typeof briefCaptures.$inferSelect;

export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type Signal = typeof signals.$inferSelect;

export type InsertSource = z.infer<typeof insertSourceSchema>;
export type Source = typeof sources.$inferSelect;

export type InsertSignalSource = z.infer<typeof insertSignalSourceSchema>;
export type SignalSource = typeof signalSources.$inferSelect;

export type InsertUserPreference = z.infer<typeof insertUserPreferenceSchema>;
export type UserPreference = typeof userPreferences.$inferSelect;

// ContentRadar table - Actual content_radar table structure (NOT signals alias)
export const contentRadar = pgTable("content_radar", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  content: text("content"),
  summary: text("summary"),
  hook1: text("hook1"),
  hook2: text("hook2"),
  category: text("category").notNull(),
  platform: text("platform").notNull(),
  viralScore: decimal("viral_score", { precision: 10, scale: 2 }),
  engagement: integer("engagement"),
  growthRate: decimal("growth_rate", { precision: 10, scale: 2 }),
  metadata: jsonb("metadata"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  categoryIdx: index("idx_content_radar_category").on(table.category),
  platformIdx: index("idx_content_radar_platform").on(table.platform),
  createdAtIdx: index("idx_content_radar_created_at").on(table.createdAt),
}));

export const insertContentRadarSchema = createInsertSchema(contentRadar).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ContentRadar = typeof contentRadar.$inferSelect;
export type InsertContentRadar = z.infer<typeof insertContentRadarSchema>;

// Temporary exports for scan history (will be replaced with proper logging)
export const scanHistory = {
  $inferSelect: {} as { 
    id: string;
    platform: string;
    status: string;
    itemsFound: number;
    errorMessage?: string | null;
    scanDuration?: number | null;
    createdAt: Date;
  }
};

export const insertScanHistorySchema = z.object({
  platform: z.string(),
  status: z.string(),
  itemsFound: z.number().default(0),
  errorMessage: z.string().optional(),
  scanDuration: z.number().optional(),
});

export type InsertScanHistory = z.infer<typeof insertScanHistorySchema>;
export type ScanHistory = typeof scanHistory.$inferSelect;
