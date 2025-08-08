// New storage implementation using the 7-table normalized schema
// Replaces the old 72-table storage.ts

import { users, projects, captures, briefs, contentRadar, briefCaptures, analysisResults } from "@shared/schema";
import type { User, InsertUser, Project, InsertProject, Capture, InsertCapture, Brief, InsertBrief, ContentRadar, InsertContentRadar, BriefCapture, InsertBriefCapture, AnalysisResult, InsertAnalysisResult } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Projects  
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByUserId(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;
  
  // Captures (formerly signals)
  getCapture(id: string): Promise<Capture | undefined>;
  getCapturesByProjectId(projectId: string): Promise<Capture[]>;
  getCapturesByUserId(userId: string): Promise<Capture[]>;
  createCapture(capture: InsertCapture): Promise<Capture>;
  updateCapture(id: string, updates: Partial<InsertCapture>): Promise<Capture | undefined>;
  deleteCapture(id: string): Promise<void>;
  
  // Briefs
  getBrief(id: string): Promise<Brief | undefined>;
  getBriefsByProjectId(projectId: string): Promise<Brief[]>;
  createBrief(brief: InsertBrief): Promise<Brief>;
  updateBrief(id: string, updates: Partial<InsertBrief>): Promise<Brief | undefined>;
  deleteBrief(id: string): Promise<void>;
  
  // Content Radar
  getContentRadarItem(id: string): Promise<ContentRadar | undefined>;
  getContentRadarByUserId(userId: string): Promise<ContentRadar[]>;
  createContentRadarItem(item: InsertContentRadar): Promise<ContentRadar>;
  updateContentRadarItem(id: string, updates: Partial<InsertContentRadar>): Promise<ContentRadar | undefined>;
  deleteContentRadarItem(id: string): Promise<void>;
  
  // Brief-Capture relationships
  linkBriefToCapture(briefId: string, captureId: string): Promise<BriefCapture>;
  getCapturesForBrief(briefId: string): Promise<Capture[]>;
  getBriefsForCapture(captureId: string): Promise<Brief[]>;
  
  // Analysis Results
  getAnalysisResult(id: string): Promise<AnalysisResult | undefined>;
  getAnalysisResultByCaptureId(captureId: string): Promise<AnalysisResult | undefined>;
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  updateAnalysisResult(id: string, updates: Partial<InsertAnalysisResult>): Promise<AnalysisResult | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  // Projects
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    return await db.select().from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db.insert(projects).values(project).returning();
    return newProject;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db.update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }
  
  // Captures
  async getCapture(id: string): Promise<Capture | undefined> {
    const [capture] = await db.select().from(captures).where(eq(captures.id, id));
    return capture;
  }

  async getCapturesByProjectId(projectId: string): Promise<Capture[]> {
    return await db.select().from(captures)
      .where(eq(captures.projectId, projectId))
      .orderBy(desc(captures.createdAt));
  }

  async getCapturesByUserId(userId: string): Promise<Capture[]> {
    return await db.select().from(captures)
      .where(eq(captures.userId, userId))
      .orderBy(desc(captures.createdAt));
  }

  async createCapture(capture: InsertCapture): Promise<Capture> {
    const [newCapture] = await db.insert(captures).values([capture]).returning();
    return newCapture;
  }

  async updateCapture(id: string, updates: Partial<InsertCapture>): Promise<Capture | undefined> {
    const [updated] = await db.update(captures)
      .set(updates)
      .where(eq(captures.id, id))
      .returning();
    return updated;
  }

  async deleteCapture(id: string): Promise<void> {
    await db.delete(captures).where(eq(captures.id, id));
  }
  
  // Briefs
  async getBrief(id: string): Promise<Brief | undefined> {
    const [brief] = await db.select().from(briefs).where(eq(briefs.id, id));
    return brief;
  }

  async getBriefsByProjectId(projectId: string): Promise<Brief[]> {
    return await db.select().from(briefs)
      .where(eq(briefs.projectId, projectId))
      .orderBy(desc(briefs.createdAt));
  }

  async createBrief(brief: InsertBrief): Promise<Brief> {
    const [newBrief] = await db.insert(briefs).values(brief).returning();
    return newBrief;
  }

  async updateBrief(id: string, updates: Partial<InsertBrief>): Promise<Brief | undefined> {
    const [updated] = await db.update(briefs)
      .set(updates)
      .where(eq(briefs.id, id))
      .returning();
    return updated;
  }

  async deleteBrief(id: string): Promise<void> {
    await db.delete(briefs).where(eq(briefs.id, id));
  }
  
  // Content Radar
  async getContentRadarItem(id: string): Promise<ContentRadar | undefined> {
    const [item] = await db.select().from(contentRadar).where(eq(contentRadar.id, id));
    return item;
  }

  async getContentRadarByUserId(userId: string): Promise<ContentRadar[]> {
    // Note: contentRadar table doesn't have userId, returning all items
    // This should be filtered by category or platform instead
    return await db.select().from(contentRadar)
      .orderBy(desc(contentRadar.createdAt));
  }

  async createContentRadarItem(item: InsertContentRadar): Promise<ContentRadar> {
    const [newItem] = await db.insert(contentRadar).values(item).returning();
    return newItem;
  }

  async updateContentRadarItem(id: string, updates: Partial<InsertContentRadar>): Promise<ContentRadar | undefined> {
    const [updated] = await db.update(contentRadar)
      .set(updates)
      .where(eq(contentRadar.id, id))
      .returning();
    return updated;
  }

  async deleteContentRadarItem(id: string): Promise<void> {
    await db.delete(contentRadar).where(eq(contentRadar.id, id));
  }
  
  // Brief-Capture relationships
  async linkBriefToCapture(briefId: string, captureId: string): Promise<BriefCapture> {
    const [link] = await db.insert(briefCaptures)
      .values([{ briefId, captureId, section: 'general' }])
      .returning();
    return link;
  }

  async getCapturesForBrief(briefId: string): Promise<Capture[]> {
    const result = await db.select({ capture: captures })
      .from(captures)
      .innerJoin(briefCaptures, eq(briefCaptures.captureId, captures.id))
      .where(eq(briefCaptures.briefId, briefId));
    return result.map(r => r.capture);
  }

  async getBriefsForCapture(captureId: string): Promise<Brief[]> {
    const result = await db.select({ brief: briefs })
      .from(briefs)
      .innerJoin(briefCaptures, eq(briefCaptures.briefId, briefs.id))
      .where(eq(briefCaptures.captureId, captureId));
    return result.map(r => r.brief);
  }
  
  // Analysis Results
  async getAnalysisResult(id: string): Promise<AnalysisResult | undefined> {
    const [result] = await db.select().from(analysisResults).where(eq(analysisResults.id, id));
    return result;
  }

  async getAnalysisResultByCaptureId(captureId: string): Promise<AnalysisResult | undefined> {
    const [result] = await db.select().from(analysisResults)
      .where(eq(analysisResults.captureId, captureId))
      .orderBy(desc(analysisResults.createdAt))
      .limit(1);
    return result;
  }

  async createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult> {
    const [newResult] = await db.insert(analysisResults).values(result).returning();
    return newResult;
  }

  async updateAnalysisResult(id: string, updates: Partial<InsertAnalysisResult>): Promise<AnalysisResult | undefined> {
    const [updated] = await db.update(analysisResults)
      .set(updates)
      .where(eq(analysisResults.id, id))
      .returning();
    return updated;
  }
}

// Export singleton instance
export const storage = new DatabaseStorage();