// Direct PostgreSQL connection without Drizzle ORM
import { Client } from 'pg';
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
  private client: Client;

  constructor() {
    this.client = new Client({
      host: process.env.PGHOST,
      port: parseInt(process.env.PGPORT || '5432'),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: { rejectUnauthorized: false }
    });
    
    this.client.connect().then(() => {
      console.log("✅ Direct PostgreSQL connection established");
      // Test connection immediately
      this.client.query('SELECT COUNT(*) as count FROM users').then(result => {
        console.log("✅ Database test query successful, user count:", result.rows[0].count);
      }).catch(err => {
        console.error("❌ Database test query failed:", err);
      });
    }).catch(err => {
      console.error("❌ PostgreSQL connection failed:", err);
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      console.log("🔍 Direct PostgreSQL lookup for email:", email);
      
      const result = await this.client.query(
        'SELECT * FROM users WHERE email = $1 LIMIT 1',
        [email]
      );
      
      console.log("🔍 Direct query result:", result.rows.length, "rows");
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        console.log("🔍 Found user:", row.email);
        
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
      console.error("❌ Direct PostgreSQL error:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await this.client.query(
        'SELECT * FROM users WHERE username = $1 LIMIT 1',
        [username]
      );
      
      if (result.rows.length > 0) {
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
      const result = await this.client.query(
        'SELECT * FROM users WHERE id = $1 LIMIT 1',
        [id]
      );
      
      if (result.rows.length > 0) {
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
      const result = await this.client.query(`
        INSERT INTO users (id, email, username, password, role, onboarding_completed, tour_completed, progress_data, google_tokens, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `, [
        insertUser.email,
        insertUser.username,
        insertUser.password,
        insertUser.role || 'user',
        insertUser.onboardingCompleted || false,
        insertUser.tourCompleted || false,
        JSON.stringify(insertUser.progressData || {}),
        JSON.stringify(insertUser.googleTokens || {})
      ]);
      
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

  // Placeholder implementations
  async getProjects(userId: string): Promise<Project[]> { return []; }
  async getProjectById(id: string): Promise<Project | undefined> { return undefined; }
  async createProject(project: InsertProject): Promise<Project> { throw new Error("Not implemented"); }
  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> { throw new Error("Not implemented"); }
  async deleteProject(id: string): Promise<void> { throw new Error("Not implemented"); }
  async getCaptures(projectId: string): Promise<Capture[]> { return []; }
  async getCaptureById(id: string): Promise<Capture | undefined> { return undefined; }
  async createCapture(capture: InsertCapture): Promise<Capture> { throw new Error("Not implemented"); }
  async updateCapture(id: string, updates: Partial<InsertCapture>): Promise<Capture> { throw new Error("Not implemented"); }
  async deleteCapture(id: string): Promise<void> { throw new Error("Not implemented"); }
  async getContentItems(filter: {}): Promise<ContentRadar[]> { return []; }
  async getBriefs(projectId: string): Promise<Brief[]> { return []; }
  async createBrief(brief: InsertBrief): Promise<Brief> { throw new Error("Not implemented"); }
}

export const storage = new DatabaseStorage();