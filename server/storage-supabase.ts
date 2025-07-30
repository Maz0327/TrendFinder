// Supabase Storage Implementation - Clean implementation for Content Radar Platform
import { 
  type User, type InsertUser,
  type Project, type InsertProject,
  type Capture, type InsertCapture,
  type Brief, type InsertBrief,
  type BriefCapture, type InsertBriefCapture,
  type ContentRadar, type InsertContentRadar
} from "@shared/supabase-schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { users, projects, captures, briefs, briefCaptures, contentRadar } from "@shared/supabase-schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { Pool } from "pg";
import type { IStorage } from "./storage";

export interface ISupabaseStorage extends IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Legacy source methods for compatibility
  getSourceByName(name: string): Promise<any>;
  createSource(source: any): Promise<any>;
  
  // Project methods
  getProjects(userId: string): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // Capture methods - Core Truth Analysis functionality
  getCaptures(projectId: string): Promise<Capture[]>;
  getCaptureById(id: string): Promise<Capture | undefined>;
  createCapture(capture: InsertCapture): Promise<Capture>;
  updateCapture(id: string, updates: Partial<Capture>): Promise<Capture | undefined>;
  deleteCapture(id: string): Promise<boolean>;
  getPendingCaptures(): Promise<Capture[]>;
  getUserCaptures(userId: string): Promise<Capture[]>;
  
  // Brief methods
  getBriefs(projectId: string): Promise<Brief[]>;
  getBriefById(id: string): Promise<Brief | undefined>;
  createBrief(brief: InsertBrief): Promise<Brief>;
  updateBrief(id: string, updates: Partial<Brief>): Promise<Brief | undefined>;
  deleteBrief(id: string): Promise<boolean>;
  
  // Brief Capture relationship methods
  addCaptureToBrief(briefCapture: InsertBriefCapture): Promise<BriefCapture>;
  removeCaptureFromBrief(briefId: string, captureId: string): Promise<boolean>;
  getBriefCaptures(briefId: string): Promise<BriefCapture[]>;

  // Content Radar methods - Trending content analysis
  getContentItems(filters?: {
    category?: string;
    platform?: string;
    timeRange?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<ContentRadar[]>;
  getContentItemById(id: string): Promise<ContentRadar | undefined>;
  createContentItem(item: InsertContentRadar): Promise<ContentRadar>;
  updateContentItem(id: string, updates: Partial<ContentRadar>): Promise<ContentRadar | undefined>;
  deleteContentItem(id: string): Promise<boolean>;
  getStats(): Promise<{
    totalTrends: number;
    viralPotential: number;
    activeSources: number;
    avgScore: number;
  }>;
}

export class SupabaseStorage implements ISupabaseStorage {
  private db: ReturnType<typeof drizzle>;
  private pool: Pool;

  constructor(databaseUrl: string) {
    console.log("🔗 Connecting to Supabase database:", databaseUrl.split('@')[1]?.split('/')[0] || 'Unknown');
    
    // Use standard PostgreSQL pool for Supabase
    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false // Required for Supabase SSL connections
      }
    });
    
    this.db = drizzle(this.pool);
    console.log("✅ Supabase database connection established");
  }

  // Legacy source methods for compatibility
  async getSourceByName(name: string): Promise<any> {
    // Return null for legacy compatibility - sources not used in Supabase schema
    return null;
  }

  async createSource(source: any): Promise<any> {
    // No-op for legacy compatibility
    return { id: 'legacy-source', name: source.name };
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  // Add all missing IStorage methods for compatibility
  async getSignals(): Promise<any[]> { return []; }
  async getSignalById(id: string): Promise<any> { return null; }
  async createSignal(signal: any): Promise<any> { return { id: 'legacy', ...signal }; }
  async updateSignal(id: string, updates: any): Promise<any> { return null; }
  async deleteSignal(id: string): Promise<boolean> { return true; }
  
  async getContentItems(filters?: any): Promise<ContentRadar[]> {
    try {
      let query = this.db.select().from(contentRadar);
      
      if (filters?.category) {
        query = query.where(eq(contentRadar.category, filters.category));
      }
      if (filters?.platform) {
        query = query.where(eq(contentRadar.platform, filters.platform));
      }
      
      const result = await query.orderBy(desc(contentRadar.createdAt))
        .limit(filters?.limit || 50)
        .offset(filters?.offset || 0);
      
      return result;
    } catch (error) {
      console.error("Error fetching content items:", error);
      return [];
    }
  }
  
  async getContentItemById(id: string): Promise<ContentRadar | undefined> {
    const result = await this.db.select().from(contentRadar).where(eq(contentRadar.id, id)).limit(1);
    return result[0];
  }
  
  async createContentItem(item: InsertContentRadar): Promise<ContentRadar> {
    const result = await this.db.insert(contentRadar).values({
      ...item,
      id: randomUUID(),
    }).returning();
    return result[0];
  }
  
  async updateContentItem(id: string, updates: Partial<ContentRadar>): Promise<ContentRadar | undefined> {
    const result = await this.db.update(contentRadar).set(updates).where(eq(contentRadar.id, id)).returning();
    return result[0];
  }
  
  async deleteContentItem(id: string): Promise<boolean> {
    const result = await this.db.delete(contentRadar).where(eq(contentRadar.id, id));
    return (result as any).rowCount > 0;
  }
  
  async getStats(): Promise<{ totalTrends: number; viralPotential: number; activeSources: number; avgScore: number }> {
    const result = await this.db.select({
      totalTrends: sql<number>`count(*)`,
      avgScore: sql<number>`avg(viral_score)`,
    }).from(contentRadar);
    return {
      totalTrends: result[0]?.totalTrends || 0,
      viralPotential: Math.round((result[0]?.avgScore || 0) * 10),
      activeSources: 5,
      avgScore: result[0]?.avgScore || 0,
    };
  }
  
  async getScanHistory(): Promise<any[]> { return []; }
  async createScanHistory(scan: any): Promise<any> { return { id: 'scan', ...scan }; }
  async getRecentScans(limit?: number): Promise<any[]> { return []; }

  // Project methods
  async getProjects(userId: string): Promise<Project[]> {
    return await this.db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    const result = await this.db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0];
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await this.db.insert(projects).values({
      ...project,
      id: randomUUID(),
    }).returning();
    return result[0];
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const result = await this.db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await this.db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }

  // Capture methods - Truth Analysis Framework
  async getCaptures(projectId: string): Promise<Capture[]> {
    return await this.db
      .select()
      .from(captures)
      .where(eq(captures.projectId, projectId))
      .orderBy(desc(captures.createdAt));
  }

  async getCaptureById(id: string): Promise<Capture | undefined> {
    const result = await this.db.select().from(captures).where(eq(captures.id, id)).limit(1);
    return result[0];
  }

  async createCapture(capture: InsertCapture): Promise<Capture> {
    const result = await this.db.insert(captures).values({
      ...capture,
      id: randomUUID(),
    }).returning();
    
    console.log(`✅ Created capture: ${result[0].title || 'Untitled'} for project ${capture.projectId}`);
    return result[0];
  }

  async updateCapture(id: string, updates: Partial<Capture>): Promise<Capture | undefined> {
    const result = await this.db
      .update(captures)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(captures.id, id))
      .returning();
    return result[0];
  }

  async deleteCapture(id: string): Promise<boolean> {
    const result = await this.db.delete(captures).where(eq(captures.id, id));
    return result.rowCount > 0;
  }

  async getPendingCaptures(): Promise<Capture[]> {
    return await this.db
      .select()
      .from(captures)
      .where(eq(captures.analysisStatus, 'pending'))
      .orderBy(desc(captures.createdAt));
  }

  async getUserCaptures(userId: string): Promise<Capture[]> {
    return await this.db
      .select()
      .from(captures)
      .where(eq(captures.userId, userId))
      .orderBy(desc(captures.createdAt));
  }

  // Brief methods
  async getBriefs(projectId: string): Promise<Brief[]> {
    return await this.db
      .select()
      .from(briefs)
      .where(eq(briefs.projectId, projectId))
      .orderBy(desc(briefs.createdAt));
  }

  async getBriefById(id: string): Promise<Brief | undefined> {
    const result = await this.db.select().from(briefs).where(eq(briefs.id, id)).limit(1);
    return result[0];
  }

  async createBrief(brief: InsertBrief): Promise<Brief> {
    const result = await this.db.insert(briefs).values({
      ...brief,
      id: randomUUID(),
    }).returning();
    return result[0];
  }

  async updateBrief(id: string, updates: Partial<Brief>): Promise<Brief | undefined> {
    const result = await this.db.update(briefs).set(updates).where(eq(briefs.id, id)).returning();
    return result[0];
  }

  async deleteBrief(id: string): Promise<boolean> {
    const result = await this.db.delete(briefs).where(eq(briefs.id, id));
    return (result as any).rowCount > 0;
  }

  // Brief Capture relationship methods
  async addCaptureToBrief(briefCapture: InsertBriefCapture): Promise<BriefCapture> {
    const result = await this.db.insert(briefCaptures).values({
      ...briefCapture,
      id: randomUUID(),
    }).returning();
    return result[0];
  }

  async removeCaptureFromBrief(briefId: string, captureId: string): Promise<boolean> {
    const result = await this.db.delete(briefCaptures)
      .where(and(eq(briefCaptures.briefId, briefId), eq(briefCaptures.captureId, captureId)));
    return (result as any).rowCount > 0;
  }

  async getBriefCaptures(briefId: string): Promise<BriefCapture[]> {
    return await this.db.select().from(briefCaptures)
      .where(eq(briefCaptures.briefId, briefId))
      .orderBy(briefCaptures.orderIndex);
  }

  // Content Radar methods - Trending content analysis
  async getContentItems(filters?: {
    category?: string;
    platform?: string;
    timeRange?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<ContentRadar[]> {
    try {
      console.log("🔍 Fetching content items from Supabase content_radar table with filters:", filters);
      
      let query = this.db.select().from(contentRadar).where(eq(contentRadar.isActive, true));
      
      // Apply filters
      const conditions = [eq(contentRadar.isActive, true)];
      if (filters?.category && filters.category !== 'all') {
        conditions.push(eq(contentRadar.category, filters.category));
      }
      if (filters?.platform && filters.platform !== 'all') {
        conditions.push(eq(contentRadar.platform, filters.platform));
      }
      
      if (conditions.length > 1) {
        query = query.where(and(...conditions));
      }
      
      // Apply sorting
      if (filters?.sortBy === 'viralScore') {
        query = query.orderBy(desc(contentRadar.viralScore));
      } else if (filters?.sortBy === 'engagement') {
        query = query.orderBy(desc(contentRadar.engagement));
      } else {
        query = query.orderBy(desc(contentRadar.createdAt));
      }
      
      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.offset(filters.offset);
      }
      
      const result = await query;
      console.log(`✅ Retrieved ${result.length} content items from Supabase`);
      return result;
    } catch (error) {
      console.error("❌ Error fetching content items from Supabase:", error);
      throw error;
    }
  }

  async getContentItemById(id: string): Promise<ContentRadar | undefined> {
    const result = await this.db.select().from(contentRadar).where(eq(contentRadar.id, id)).limit(1);
    return result[0];
  }

  async createContentItem(item: InsertContentRadar): Promise<ContentRadar> {
    const result = await this.db.insert(contentRadar).values({
      ...item,
      id: randomUUID(),
    }).returning();
    return result[0];
  }

  async updateContentItem(id: string, updates: Partial<ContentRadar>): Promise<ContentRadar | undefined> {
    const result = await this.db
      .update(contentRadar)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contentRadar.id, id))
      .returning();
    return result[0];
  }

  async deleteContentItem(id: string): Promise<boolean> {
    const result = await this.db.delete(contentRadar).where(eq(contentRadar.id, id));
    return result.rowCount > 0;
  }

  async getStats(): Promise<{
    totalTrends: number;
    viralPotential: number;
    activeSources: number;
    avgScore: number;
  }> {
    const items = await this.db.select().from(contentRadar).where(eq(contentRadar.isActive, true));
    const highViralItems = items.filter((item: ContentRadar) => parseFloat(String(item.viralScore || '0')) >= 8.0);
    const avgScore = items.length > 0 
      ? items.reduce((sum: number, item: ContentRadar) => sum + parseFloat(String(item.viralScore || '0')), 0) / items.length
      : 0;
    
    const activePlatforms = new Set(items.map((item: ContentRadar) => item.platform)).size;
    
    return {
      totalTrends: items.length,
      viralPotential: highViralItems.length,
      activeSources: activePlatforms,
      avgScore: Math.round(avgScore * 10) / 10,
    };
  }
}