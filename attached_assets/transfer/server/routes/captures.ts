import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { captures } from '../../shared/supabase-schema';
import { isAuthenticated } from '../middleware/auth';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Get all captures/signals
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const userSignals = await db
      .select()
      .from(captures)
      .where(eq(captures.userId, userId))
      .orderBy(desc(captures.createdAt));

    res.json({
      success: true,
      data: userSignals
    });
  } catch (error) {
    console.error('Error fetching captures:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch captures' 
    });
  }
});

// Get recent captures
router.get('/recent', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const recentSignals = await db
      .select()
      .from(captures)
      .where(eq(captures.userId, userId))
      .orderBy(desc(captures.createdAt))
      .limit(10);

    res.json({
      success: true,
      data: recentSignals
    });
  } catch (error) {
    console.error('Error fetching recent captures:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch recent captures' 
    });
  }
});

// Create new capture
const createCaptureSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  sourceUrl: z.string().url().optional().nullable(),
  projectId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable()
});

router.post('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const validated = createCaptureSchema.parse(req.body);

    const [newCapture] = await db
      .insert(captures)
      .values({
        type: 'manual',
        userId,
        status: 'capture',
        sourceUrl: validated.sourceUrl || '',
        content: validated.content || '',
        platform: 'manual',
        projectId: validated.projectId,
        isDraft: false,
        capturedAt: new Date()
      })
      .returning();

    res.json({
      success: true,
      data: newCapture
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: error.errors 
      });
    }
    
    console.error('Error creating capture:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create capture' 
    });
  }
});

export default router;