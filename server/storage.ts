import { 
  type User, type InsertUser,
  type Project, type InsertProject,
  type Capture, type InsertCapture,
  type Brief, type InsertBrief,
  type BriefCapture, type InsertBriefCapture,
  type Signal, type InsertSignal,
  type Source, type InsertSource,
  type SignalSource, type InsertSignalSource,
  type UserPreference, type InsertUserPreference,
  type ContentRadar, type InsertContentRadar,
  type ScanHistory, type InsertScanHistory
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users, projects, captures, briefs, briefCaptures, signals, sources, signalSources, userPreferences, contentRadar, scanHistory } from "@shared/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getProjects(userId: string): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // Capture methods
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
  
  // Signal methods (replacing content radar)
  getSignals(filters?: {
    category?: string;
    signalType?: string;
    timeRange?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<Signal[]>;
  getSignalById(id: string): Promise<Signal | undefined>;
  createSignal(signal: InsertSignal): Promise<Signal>;
  updateSignal(id: string, updates: Partial<Signal>): Promise<Signal | undefined>;
  deleteSignal(id: string): Promise<boolean>;
  getRecentSignals(timeWindow: string): Promise<Signal[]>;
  
  // Source methods
  getSourceByName(name: string): Promise<Source | undefined>;
  getSourceById(id: string): Promise<Source | undefined>;
  getAllSources(tier?: number): Promise<Source[]>;
  createSource(source: InsertSource): Promise<Source>;
  updateSource(id: string, updates: Partial<Source>): Promise<Source | undefined>;
  
  // Signal Source relationship methods
  createSignalSource(signalSource: InsertSignalSource): Promise<SignalSource>;
  getSignalSources(signalId: string): Promise<SignalSource[]>;
  
  // User Preference methods
  getUserPreferences(userId: string): Promise<UserPreference | undefined>;
  createUserPreferences(prefs: InsertUserPreference): Promise<UserPreference>;
  updateUserPreferences(userId: string, updates: Partial<UserPreference>): Promise<UserPreference | undefined>;
  
  // Legacy Content Radar methods (for backward compatibility)
  getContentItems(filters?: any): Promise<ContentRadar[]>;
  getContentItemById(id: string): Promise<ContentRadar | undefined>;
  createContentItem(item: InsertContentRadar): Promise<ContentRadar>;
  updateContentItem(id: string, updates: Partial<ContentRadar>): Promise<ContentRadar | undefined>;
  deleteContentItem(id: string): Promise<boolean>;
  
  // Statistics methods
  getStats(): Promise<{
    totalTrends: number;
    viralPotential: number;
    activeSources: number;
    avgScore: number;
  }>;
  
  // Scan History methods
  createScanHistory(scan: InsertScanHistory): Promise<ScanHistory>;
  getRecentScans(limit?: number): Promise<ScanHistory[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private captures: Map<string, Capture>;
  private briefs: Map<string, Brief>;
  private briefCaptures: Map<string, BriefCapture>;
  private signals: Map<string, Signal>;
  private sources: Map<string, Source>;
  private signalSources: Map<string, SignalSource>;
  private userPreferences: Map<string, UserPreference>;
  private scanHistory: Map<string, ScanHistory>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.captures = new Map();
    this.briefs = new Map();
    this.briefCaptures = new Map();
    this.signals = new Map();
    this.sources = new Map();
    this.signalSources = new Map();
    this.userPreferences = new Map();
    this.scanHistory = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || 'strategist',
      email: insertUser.email || null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async getProjects(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      ...insertProject,
      id,
      briefTemplate: insertProject.briefTemplate || 'jimmy-johns',
      status: insertProject.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updated = {
      ...project,
      ...updates,
      id: project.id,
      updatedAt: new Date()
    };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Capture methods
  async getCaptures(projectId: string): Promise<Capture[]> {
    return Array.from(this.captures.values())
      .filter(capture => capture.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCaptureById(id: string): Promise<Capture | undefined> {
    return this.captures.get(id);
  }

  async createCapture(insertCapture: InsertCapture): Promise<Capture> {
    const id = randomUUID();
    const capture: Capture = {
      ...insertCapture,
      id,
      status: insertCapture.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.captures.set(id, capture);
    return capture;
  }

  async updateCapture(id: string, updates: Partial<Capture>): Promise<Capture | undefined> {
    const capture = this.captures.get(id);
    if (!capture) return undefined;
    
    const updated = {
      ...capture,
      ...updates,
      id: capture.id,
      updatedAt: new Date()
    };
    this.captures.set(id, updated);
    return updated;
  }

  async deleteCapture(id: string): Promise<boolean> {
    return this.captures.delete(id);
  }

  async getPendingCaptures(): Promise<Capture[]> {
    return Array.from(this.captures.values())
      .filter(capture => capture.status === 'pending')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Get all captures for a user across all projects (for My Captures page)
  async getUserCaptures(userId: string): Promise<any[]> {
    const userProjects = Array.from(this.projects.values())
      .filter(project => project.userId === userId);
    
    const projectIds = userProjects.map(p => p.id);
    
    return Array.from(this.captures.values())
      .filter(capture => projectIds.includes(capture.projectId))
      .map(capture => {
        const project = userProjects.find(p => p.id === capture.projectId);
        return {
          id: capture.id,
          title: capture.title || 'Untitled Capture',
          content: capture.content || '',
          type: capture.type,
          url: capture.sourceUrl,
          projectId: capture.projectId,
          projectName: project?.name || 'Unknown Project',
          notes: capture.userNote,
          customCopy: capture.customCopy,
          tags: capture.tags || [],
          createdAt: capture.createdAt.toISOString(),
          updatedAt: capture.updatedAt.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Brief methods
  async getBriefs(projectId: string): Promise<Brief[]> {
    return Array.from(this.briefs.values())
      .filter(brief => brief.projectId === projectId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getBriefById(id: string): Promise<Brief | undefined> {
    return this.briefs.get(id);
  }

  async createBrief(insertBrief: InsertBrief): Promise<Brief> {
    const id = randomUUID();
    const brief: Brief = {
      ...insertBrief,
      id,
      template: insertBrief.template || 'jimmy-johns',
      status: insertBrief.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.briefs.set(id, brief);
    return brief;
  }

  async updateBrief(id: string, updates: Partial<Brief>): Promise<Brief | undefined> {
    const brief = this.briefs.get(id);
    if (!brief) return undefined;
    
    const updated = {
      ...brief,
      ...updates,
      id: brief.id,
      updatedAt: new Date()
    };
    this.briefs.set(id, updated);
    return updated;
  }

  async deleteBrief(id: string): Promise<boolean> {
    return this.briefs.delete(id);
  }

  // Brief Capture relationship methods
  async addCaptureToBrief(insertBriefCapture: InsertBriefCapture): Promise<BriefCapture> {
    const id = randomUUID();
    const briefCapture: BriefCapture = {
      ...insertBriefCapture,
      id,
      createdAt: new Date()
    };
    this.briefCaptures.set(id, briefCapture);
    return briefCapture;
  }

  async removeCaptureFromBrief(briefId: string, captureId: string): Promise<boolean> {
    const toRemove = Array.from(this.briefCaptures.values())
      .find(bc => bc.briefId === briefId && bc.captureId === captureId);
    
    if (toRemove) {
      return this.briefCaptures.delete(toRemove.id);
    }
    return false;
  }

  async getBriefCaptures(briefId: string): Promise<BriefCapture[]> {
    return Array.from(this.briefCaptures.values())
      .filter(bc => bc.briefId === briefId)
      .sort((a, b) => a.position - b.position);
  }

  // Signal methods
  async getSignals(filters?: {
    category?: string;
    signalType?: string;
    timeRange?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<Signal[]> {
    let items = Array.from(this.signals.values()).filter(item => item.isActive);
    
    if (filters?.category && filters.category !== 'all') {
      items = items.filter(item => item.category === filters.category);
    }
    
    if (filters?.signalType) {
      items = items.filter(item => item.signalType === filters.signalType);
    }
    
    if (filters?.timeRange) {
      const now = new Date();
      const cutoff = new Date();
      
      switch (filters.timeRange) {
        case 'hour':
          cutoff.setHours(now.getHours() - 1);
          break;
        case '6hours':
          cutoff.setHours(now.getHours() - 6);
          break;
        case '24hours':
        case '24h':
          cutoff.setDate(now.getDate() - 1);
          break;
        case 'week':
        case '7d':
          cutoff.setDate(now.getDate() - 7);
          break;
        case '30d':
          cutoff.setDate(now.getDate() - 30);
          break;
      }
      
      items = items.filter(item => item.createdAt && new Date(item.createdAt) >= cutoff);
    }
    
    // Sort items
    const sortBy = filters?.sortBy || 'viralScore';
    items.sort((a, b) => {
      switch (sortBy) {
        case 'recency':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'engagement':
          return (b.engagement || 0) - (a.engagement || 0);
        case 'growthRate':
          return parseFloat(b.growthRate || '0') - parseFloat(a.growthRate || '0');
        case 'viralScore':
        default:
          return parseFloat(b.viralScore || '0') - parseFloat(a.viralScore || '0');
      }
    });
    
    // Apply pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    return items.slice(offset, offset + limit);
  }

  async getSignalById(id: string): Promise<Signal | undefined> {
    return this.signals.get(id);
  }

  async createSignal(signal: InsertSignal): Promise<Signal> {
    const id = randomUUID();
    const newSignal: Signal = {
      ...signal,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.signals.set(id, newSignal);
    return newSignal;
  }

  async updateSignal(id: string, updates: Partial<Signal>): Promise<Signal | undefined> {
    const signal = this.signals.get(id);
    if (!signal) return undefined;
    
    const updated = { ...signal, ...updates, updatedAt: new Date() };
    this.signals.set(id, updated);
    return updated;
  }

  async deleteSignal(id: string): Promise<boolean> {
    return this.signals.delete(id);
  }

  async getRecentSignals(timeWindow: string): Promise<Signal[]> {
    return this.getSignals({ timeRange: timeWindow, sortBy: 'recency' });
  }

  // Source methods
  async getSourceByName(name: string): Promise<Source | undefined> {
    return Array.from(this.sources.values()).find(source => source.name === name);
  }

  async getSourceById(id: string): Promise<Source | undefined> {
    return this.sources.get(id);
  }

  async getAllSources(tier?: number): Promise<Source[]> {
    let sources = Array.from(this.sources.values()).filter(s => s.isActive);
    if (tier) {
      sources = sources.filter(s => s.tier === tier);
    }
    return sources;
  }

  async createSource(source: InsertSource): Promise<Source> {
    const id = randomUUID();
    const newSource: Source = {
      ...source,
      id,
      createdAt: new Date()
    };
    this.sources.set(id, newSource);
    return newSource;
  }

  async updateSource(id: string, updates: Partial<Source>): Promise<Source | undefined> {
    const source = this.sources.get(id);
    if (!source) return undefined;
    
    const updated = { ...source, ...updates };
    this.sources.set(id, updated);
    return updated;
  }

  // Signal Source relationship methods
  async createSignalSource(signalSource: InsertSignalSource): Promise<SignalSource> {
    const id = randomUUID();
    const newSignalSource: SignalSource = {
      ...signalSource,
      id,
      createdAt: new Date()
    };
    this.signalSources.set(id, newSignalSource);
    return newSignalSource;
  }

  async getSignalSources(signalId: string): Promise<SignalSource[]> {
    return Array.from(this.signalSources.values()).filter(ss => ss.signalId === signalId);
  }

  // User Preference methods
  async getUserPreferences(userId: string): Promise<UserPreference | undefined> {
    return Array.from(this.userPreferences.values()).find(pref => pref.userId === userId);
  }

  async createUserPreferences(prefs: InsertUserPreference): Promise<UserPreference> {
    const id = randomUUID();
    const newPrefs: UserPreference = {
      ...prefs,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.userPreferences.set(id, newPrefs);
    return newPrefs;
  }

  async updateUserPreferences(userId: string, updates: Partial<UserPreference>): Promise<UserPreference | undefined> {
    const prefs = await this.getUserPreferences(userId);
    if (!prefs) return undefined;
    
    const updated = { ...prefs, ...updates, updatedAt: new Date() };
    this.userPreferences.set(prefs.id, updated);
    return updated;
  }

  // Legacy Content Radar methods (mapping to Signal methods)
  async getContentItems(filters?: {
    category?: string;
    platform?: string;
    timeRange?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<ContentRadar[]> {
    // Map platform filter to signal sources
    let signals = await this.getSignals({
      category: filters?.category,
      timeRange: filters?.timeRange,
      sortBy: filters?.sortBy,
      limit: filters?.limit,
      offset: filters?.offset
    });
    
    // Filter by platform if specified
    if (filters?.platform) {
      const platformSignalIds = Array.from(this.signalSources.values())
        .filter(ss => {
          const source = this.sources.get(ss.sourceId);
          return source?.name === filters.platform;
        })
        .map(ss => ss.signalId);
      
      signals = signals.filter(s => platformSignalIds.includes(s.id));
    }
    
    // Map signals to ContentRadar format for backward compatibility
    return signals.map(signal => ({
      ...signal,
      platform: this.getPlatformFromSignal(signal),
      hook1: signal.hooks?.[0] || null,
      hook2: signal.hooks?.[1] || null
    })) as ContentRadar[];
  }

  async getContentItemById(id: string): Promise<ContentRadar | undefined> {
    const signal = await this.getSignalById(id);
    if (!signal) return undefined;
    
    return {
      ...signal,
      platform: this.getPlatformFromSignal(signal),
      hook1: signal.hooks?.[0] || null,
      hook2: signal.hooks?.[1] || null
    } as ContentRadar;
  }

  async createContentItem(item: InsertContentRadar): Promise<ContentRadar> {
    // Convert ContentRadar format to Signal format
    const signal = await this.createSignal({
      ...item,
      hooks: [item.hook1, item.hook2].filter(Boolean) as string[]
    });
    
    // If platform is specified, create a signal source relationship
    if (item.platform) {
      const source = await this.getSourceByName(item.platform);
      if (source) {
        await this.createSignalSource({
          signalId: signal.id,
          sourceId: source.id,
          platformUrl: item.url
        });
      }
    }
    
    return {
      ...signal,
      platform: item.platform || 'unknown',
      hook1: signal.hooks?.[0] || null,
      hook2: signal.hooks?.[1] || null
    } as ContentRadar;
  }

  async updateContentItem(id: string, updates: Partial<ContentRadar>): Promise<ContentRadar | undefined> {
    const signalUpdates: Partial<Signal> = {
      ...updates,
      hooks: updates.hook1 || updates.hook2 
        ? [updates.hook1 || '', updates.hook2 || ''].filter(Boolean)
        : undefined
    };
    
    const updatedSignal = await this.updateSignal(id, signalUpdates);
    if (!updatedSignal) return undefined;
    
    return {
      ...updatedSignal,
      platform: this.getPlatformFromSignal(updatedSignal),
      hook1: updatedSignal.hooks?.[0] || null,
      hook2: updatedSignal.hooks?.[1] || null
    } as ContentRadar;
  }

  async deleteContentItem(id: string): Promise<boolean> {
    return this.deleteSignal(id);
  }

  private getPlatformFromSignal(signal: Signal): string {
    const signalSource = Array.from(this.signalSources.values())
      .find(ss => ss.signalId === signal.id);
    
    if (signalSource) {
      const source = this.sources.get(signalSource.sourceId);
      return source?.name || 'unknown';
    }
    
    return (signal.metadata as any)?.platform || 'unknown';
  }

  async getStats(): Promise<{
    totalTrends: number;
    viralPotential: number;
    activeSources: number;
    avgScore: number;
  }> {
    const items = Array.from(this.signals.values()).filter(item => item.isActive);
    const highViralItems = items.filter(item => parseFloat(item.viralScore || '0') >= 8.0);
    const avgScore = items.length > 0 
      ? items.reduce((sum, item) => sum + parseFloat(item.viralScore || '0'), 0) / items.length
      : 0;
    
    const activeSources = Array.from(this.sources.values()).filter(s => s.isActive).length;
    
    return {
      totalTrends: items.length,
      viralPotential: highViralItems.length,
      activeSources: activeSources,
      avgScore: Math.round(avgScore * 10) / 10,
    };
  }

  async createScanHistory(scan: InsertScanHistory): Promise<ScanHistory> {
    const id = randomUUID();
    const scanRecord: ScanHistory = {
      ...scan,
      id,
      createdAt: new Date(),
      itemsFound: scan.itemsFound || null,
      errorMessage: scan.errorMessage || null,
      scanDuration: scan.scanDuration || null,
    };
    this.scanHistory.set(id, scanRecord);
    return scanRecord;
  }

  async getRecentScans(limit = 10): Promise<ScanHistory[]> {
    const scans = Array.from(this.scanHistory.values());
    return scans
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, limit);
  }
}

// Database storage implementation
class DatabaseStorage implements IStorage {
  private db: any;

  constructor() {
    // Force use of local Neon database credentials instead of DATABASE_URL
    const databaseUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
    
    if (!process.env.PGUSER || !process.env.PGPASSWORD || !process.env.PGHOST || !process.env.PGDATABASE) {
      throw new Error("PostgreSQL credentials (PGUSER, PGPASSWORD, PGHOST, PGDATABASE) are required");
    }
    try {
      console.log(`🔗 Connecting to database: ${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`);
      const sql = neon(databaseUrl);
      this.db = drizzle(sql);
      console.log("✅ Database connection established with local Neon instance");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      throw error;
    }
  }

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

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Project methods for DatabaseStorage
  async getProjects(userId: string): Promise<Project[]> {
    return await this.db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    const result = await this.db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0];
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const result = await this.db.insert(projects).values(insertProject).returning();
    return result[0];
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const result = await this.db.update(projects).set({...updates, updatedAt: new Date()}).where(eq(projects.id, id)).returning();
    return result[0];
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await this.db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  // Capture methods for DatabaseStorage
  async getCaptures(projectId: string): Promise<Capture[]> {
    return await this.db.select().from(captures).where(eq(captures.projectId, projectId)).orderBy(desc(captures.createdAt));
  }

  async getCaptureById(id: string): Promise<Capture | undefined> {
    try {
      const result = await this.db.execute(sql`
        SELECT * FROM captures WHERE id = ${id} LIMIT 1
      `);
      return result[0] as Capture;
    } catch (error) {
      console.error("❌ Error fetching capture:", error);
      throw error;
    }
  }

  async createCapture(capture: InsertCapture): Promise<Capture> {
    try {
      // Use raw SQL to bypass Drizzle schema issues completely  
      const result = await this.db.execute(sql`
        INSERT INTO captures (
          id, project_id, user_id, type, title, content, url, platform, 
          metadata, status, created_at, updated_at, tags, screenshot_url, 
          summary, analysis_status, truth_analysis
        ) VALUES (
          ${capture.id || sql`gen_random_uuid()`},
          ${capture.projectId},
          ${capture.userId || '777cc116-c924-4e13-87c0-e0a26b7596b6'},
          ${capture.type},
          ${capture.title || ''},
          ${capture.content || ''},
          ${capture.url || ''},
          ${capture.platform || ''},
          ${JSON.stringify(capture.metadata || {})},
          ${capture.status || 'pending'},
          NOW(),
          NOW(),
          ${JSON.stringify(capture.tags || [])},
          ${capture.screenshotUrl || ''},
          ${capture.summary || ''},
          ${capture.analysisStatus || 'pending'},
          ${JSON.stringify(capture.truthAnalysis || {})}
        )
        RETURNING *
      `);
      
      console.log("✅ Capture created successfully using raw SQL");
      return result[0] as Capture;
    } catch (error) {
      console.error("❌ Error creating capture with raw SQL:", error);
      throw error;
    }
  }

  async updateCapture(id: string, updates: Partial<Capture>): Promise<Capture | undefined> {
    const result = await this.db.update(captures).set({...updates, updatedAt: new Date()}).where(eq(captures.id, id)).returning();
    return result[0];
  }

  async deleteCapture(id: string): Promise<boolean> {
    const result = await this.db.delete(captures).where(eq(captures.id, id)).returning();
    return result.length > 0;
  }

  async getPendingCaptures(): Promise<Capture[]> {
    return await this.db.select().from(captures).where(eq(captures.status, 'pending')).orderBy(desc(captures.createdAt));
  }

  async getUserCaptures(userId: string): Promise<Capture[]> {
    try {
      const result = await this.db.execute(sql`
        SELECT c.* FROM captures c
        LEFT JOIN projects p ON c.project_id = p.id
        WHERE p.user_id = ${userId}
        ORDER BY c.created_at DESC
      `);
      
      return result as Capture[];
    } catch (error) {
      console.error("❌ Error fetching user captures:", error);
      throw error;
    }
  }

  // Stub methods for interfaces not yet implemented in database
  async getBriefs(projectId: string): Promise<Brief[]> { return []; }
  async getBriefById(id: string): Promise<Brief | undefined> { return undefined; }
  async createBrief(brief: InsertBrief): Promise<Brief> { return {} as Brief; }
  async updateBrief(id: string, updates: Partial<Brief>): Promise<Brief | undefined> { return undefined; }
  async deleteBrief(id: string): Promise<boolean> { return false; }
  async addCaptureToBrief(briefCapture: InsertBriefCapture): Promise<BriefCapture> { return {} as BriefCapture; }
  async removeCaptureFromBrief(briefId: string, captureId: string): Promise<boolean> { return false; }
  async getBriefCaptures(briefId: string): Promise<BriefCapture[]> { return []; }
  async getSignals(filters?: any): Promise<Signal[]> { return []; }
  async getSignalById(id: string): Promise<Signal | undefined> { return undefined; }
  async createSignal(signal: InsertSignal): Promise<Signal> { return {} as Signal; }
  async updateSignal(id: string, updates: Partial<Signal>): Promise<Signal | undefined> { return undefined; }
  async deleteSignal(id: string): Promise<boolean> { return false; }
  async getRecentSignals(timeWindow: string): Promise<Signal[]> { return []; }
  async getSourceByName(name: string): Promise<Source | undefined> { return undefined; }
  async getSourceById(id: string): Promise<Source | undefined> { return undefined; }
  async getAllSources(tier?: number): Promise<Source[]> { return []; }
  async createSource(source: InsertSource): Promise<Source> { return {} as Source; }
  async updateSource(id: string, updates: Partial<Source>): Promise<Source | undefined> { return undefined; }
  async createSignalSource(signalSource: InsertSignalSource): Promise<SignalSource> { return {} as SignalSource; }
  async getSignalSources(signalId: string): Promise<SignalSource[]> { return []; }
  async getUserPreferences(userId: string): Promise<UserPreference | undefined> { return undefined; }
  async createUserPreferences(prefs: InsertUserPreference): Promise<UserPreference> { return {} as UserPreference; }
  async updateUserPreferences(userId: string, updates: Partial<UserPreference>): Promise<UserPreference | undefined> { return undefined; }

  async getContentItems(filters?: {
    category?: string;
    platform?: string;
    timeRange?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<ContentRadar[]> {
    try {
      console.log("🔍 Fetching content items from content_radar table with filters:", filters);
      
      // Raw SQL query to bypass Drizzle schema issues
      const result = await this.db.execute(sql`
        SELECT id, title, url, content, summary, hook1, hook2, category, platform, 
               viral_score as "viralScore", engagement, growth_rate as "growthRate", 
               metadata, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
        FROM content_radar 
        WHERE is_active = true
        ${filters?.category && filters.category !== 'all' ? sql`AND category = ${filters.category}` : sql``}
        ${filters?.platform && filters.platform !== 'all' ? sql`AND platform = ${filters.platform}` : sql``}
        ORDER BY ${filters?.sortBy === 'viralScore' ? sql`viral_score DESC` : 
                  filters?.sortBy === 'engagement' ? sql`engagement DESC` : 
                  sql`created_at DESC`}
        ${filters?.limit ? sql`LIMIT ${filters.limit}` : sql``}
        ${filters?.offset ? sql`OFFSET ${filters.offset}` : sql``}
      `);
      
      console.log(`✅ Retrieved ${result.length} content items from content_radar table using raw SQL`);
      return result as ContentRadar[];
    } catch (error) {
      console.error("❌ Error fetching content items:", error);
      throw error;
    }
  }

  async getContentItemById(id: string): Promise<ContentRadar | undefined> {
    const result = await this.db.select().from(contentRadar).where(eq(contentRadar.id, id)).limit(1);
    return result[0];
  }

  async createContentItem(item: InsertContentRadar): Promise<ContentRadar> {
    const result = await this.db.insert(contentRadar).values(item).returning();
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
    const highViralItems = items.filter((item: ContentRadar) => parseFloat(item.viralScore || '0') >= 8.0);
    const avgScore = items.length > 0 
      ? items.reduce((sum: number, item: ContentRadar) => sum + parseFloat(item.viralScore || '0'), 0) / items.length
      : 0;
    
    const activePlatforms = new Set(items.map((item: ContentRadar) => item.platform)).size;
    
    return {
      totalTrends: items.length,
      viralPotential: highViralItems.length,
      activeSources: activePlatforms,
      avgScore: Math.round(avgScore * 10) / 10,
    };
  }

  async createScanHistory(scan: InsertScanHistory): Promise<ScanHistory> {
    const result = await this.db.insert(scanHistory).values(scan).returning();
    return result[0];
  }

  async getRecentScans(limit = 10): Promise<ScanHistory[]> {
    return await this.db.select().from(scanHistory).orderBy(desc(scanHistory.createdAt)).limit(limit);
  }
}

// Use database storage for persistent data
let storage: IStorage;
try {
  storage = new DatabaseStorage();
  console.log("✅ Using database storage");
} catch (error) {
  console.warn("⚠️ Database connection failed, using memory storage:", error);
  storage = new MemStorage();
}
export { storage };
