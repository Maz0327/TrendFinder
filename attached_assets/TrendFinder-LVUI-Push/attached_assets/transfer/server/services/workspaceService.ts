// Workspace Service - Project and signal management for 2025 rebuild
// Replaces fragmented project/signal services with unified workspace

import { db } from '../db';
import { projects, captures, briefs, briefCaptures } from '../../shared/supabase-schema';
import { eq, desc, and, or, gte } from 'drizzle-orm';
import type { InsertProject, InsertCapture, Project, Capture } from '../../shared/supabase-schema';

interface WorkspaceStats {
  totalProjects: number;
  activeCaptures: number;
  signalsPromoted: number;
  briefsGenerated: number;
  recentActivity: {
    captures: number;
    signals: number;
    briefs: number;
  };
}

export class WorkspaceService {
  private static instance: WorkspaceService;

  static getInstance(): WorkspaceService {
    if (!WorkspaceService.instance) {
      WorkspaceService.instance = new WorkspaceService();
    }
    return WorkspaceService.instance;
  }

  // Project Management
  async createProject(userId: string, data: Omit<InsertProject, 'userId'>): Promise<Project> {
    try {
      const [project] = await db
        .insert(projects)
        .values({
          ...data,
          userId,
        })
        .returning();

      return project;
    } catch (error) {
      console.error('Create project error:', error);
      throw new Error('Failed to create project');
    }
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    try {
      return await db
        .select()
        .from(projects)
        .where(eq(projects.userId, userId))
        .orderBy(desc(projects.createdAt));
    } catch (error) {
      console.error('Get user projects error:', error);
      throw new Error('Failed to fetch projects');
    }
  }

  // Capture Management (Signals)
  async createCapture(data: InsertCapture): Promise<Capture> {
    try {
      const [capture] = await db
        .insert(captures)
        .values([data])
        .returning();

      return capture;
    } catch (error) {
      console.error('Create capture error:', error);
      throw new Error('Failed to create capture');
    }
  }

  async promoteCapture(captureId: string, newStatus: 'potential_signal' | 'signal' | 'validated_signal', reason?: string): Promise<Capture> {
    try {
      const [updated] = await db
        .update(captures)
        .set({
          status: newStatus,
          promotionReason: reason,
          updatedAt: new Date(),
        })
        .where(eq(captures.id, captureId))
        .returning();

      return updated;
    } catch (error) {
      console.error('Promote capture error:', error);
      throw new Error('Failed to promote capture');
    }
  }

  async getProjectCaptures(projectId: string, status?: string): Promise<Capture[]> {
    try {
      const conditions = [eq(captures.projectId, projectId)];
      if (status) {
        conditions.push(eq(captures.status, status));
      }

      return await db
        .select()
        .from(captures)
        .where(and(...conditions))
        .orderBy(desc(captures.createdAt));
    } catch (error) {
      console.error('Get project captures error:', error);
      throw new Error('Failed to fetch captures');
    }
  }

  // Batch operations for UI workspace
  async batchAssignToBrief(captureIds: string[], briefId: string, section: string): Promise<number> {
    try {
      const values = captureIds.map((captureId, index) => ({
        briefId,
        captureId,
        section,
        orderIndex: index,
      }));

      const result = await db
        .insert(briefCaptures)
        .values(values)
        .returning();

      return result.length;
    } catch (error) {
      console.error('Batch assign to brief error:', error);
      throw new Error('Failed to assign captures to brief');
    }
  }

  // Workspace Stats
  async getWorkspaceStats(userId: string): Promise<WorkspaceStats> {
    try {
      // Get counts
      const projectCount = await db
        .select({ count: projects.id })
        .from(projects)
        .where(eq(projects.userId, userId));

      const captureCount = await db
        .select({ count: captures.id })
        .from(captures)
        .where(eq(captures.userId, userId));

      const signalCount = await db
        .select({ count: captures.id })
        .from(captures)
        .where(
          and(
            eq(captures.userId, userId),
            or(
              eq(captures.status, 'signal'),
              eq(captures.status, 'validated_signal')
            )
          )
        );

      const briefCount = await db
        .select({ count: briefs.id })
        .from(briefs)
        .where(eq(briefs.userId, userId));

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentCaptures = await db
        .select({ count: captures.id })
        .from(captures)
        .where(
          and(
            eq(captures.userId, userId),
            gte(captures.createdAt, sevenDaysAgo)
          )
        );

      return {
        totalProjects: projectCount.length,
        activeCaptures: captureCount.length,
        signalsPromoted: signalCount.length,
        briefsGenerated: briefCount.length,
        recentActivity: {
          captures: recentCaptures.length,
          signals: 0, // Will be calculated based on promotions
          briefs: 0, // Will be calculated based on recent briefs
        },
      };
    } catch (error) {
      console.error('Get workspace stats error:', error);
      throw new Error('Failed to fetch workspace statistics');
    }
  }
}

export const workspaceService = WorkspaceService.getInstance();