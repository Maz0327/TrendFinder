import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const contentRadar = pgTable("content_radar", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  url: text("url").notNull(),
  content: text("content"),
  summary: text("summary"),
  hook1: text("hook1"),
  hook2: text("hook2"),
  category: text("category").notNull(),
  platform: text("platform").notNull(), // reddit, youtube, news, twitter
  viralScore: decimal("viral_score", { precision: 3, scale: 1 }).default('0.0'),
  engagement: integer("engagement").default(0),
  growthRate: decimal("growth_rate", { precision: 5, scale: 2 }).default('0.00'),
  metadata: jsonb("metadata"), // platform-specific data
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scanHistory = pgTable("scan_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull(),
  status: text("status").notNull(), // success, error, partial
  itemsFound: integer("items_found").default(0),
  errorMessage: text("error_message"),
  scanDuration: integer("scan_duration"), // in milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContentRadarSchema = createInsertSchema(contentRadar).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScanHistorySchema = createInsertSchema(scanHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContentRadar = z.infer<typeof insertContentRadarSchema>;
export type ContentRadar = typeof contentRadar.$inferSelect;
export type InsertScanHistory = z.infer<typeof insertScanHistorySchema>;
export type ScanHistory = typeof scanHistory.$inferSelect;
