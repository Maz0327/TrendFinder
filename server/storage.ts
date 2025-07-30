// Simplified Storage Implementation - Direct SQL queries only
import { sql } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { 
  User, Project, Capture, ContentRadar, Brief,
  InsertUser, InsertProject, InsertCapture, InsertBrief 
} from "@shared/supabase-schema";

export interface IStorage {
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProjects(userId: string): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  getCaptures(projectId: string): Promise<Capture[]>;
  getCaptureById(id: string): Promise<Capture | undefined>;
  createCapture(capture: InsertCapture): Promise<Capture>;
  updateCapture(id: string, updates: Partial<InsertCapture>): Promise<Capture>;
  deleteCapture(id: string): Promise<void>;
  
  getContentItems(filter: {}): Promise<ContentRadar[]>;
  getBriefs(projectId: string): Promise<Brief[]>;
  createBrief(brief: InsertBrief): Promise<Brief>;
}

export class DatabaseStorage implements IStorage {
  private db: any;

  constructor() {
    const databaseUrl = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
    const sql_conn = neon(databaseUrl);
    this.db = drizzle(sql_conn);
    console.log("✅ Simple database storage initialized");
  }

  // User methods - simplified to avoid SQL alias issues
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      console.log("🔍 Looking up user by email:", email);
      const result = await this.db.execute(sql`
        SELECT * FROM users WHERE email = ${email} LIMIT 1
      `);
      
      console.log("🔍 Database query result:", result.rows?.length || 0, "rows");
      
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          email: row.email,
          username: row.username,
          password: row.password,
          role: row.role,
          onboardingCompleted: row.onboarding_completed,
          tourCompleted: row.tour_completed,
          progressData: row.progress_data,
          googleTokens: row.google_tokens,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as User;
      }
      
      return undefined;
    } catch (error) {
      console.error("❌ Error fetching user by email:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await this.db.execute(sql`
        SELECT * FROM users WHERE username = ${username} LIMIT 1
      `);
      
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          email: row.email,
          username: row.username,
          password: row.password,
          role: row.role,
          onboardingCompleted: row.onboarding_completed,
          tourCompleted: row.tour_completed,
          progressData: row.progress_data,
          googleTokens: row.google_tokens,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as User;
      }
      
      return undefined;
    } catch (error) {
      console.error("❌ Error fetching user by username:", error);
      return undefined;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await this.db.execute(sql`
        SELECT * FROM users WHERE id = ${id} LIMIT 1
      `);
      
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          email: row.email,
          username: row.username,
          password: row.password,
          role: row.role,
          onboardingCompleted: row.onboarding_completed,
          tourCompleted: row.tour_completed,
          progressData: row.progress_data,
          googleTokens: row.google_tokens,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as User;
      }
      
      return undefined;
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
        RETURNING *
      `);
      
      const row = result.rows[0];
      return {
        id: row.id,
        email: row.email,
        username: row.username,
        password: row.password,
        role: row.role,
        onboardingCompleted: row.onboarding_completed,
        tourCompleted: row.tour_completed,
        progressData: row.progress_data,
        googleTokens: row.google_tokens,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as User;
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw error;
    }
  }

  // Placeholder implementations for other methods
  async getProjects(userId: string): Promise<Project[]> {
    return [];
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    return undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    throw new Error("Not implemented");
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    throw new Error("Not implemented");
  }

  async deleteProject(id: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async getCaptures(projectId: string): Promise<Capture[]> {
    return [];
  }

  async getCaptureById(id: string): Promise<Capture | undefined> {
    return undefined;
  }

  async createCapture(capture: InsertCapture): Promise<Capture> {
    throw new Error("Not implemented");
  }

  async updateCapture(id: string, updates: Partial<InsertCapture>): Promise<Capture> {
    throw new Error("Not implemented");
  }

  async deleteCapture(id: string): Promise<void> {
    throw new Error("Not implemented");
  }

  async getContentItems(filter: {}): Promise<ContentRadar[]> {
    return [];
  }

  async getBriefs(projectId: string): Promise<Brief[]> {
    return [];
  }

  async createBrief(brief: InsertBrief): Promise<Brief> {
    throw new Error("Not implemented");
  }
}

export const storage = new DatabaseStorage();