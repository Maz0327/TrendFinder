// Final Working Storage Implementation - Using DATABASE_URL
import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import type { 
  User, Project, Capture, ContentRadar, Brief,
  InsertUser, InsertProject, InsertCapture, InsertBrief, InsertContentRadar 
} from "@shared/supabase-schema";

export interface IStorage {
  // User Management
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project Management
  getProjects(userId: string): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Capture Management
  getCaptures(projectId: string): Promise<Capture[]>;
  getUserCaptures(userId: string): Promise<Capture[]>;
  getCaptureById(id: string): Promise<Capture | undefined>;
  createCapture(capture: InsertCapture): Promise<Capture>;
  updateCapture(id: string, updates: Partial<InsertCapture>): Promise<Capture>;
  deleteCapture(id: string): Promise<void>;
  
  // Content Radar Management
  getContentItems(filter: { 
    category?: string; 
    platform?: string; 
    timeRange?: string;
    sortBy?: string;
    limit?: number;
  }): Promise<ContentRadar[]>;
  getContentItemById(id: string): Promise<ContentRadar | undefined>;
  createContentItem(item: InsertContentRadar): Promise<ContentRadar>;
  updateContentItem(id: string, updates: Partial<InsertContentRadar>): Promise<ContentRadar>;
  deleteContentItem(id: string): Promise<void>;
  
  // Brief Management
  getBriefs(projectId: string): Promise<Brief[]>;
  createBrief(brief: InsertBrief): Promise<Brief>;
  
  // Stats and Analytics
  getStats(): Promise<any>;
  getRecentScans(limit?: number): Promise<any[]>;
  
  // Legacy support
  getAllSources(): Promise<any[]>;
  getSignals(filter: any): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  private client: Client;

  constructor() {
    // Use DATABASE_URL directly for Neon/Supabase connection
    this.client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    this.client.connect().then(() => {
      console.log("✅ Connected using DATABASE_URL");
      
      // Test with a simple user creation and retrieval
      this.initializeTestUser();
    }).catch(err => {
      console.error("❌ DATABASE_URL connection failed:", err);
    });
  }

  private async initializeTestUser() {
    try {
      // Check if test user already exists
      const existing = await this.client.query(
        'SELECT id FROM users WHERE email = $1',
        ['test@example.com']
      );
      
      if (existing.rows.length === 0) {
        // Create a working test user
        // Generate a fresh hash for 'test123'
        const passwordHash = await bcrypt.hash('test123', 10);
        
        await this.client.query(`
          INSERT INTO users (id, email, username, password, role, onboarding_completed, tour_completed, progress_data, google_tokens, created_at, updated_at)
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        `, [
          'test@example.com',
          'testuser',
          passwordHash, // Fresh hash for "test123"
          'user',
          false,
          false,
          JSON.stringify({}),
          JSON.stringify({})
        ]);
        
        console.log("✅ Created test user: test@example.com / test123");
      } else {
        console.log("✅ Test user already exists: test@example.com / test123");
      }
    } catch (error) {
      console.error("❌ Error initializing test user:", error);
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await this.client.query(
        'SELECT * FROM users WHERE email = $1 LIMIT 1',
        [email]
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
      console.error("❌ Database error:", error);
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

  // Project Management
  async getProjects(userId: string): Promise<Project[]> {
    try {
      const result = await this.client.query(
        'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        briefTemplate: row.brief_template,
        status: row.status,
        client: row.client,
        deadline: row.deadline,
        tags: row.tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Project));
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
      return [];
    }
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    try {
      const result = await this.client.query(
        'SELECT * FROM projects WHERE id = $1 LIMIT 1',
        [id]
      );
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          userId: row.user_id,
          name: row.name,
          description: row.description,
          briefTemplate: row.brief_template,
          status: row.status,
          client: row.client,
          deadline: row.deadline,
          tags: row.tags,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as Project;
      }
      
      return undefined;
    } catch (error) {
      console.error("❌ Error fetching project:", error);
      return undefined;
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    try {
      const result = await this.client.query(`
        INSERT INTO projects (id, user_id, name, description, brief_template, status, client, deadline, tags, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `, [
        project.userId,
        project.name,
        project.description || null,
        project.briefTemplate || 'jimmy-johns',
        project.status || 'active',
        project.client || null,
        project.deadline || null,
        JSON.stringify(project.tags || [])
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        briefTemplate: row.brief_template,
        status: row.status,
        client: row.client,
        deadline: row.deadline,
        tags: row.tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Project;
    } catch (error) {
      console.error("❌ Error creating project:", error);
      throw error;
    }
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updates.name !== undefined) {
        fields.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        fields.push(`description = $${paramCount++}`);
        values.push(updates.description);
      }
      if (updates.briefTemplate !== undefined) {
        fields.push(`brief_template = $${paramCount++}`);
        values.push(updates.briefTemplate);
      }
      if (updates.status !== undefined) {
        fields.push(`status = $${paramCount++}`);
        values.push(updates.status);
      }
      if (updates.client !== undefined) {
        fields.push(`client = $${paramCount++}`);
        values.push(updates.client);
      }
      if (updates.deadline !== undefined) {
        fields.push(`deadline = $${paramCount++}`);
        values.push(updates.deadline);
      }
      if (updates.tags !== undefined) {
        fields.push(`tags = $${paramCount++}`);
        values.push(JSON.stringify(updates.tags));
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await this.client.query(
        `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        description: row.description,
        briefTemplate: row.brief_template,
        status: row.status,
        client: row.client,
        deadline: row.deadline,
        tags: row.tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Project;
    } catch (error) {
      console.error("❌ Error updating project:", error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await this.client.query('DELETE FROM projects WHERE id = $1', [id]);
    } catch (error) {
      console.error("❌ Error deleting project:", error);
      throw error;
    }
  }

  // Capture Management
  async getCaptures(projectId: string): Promise<Capture[]> {
    try {
      const result = await this.client.query(
        'SELECT * FROM captures WHERE project_id = $1 ORDER BY created_at DESC',
        [projectId]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        projectId: row.project_id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        content: row.content,
        url: row.url,
        platform: row.platform,
        screenshotUrl: row.screenshot_url,
        summary: row.summary,
        tags: row.tags,
        metadata: row.metadata,
        truthAnalysis: row.truth_analysis,
        analysisStatus: row.analysis_status,
        googleAnalysis: row.google_analysis,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Capture));
    } catch (error) {
      console.error("❌ Error fetching captures:", error);
      return [];
    }
  }

  async getUserCaptures(userId: string): Promise<Capture[]> {
    try {
      const result = await this.client.query(
        'SELECT * FROM captures WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        projectId: row.project_id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        content: row.content,
        url: row.url,
        platform: row.platform,
        screenshotUrl: row.screenshot_url,
        summary: row.summary,
        tags: row.tags,
        metadata: row.metadata,
        truthAnalysis: row.truth_analysis,
        analysisStatus: row.analysis_status,
        googleAnalysis: row.google_analysis,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Capture));
    } catch (error) {
      console.error("❌ Error fetching user captures:", error);
      return [];
    }
  }

  async getCaptureById(id: string): Promise<Capture | undefined> {
    try {
      const result = await this.client.query(
        'SELECT * FROM captures WHERE id = $1 LIMIT 1',
        [id]
      );
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          projectId: row.project_id,
          userId: row.user_id,
          type: row.type,
          title: row.title,
          content: row.content,
          url: row.url,
          platform: row.platform,
          screenshotUrl: row.screenshot_url,
          summary: row.summary,
          tags: row.tags,
          metadata: row.metadata,
          truthAnalysis: row.truth_analysis,
          analysisStatus: row.analysis_status,
          googleAnalysis: row.google_analysis,
          status: row.status,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as Capture;
      }
      
      return undefined;
    } catch (error) {
      console.error("❌ Error fetching capture:", error);
      return undefined;
    }
  }

  async createCapture(capture: InsertCapture): Promise<Capture> {
    try {
      const result = await this.client.query(`
        INSERT INTO captures (
          id, project_id, user_id, type, title, content, url, platform,
          screenshot_url, summary, tags, metadata, truth_analysis,
          analysis_status, google_analysis, status, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()
        )
        RETURNING *
      `, [
        capture.projectId,
        capture.userId,
        capture.type,
        capture.title || null,
        capture.content || null,
        capture.url || null,
        capture.platform || null,
        capture.screenshotUrl || null,
        capture.summary || null,
        JSON.stringify(capture.tags || []),
        JSON.stringify(capture.metadata || {}),
        capture.truthAnalysis ? JSON.stringify(capture.truthAnalysis) : null,
        capture.analysisStatus || 'pending',
        capture.googleAnalysis ? JSON.stringify(capture.googleAnalysis) : null,
        capture.status || 'active'
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        projectId: row.project_id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        content: row.content,
        url: row.url,
        platform: row.platform,
        screenshotUrl: row.screenshot_url,
        summary: row.summary,
        tags: row.tags,
        metadata: row.metadata,
        truthAnalysis: row.truth_analysis,
        analysisStatus: row.analysis_status,
        googleAnalysis: row.google_analysis,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Capture;
    } catch (error) {
      console.error("❌ Error creating capture:", error);
      throw error;
    }
  }

  async updateCapture(id: string, updates: Partial<InsertCapture>): Promise<Capture> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      // Map frontend field names to database columns
      const fieldMap: Record<string, string> = {
        'title': 'title',
        'content': 'content',
        'url': 'url',
        'platform': 'platform',
        'screenshotUrl': 'screenshot_url',
        'summary': 'summary',
        'tags': 'tags',
        'metadata': 'metadata',
        'truthAnalysis': 'truth_analysis',
        'analysisStatus': 'analysis_status',
        'googleAnalysis': 'google_analysis',
        'status': 'status'
      };

      // Handle custom fields from frontend
      if ('userNote' in updates) {
        const metadata = (updates.metadata as any) || {};
        updates.metadata = { ...metadata, userNote: (updates as any).userNote };
        delete (updates as any).userNote;
      }

      if ('customCopy' in updates) {
        const metadata = (updates.metadata as any) || {};
        updates.metadata = { ...metadata, customCopy: (updates as any).customCopy };
        delete (updates as any).customCopy;
      }

      // Build update query
      for (const [key, value] of Object.entries(updates)) {
        if (fieldMap[key]) {
          fields.push(`${fieldMap[key]} = $${paramCount++}`);
          if (key === 'tags' || key === 'metadata' || key === 'truthAnalysis' || key === 'googleAnalysis') {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await this.client.query(
        `UPDATE captures SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      const row = result.rows[0];
      return {
        id: row.id,
        projectId: row.project_id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        content: row.content,
        url: row.url,
        platform: row.platform,
        screenshotUrl: row.screenshot_url,
        summary: row.summary,
        tags: row.tags,
        metadata: row.metadata,
        truthAnalysis: row.truth_analysis,
        analysisStatus: row.analysis_status,
        googleAnalysis: row.google_analysis,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Capture;
    } catch (error) {
      console.error("❌ Error updating capture:", error);
      throw error;
    }
  }

  async deleteCapture(id: string): Promise<void> {
    try {
      await this.client.query('DELETE FROM captures WHERE id = $1', [id]);
    } catch (error) {
      console.error("❌ Error deleting capture:", error);
      throw error;
    }
  }

  // Content Radar Management
  async getContentItems(filter: { 
    category?: string; 
    platform?: string; 
    timeRange?: string;
    sortBy?: string;
    limit?: number;
  }): Promise<ContentRadar[]> {
    try {
      let query = 'SELECT * FROM content_radar WHERE is_active = true';
      const params: any[] = [];
      let paramCount = 1;

      if (filter.category && filter.category !== 'all') {
        query += ` AND category = $${paramCount++}`;
        params.push(filter.category);
      }

      if (filter.platform && filter.platform !== 'all') {
        query += ` AND platform = $${paramCount++}`;
        params.push(filter.platform);
      }

      if (filter.timeRange) {
        const now = new Date();
        let startDate = new Date();
        
        switch (filter.timeRange) {
          case '1h':
            startDate.setHours(now.getHours() - 1);
            break;
          case '24h':
            startDate.setDate(now.getDate() - 1);
            break;
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
        }
        
        query += ` AND created_at >= $${paramCount++}`;
        params.push(startDate.toISOString());
      }

      // Sorting
      switch (filter.sortBy) {
        case 'viral':
          query += ' ORDER BY viral_score DESC';
          break;
        case 'engagement':
          query += ' ORDER BY engagement DESC';
          break;
        case 'growth':
          query += ' ORDER BY growth_rate DESC';
          break;
        default:
          query += ' ORDER BY created_at DESC';
      }

      // Limit
      query += ` LIMIT $${paramCount++}`;
      params.push(filter.limit || 50);

      const result = await this.client.query(query, params);
      
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        url: row.url,
        content: row.content,
        summary: row.summary,
        hook1: row.hook1,
        hook2: row.hook2,
        category: row.category,
        platform: row.platform,
        viralScore: row.viral_score,
        engagement: row.engagement,
        growthRate: row.growth_rate,
        metadata: row.metadata,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as ContentRadar));
    } catch (error) {
      console.error("❌ Error fetching content items:", error);
      return [];
    }
  }

  async getContentItemById(id: string): Promise<ContentRadar | undefined> {
    try {
      const result = await this.client.query(
        'SELECT * FROM content_radar WHERE id = $1 LIMIT 1',
        [id]
      );
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          title: row.title,
          url: row.url,
          content: row.content,
          summary: row.summary,
          hook1: row.hook1,
          hook2: row.hook2,
          category: row.category,
          platform: row.platform,
          viralScore: row.viral_score,
          engagement: row.engagement,
          growthRate: row.growth_rate,
          metadata: row.metadata,
          isActive: row.is_active,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        } as ContentRadar;
      }
      
      return undefined;
    } catch (error) {
      console.error("❌ Error fetching content item:", error);
      return undefined;
    }
  }

  async createContentItem(item: InsertContentRadar): Promise<ContentRadar> {
    try {
      const result = await this.client.query(`
        INSERT INTO content_radar (
          id, title, url, content, summary, hook1, hook2,
          category, platform, viral_score, engagement, growth_rate,
          metadata, is_active, created_at, updated_at
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
        )
        RETURNING *
      `, [
        item.title,
        item.url,
        item.content || null,
        item.summary || null,
        item.hook1 || null,
        item.hook2 || null,
        item.category,
        item.platform,
        item.viralScore || 0,
        item.engagement || 0,
        item.growthRate || 0,
        JSON.stringify(item.metadata || {}),
        item.isActive !== false
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title,
        url: row.url,
        content: row.content,
        summary: row.summary,
        hook1: row.hook1,
        hook2: row.hook2,
        category: row.category,
        platform: row.platform,
        viralScore: row.viral_score,
        engagement: row.engagement,
        growthRate: row.growth_rate,
        metadata: row.metadata,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as ContentRadar;
    } catch (error) {
      console.error("❌ Error creating content item:", error);
      throw error;
    }
  }

  async updateContentItem(id: string, updates: Partial<InsertContentRadar>): Promise<ContentRadar> {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      const fieldMap: Record<string, string> = {
        'title': 'title',
        'url': 'url',
        'content': 'content',
        'summary': 'summary',
        'hook1': 'hook1',
        'hook2': 'hook2',
        'category': 'category',
        'platform': 'platform',
        'viralScore': 'viral_score',
        'engagement': 'engagement',
        'growthRate': 'growth_rate',
        'metadata': 'metadata',
        'isActive': 'is_active'
      };

      for (const [key, value] of Object.entries(updates)) {
        if (fieldMap[key]) {
          fields.push(`${fieldMap[key]} = $${paramCount++}`);
          if (key === 'metadata') {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await this.client.query(
        `UPDATE content_radar SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title,
        url: row.url,
        content: row.content,
        summary: row.summary,
        hook1: row.hook1,
        hook2: row.hook2,
        category: row.category,
        platform: row.platform,
        viralScore: row.viral_score,
        engagement: row.engagement,
        growthRate: row.growth_rate,
        metadata: row.metadata,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as ContentRadar;
    } catch (error) {
      console.error("❌ Error updating content item:", error);
      throw error;
    }
  }

  async deleteContentItem(id: string): Promise<void> {
    try {
      await this.client.query('DELETE FROM content_radar WHERE id = $1', [id]);
    } catch (error) {
      console.error("❌ Error deleting content item:", error);
      throw error;
    }
  }

  // Brief Management
  async getBriefs(projectId: string): Promise<Brief[]> {
    try {
      const result = await this.client.query(
        'SELECT * FROM briefs WHERE project_id = $1 ORDER BY created_at DESC',
        [projectId]
      );
      
      return result.rows.map(row => ({
        id: row.id,
        projectId: row.project_id,
        title: row.title,
        templateType: row.template_type,
        description: row.description,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Brief));
    } catch (error) {
      console.error("❌ Error fetching briefs:", error);
      return [];
    }
  }

  async createBrief(brief: InsertBrief): Promise<Brief> {
    try {
      const result = await this.client.query(`
        INSERT INTO briefs (id, project_id, title, template_type, description, status, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `, [
        brief.projectId,
        brief.title,
        brief.templateType || 'jimmy-johns',
        brief.description || null,
        brief.status || 'draft'
      ]);
      
      const row = result.rows[0];
      return {
        id: row.id,
        projectId: row.project_id,
        title: row.title,
        templateType: row.template_type,
        description: row.description,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as Brief;
    } catch (error) {
      console.error("❌ Error creating brief:", error);
      throw error;
    }
  }

  // Stats and Analytics
  async getStats(): Promise<any> {
    try {
      const [contentCount, recentScans, platformStats] = await Promise.all([
        this.client.query('SELECT COUNT(*) FROM content_radar WHERE is_active = true'),
        this.client.query('SELECT * FROM scan_history ORDER BY created_at DESC LIMIT 10'),
        this.client.query(`
          SELECT platform, COUNT(*) as count 
          FROM content_radar 
          WHERE is_active = true 
          GROUP BY platform
        `)
      ]);

      return {
        totalContent: parseInt(contentCount.rows[0].count),
        recentScans: recentScans.rows,
        platformBreakdown: platformStats.rows
      };
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
      return { totalContent: 0, recentScans: [], platformBreakdown: [] };
    }
  }

  // Scan History
  async getRecentScans(limit: number = 10): Promise<any[]> {
    try {
      const result = await this.client.query(
        'SELECT * FROM scan_history ORDER BY created_at DESC LIMIT $1',
        [limit]
      );
      return result.rows;
    } catch (error) {
      console.error("❌ Error fetching recent scans:", error);
      return [];
    }
  }

  // Legacy support methods
  async getAllSources(): Promise<any[]> {
    return [];
  }

  async getSignals(filter: any): Promise<any[]> {
    // Map legacy signals to content radar
    return this.getContentItems(filter);
  }
}

export const storage = new DatabaseStorage();