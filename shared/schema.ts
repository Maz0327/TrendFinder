import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Clean 5-table architecture for strategic intelligence platform

// 1. Users table - User accounts and authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").default("user"), // 'user', 'admin', 'strategist'
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  usernameIdx: index("idx_users_username").on(table.username),
}));

// 2. Signals table - All intelligence data from platforms
export const signals = pgTable("signals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  url: text("url").notNull(),
  content: text("content"),
  
  // AI Analysis Results
  summary: text("summary"),
  hooks: jsonb("hooks").$type<string[]>(), // Multiple hooks instead of just 2
  viralScore: decimal("viral_score", { precision: 3, scale: 1 }).default('0.0'),
  
  // Truth Analysis Framework
  truthAnalysis: jsonb("truth_analysis").$type<{
    fact: { claims: string[]; sources: string[]; verificationStatus: string; confidence: number };
    observation: { behaviorPatterns: string[]; audienceSignals: any; contextualFactors: string[] };
    insight: { strategicImplications: string[]; opportunityMapping: any; riskAssessment: any };
    humanTruth: { emotionalUndercurrent: any; culturalContext: any; psychologicalDrivers: any };
  }>(),
  
  // Categorization & Metrics
  category: text("category").notNull(),
  signalType: text("signal_type"), // 'trend', 'cultural_moment', 'competitive_intel', etc.
  engagement: integer("engagement").default(0),
  growthRate: decimal("growth_rate", { precision: 5, scale: 2 }).default('0.00'),
  
  // Visual Intelligence
  hasVisuals: boolean("has_visuals").default(false),
  visualAnalysis: jsonb("visual_analysis"), // Gemini visual analysis results
  screenshots: jsonb("screenshots").$type<Array<{url: string; context: string; platform: string}>>(),
  
  // Metadata & Timestamps
  metadata: jsonb("metadata"), // platform-specific data
  aiModel: text("ai_model"), // 'gemini-2.5-pro' or 'gpt-4o'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  categoryIdx: index("idx_signals_category").on(table.category),
  createdAtIdx: index("idx_signals_created_at").on(table.createdAt),
  viralScoreIdx: index("idx_signals_viral_score").on(table.viralScore),
}));

// 3. Sources table - Platform definitions and configurations
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

export const insertSignalSchema = createInsertSchema(signals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type Signal = typeof signals.$inferSelect;

export type InsertSource = z.infer<typeof insertSourceSchema>;
export type Source = typeof sources.$inferSelect;

export type InsertSignalSource = z.infer<typeof insertSignalSourceSchema>;
export type SignalSource = typeof signalSources.$inferSelect;

export type InsertUserPreference = z.infer<typeof insertUserPreferenceSchema>;
export type UserPreference = typeof userPreferences.$inferSelect;

// Legacy type aliases for backward compatibility (will refactor gradually)
export type ContentRadar = Signal;
export type InsertContentRadar = InsertSignal;
export const contentRadar = signals; // Alias for gradual migration
export const insertContentRadarSchema = insertSignalSchema;

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
