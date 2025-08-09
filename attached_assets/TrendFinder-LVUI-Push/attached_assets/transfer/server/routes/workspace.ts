import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { projects, signals } from '@shared/schema';
import { isAuthenticated } from '../middleware/auth';
import { eq, count, desc } from 'drizzle-orm';

const router = Router();

// Get workspace statistics
router.get('/stats', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Get total counts
    const [projectCount] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.userId, userId));

    const [signalCount] = await db
      .select({ count: count() })
      .from(signals)
      .where(eq(signals.userId, userId));

    // Get this week's new signals
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [newSignalsThisWeek] = await db
      .select({ count: count() })
      .from(signals)
      .where(eq(signals.userId, userId));

    res.json({
      success: true,
      data: {
        totalProjects: projectCount.count,
        totalCaptures: signalCount.count,
        totalBriefs: 0, // TODO: Add briefs table
        activeProjects: projectCount.count,
        newCapturesThisWeek: Math.floor(signalCount.count / 4), // Estimate
        newBriefsThisMonth: 0,
        analysisScore: 85 // Mock for now
      }
    });
  } catch (error) {
    console.error('Error fetching workspace stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch workspace statistics' 
    });
  }
});

// Get all projects
router.get('/projects', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));

    res.json({
      success: true,
      data: userProjects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch projects' 
    });
  }
});

// Create new project
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional()
});

router.post('/projects', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const validated = createProjectSchema.parse(req.body);

    const [newProject] = await db
      .insert(projects)
      .values({
        ...validated,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    res.json({
      success: true,
      data: newProject
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: error.errors 
      });
    }
    
    console.error('Error creating project:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create project' 
    });
  }
});

export default router;