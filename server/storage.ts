// Fixed Storage Implementation for Supabase
// Addresses snake_case/camelCase mapping issues
import { sql } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users, projects, captures, contentRadar, briefs, briefCaptures } from "@shared/supabase-schema";
import type { 
  User, Project, Capture, ContentRadar, Brief, BriefCapture,
  InsertUser, InsertProject, InsertCapture, InsertContentRadar, InsertBrief, InsertBriefCapture 
} from "@shared/supabase-schema";

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
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Capture methods
  getCaptures(projectId: string): Promise<Capture[]>;
  getCaptureById(id: string): Promise<Capture | undefined>;
  createCapture(capture: InsertCapture): Promise<Capture>;
  updateCapture(id: string, updates: Partial<InsertCapture>): Promise<Capture>;
  deleteCapture(id: string): Promise<void>;
  
  // Content radar methods
  getContentItems(filter: {}): Promise<ContentRadar[]>;
  
  // Brief methods
  getBriefs(projectId: string): Promise<Brief[]>;
  createBrief(brief: InsertBrief): Promise<Brief>;
}

export class DatabaseStorage implements IStorage {
  private db: any;

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase() {
    console.log("🔗 Connecting to database using individual credentials");
    
    const databaseUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
    
    const sql_conn = neon(databaseUrl);
    this.db = drizzle(sql_conn);
    
    console.log("✅ Database connection established with fixed schema mapping");
  }

  // User methods with raw SQL to avoid mapping issues
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await this.db.execute(sql`
        SELECT id, email, username, password, role, 
               onboarding_completed as "onboardingCompleted",
               tour_completed as "tourCompleted",
               progress_data as "progressData",
               google_tokens as "googleTokens",
               created_at as "createdAt",
               updated_at as "updatedAt"
        FROM users WHERE email = ${email} LIMIT 1
      `);
      return result.rows[0] as User;
    } catch (error) {
      console.error("❌ Error fetching user by email:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await this.db.execute(sql`
        SELECT id, email, username, password, role, 
               onboarding_completed as "onboardingCompleted",
               tour_completed as "tourCompleted",
               progress_data as "progressData",
               google_tokens as "googleTokens",
               created_at as "createdAt",
               updated_at as "updatedAt"
        FROM users WHERE username = ${username} LIMIT 1
      `);
      return result.rows[0] as User;
    } catch (error) {
      console.error("❌ Error fetching user by username:", error);
      return undefined;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await this.db.execute(sql`
        SELECT id, email, username, password, role, 
               onboarding_completed as "onboardingCompleted",
               tour_completed as "tourCompleted",
               progress_data as "progressData",
               google_tokens as "googleTokens",
               created_at as "createdAt",
               updated_at as "updatedAt"
        FROM users WHERE id = ${id} LIMIT 1
      `);
      return result.rows[0] as User;
    } catch (error) {
      console.error("❌ Error fetching user by id:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await this.db.execute(sql`
        INSERT INTO users (id, email, username, password, role, onboarding_completed, tour_completed, progress_data, google_tokens, created_at, updated_at)
        VALUES (uuid_generate_v4(), ${insertUser.email}, ${insertUser.username}, ${insertUser.password}, 
                ${insertUser.role || 'user'}, ${insertUser.onboardingCompleted || false}, 
                ${insertUser.tourCompleted || false}, ${JSON.stringify(insertUser.progressData || {})}, 
                ${JSON.stringify(insertUser.googleTokens || {})}, NOW(), NOW())
        RETURNING id, email, username, password, role, 
                  onboarding_completed as "onboardingCompleted",
                  tour_completed as "tourCompleted",
                  progress_data as "progressData",
                  google_tokens as "googleTokens",
                  created_at as "createdAt",
                  updated_at as "updatedAt"
      `);
      return result.rows[0] as User;
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw error;
    }
  }

  // Project methods
  async getProjects(userId: string): Promise<Project[]> {
    try {
      const result = await this.db.execute(sql`
        SELECT id, user_id as "userId", name, description, brief_template as "briefTemplate",
               status, client, deadline, tags,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM projects WHERE user_id = ${userId}
        ORDER BY updated_at DESC
      `);
      return result.rows as Project[];
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
      return [];
    }
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    try {
      const result = await this.db.execute(sql`
        SELECT id, user_id as "userId", name, description, brief_template as "briefTemplate",
               status, client, deadline, tags,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM projects WHERE id = ${id} LIMIT 1
      `);
      return result.rows[0] as Project;
    } catch (error) {
      console.error("❌ Error fetching project:", error);
      return undefined;
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    try {
      const result = await this.db.execute(sql`
        INSERT INTO projects (id, user_id, name, description, brief_template, status, client, deadline, tags, created_at, updated_at)
        VALUES (uuid_generate_v4(), ${project.userId}, ${project.name}, ${project.description}, 
                ${project.briefTemplate}, ${project.status || 'active'}, ${project.client}, 
                ${project.deadline}, ${JSON.stringify(project.tags || [])}, NOW(), NOW())
        RETURNING id, user_id as "userId", name, description, brief_template as "briefTemplate",
                  status, client, deadline, tags,
                  created_at as "createdAt", updated_at as "updatedAt"
      `);
      return result.rows[0] as Project;
    } catch (error) {
      console.error("❌ Error creating project:", error);
      throw error;
    }
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    try {
      const result = await this.db.execute(sql`
        UPDATE projects SET 
          name = COALESCE(${updates.name}, name),
          description = COALESCE(${updates.description}, description),
          brief_template = COALESCE(${updates.briefTemplate}, brief_template),
          status = COALESCE(${updates.status}, status),
          client = COALESCE(${updates.client}, client),
          deadline = COALESCE(${updates.deadline}, deadline),
          tags = COALESCE(${JSON.stringify(updates.tags || [])}, tags),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, user_id as "userId", name, description, brief_template as "briefTemplate",
                  status, client, deadline, tags,
                  created_at as "createdAt", updated_at as "updatedAt"
      `);
      return result.rows[0] as Project;
    } catch (error) {
      console.error("❌ Error updating project:", error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await this.db.execute(sql`DELETE FROM projects WHERE id = ${id}`);
    } catch (error) {
      console.error("❌ Error deleting project:", error);
      throw error;
    }
  }

  // Capture methods
  async getCaptures(projectId: string): Promise<Capture[]> {
    try {
      const result = await this.db.execute(sql`
        SELECT id, project_id as "projectId", user_id as "userId", type, title, content, url, platform,
               screenshot_url as "screenshotUrl", summary, tags, metadata, truth_analysis as "truthAnalysis",
               analysis_status as "analysisStatus", google_analysis as "googleAnalysis", status,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM captures WHERE project_id = ${projectId}
        ORDER BY created_at DESC
      `);
      return result.rows as Capture[];
    } catch (error) {
      console.error("❌ Error fetching captures:", error);
      return [];
    }
  }

  async getCaptureById(id: string): Promise<Capture | undefined> {
    try {
      const result = await this.db.execute(sql`
        SELECT id, project_id as "projectId", user_id as "userId", type, title, content, url, platform,
               screenshot_url as "screenshotUrl", summary, tags, metadata, truth_analysis as "truthAnalysis",
               analysis_status as "analysisStatus", google_analysis as "googleAnalysis", status,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM captures WHERE id = ${id} LIMIT 1
      `);
      return result.rows[0] as Capture;
    } catch (error) {
      console.error("❌ Error fetching capture:", error);
      return undefined;
    }
  }

  async createCapture(capture: InsertCapture): Promise<Capture> {
    try {
      const result = await this.db.execute(sql`
        INSERT INTO captures (id, project_id, user_id, type, title, content, url, platform, screenshot_url, 
                            summary, tags, metadata, truth_analysis, analysis_status, google_analysis, status, created_at, updated_at)
        VALUES (uuid_generate_v4(), ${capture.projectId}, ${capture.userId}, ${capture.type}, ${capture.title}, 
                ${capture.content}, ${capture.url}, ${capture.platform}, ${capture.screenshotUrl}, 
                ${capture.summary}, ${JSON.stringify(capture.tags || [])}, ${JSON.stringify(capture.metadata || {})}, 
                ${JSON.stringify(capture.truthAnalysis || {})}, ${capture.analysisStatus || 'pending'}, 
                ${JSON.stringify(capture.googleAnalysis || {})}, ${capture.status || 'active'}, NOW(), NOW())
        RETURNING id, project_id as "projectId", user_id as "userId", type, title, content, url, platform,
                  screenshot_url as "screenshotUrl", summary, tags, metadata, truth_analysis as "truthAnalysis",
                  analysis_status as "analysisStatus", google_analysis as "googleAnalysis", status,
                  created_at as "createdAt", updated_at as "updatedAt"
      `);
      return result.rows[0] as Capture;
    } catch (error) {
      console.error("❌ Error creating capture:", error);
      throw error;
    }
  }

  async updateCapture(id: string, updates: Partial<InsertCapture>): Promise<Capture> {
    try {
      const result = await this.db.execute(sql`
        UPDATE captures SET 
          title = COALESCE(${updates.title}, title),
          content = COALESCE(${updates.content}, content),
          summary = COALESCE(${updates.summary}, summary),
          tags = COALESCE(${JSON.stringify(updates.tags || [])}, tags),
          metadata = COALESCE(${JSON.stringify(updates.metadata || {})}, metadata),
          truth_analysis = COALESCE(${JSON.stringify(updates.truthAnalysis || {})}, truth_analysis),
          analysis_status = COALESCE(${updates.analysisStatus}, analysis_status),
          google_analysis = COALESCE(${JSON.stringify(updates.googleAnalysis || {})}, google_analysis),
          status = COALESCE(${updates.status}, status),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, project_id as "projectId", user_id as "userId", type, title, content, url, platform,
                  screenshot_url as "screenshotUrl", summary, tags, metadata, truth_analysis as "truthAnalysis",
                  analysis_status as "analysisStatus", google_analysis as "googleAnalysis", status,
                  created_at as "createdAt", updated_at as "updatedAt"
      `);
      return result.rows[0] as Capture;
    } catch (error) {
      console.error("❌ Error updating capture:", error);
      throw error;
    }
  }

  async deleteCapture(id: string): Promise<void> {
    try {
      await this.db.execute(sql`DELETE FROM captures WHERE id = ${id}`);
    } catch (error) {
      console.error("❌ Error deleting capture:", error);
      throw error;
    }
  }

  // Content radar methods
  async getContentItems(filter: {}): Promise<ContentRadar[]> {
    try {
      const result = await this.db.execute(sql`
        SELECT id, title, url, content, summary, hook1, hook2, category, platform,
               viral_score as "viralScore", engagement, growth_rate as "growthRate",
               metadata, is_active as "isActive",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM content_radar WHERE is_active = true
        ORDER BY created_at DESC LIMIT 50
      `);
      return result.rows as ContentRadar[];
    } catch (error) {
      console.error("❌ Error fetching content items:", error);
      return [];
    }
  }

  // Brief methods
  async getBriefs(projectId: string): Promise<Brief[]> {
    try {
      const result = await this.db.execute(sql`
        SELECT id, project_id as "projectId", title, template_type as "templateType",
               description, status,
               created_at as "createdAt", updated_at as "updatedAt"
        FROM briefs WHERE project_id = ${projectId}
        ORDER BY created_at DESC
      `);
      return result.rows as Brief[];
    } catch (error) {
      console.error("❌ Error fetching briefs:", error);
      return [];
    }
  }

  async createBrief(brief: InsertBrief): Promise<Brief> {
    try {
      const result = await this.db.execute(sql`
        INSERT INTO briefs (id, project_id, title, template_type, description, status, created_at, updated_at)
        VALUES (uuid_generate_v4(), ${brief.projectId}, ${brief.title}, ${brief.templateType}, 
                ${brief.description}, ${brief.status || 'draft'}, NOW(), NOW())
        RETURNING id, project_id as "projectId", title, template_type as "templateType",
                  description, status,
                  created_at as "createdAt", updated_at as "updatedAt"
      `);
      return result.rows[0] as Brief;
    } catch (error) {
      console.error("❌ Error creating brief:", error);
      throw error;
    }
  }
}

// Export the storage instance
export const storage = new DatabaseStorage();