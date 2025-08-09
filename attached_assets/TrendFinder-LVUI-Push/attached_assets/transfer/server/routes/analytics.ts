import { Router } from 'express';
import { z } from 'zod';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// Get analytics insights
const insightsSchema = z.object({
  timeframe: z.enum(['7d', '30d', '90d', '1y']).optional().default('7d'),
  projectId: z.string().optional()
});

router.get('/insights', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const validated = insightsSchema.parse(req.query);

    // TODO: Implement real analytics
    // For now, return mock data
    const mockAnalytics = {
      contentVelocity: 12,
      signalQuality: 87,
      briefRate: 3,
      analysisDepth: 8.2,
      totalCaptures: 156,
      avgProcessingTime: 2.3,
      insightAccuracy: 92,
      trendingTopics: [
        { topic: 'AI Technology', mentions: 24, growth: '+45%' },
        { topic: 'Social Commerce', mentions: 18, growth: '+32%' },
        { topic: 'Sustainability', mentions: 15, growth: '+28%' },
        { topic: 'Remote Work', mentions: 12, growth: '+15%' },
        { topic: 'Digital Health', mentions: 9, growth: '+22%' }
      ],
      contentSources: [
        { source: 'Social Media', percentage: 45, count: 120 },
        { source: 'News Articles', percentage: 30, count: 80 },
        { source: 'Blog Posts', percentage: 15, count: 40 },
        { source: 'Videos', percentage: 10, count: 25 }
      ]
    };

    res.json({
      success: true,
      data: mockAnalytics
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error',
        errors: error.errors 
      });
    }
    
    console.error('Error fetching analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics' 
    });
  }
});

export default router;