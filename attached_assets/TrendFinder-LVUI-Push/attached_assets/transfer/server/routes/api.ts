// Consolidated API Routes - 2025 Rebuild
// Replaces 19 legacy route files with clean, organized structure

import { Router } from 'express';
import { authService } from '../services/authService';
import { workspaceService } from '../services/workspaceService';
import { aiAnalysisService } from '../services/aiAnalysisService';
import { briefGenerationService } from '../services/briefGenerationService';
import { brightDataService } from '../services/brightDataService';
import { googleIntegrationService } from '../services/googleIntegrationService';
import { systemMonitor } from '../services/system-monitor';
import { debugLogger } from '../services/debug-logger';
import { storage } from '../storage';

// Import new route modules
import workspaceRoutes from './workspace';
import capturesRoutes from './captures';
import briefsRoutes from './briefs';
import analyticsRoutes from './analytics';

const router = Router();

// Mount new route modules
router.use('/workspace', workspaceRoutes);
router.use('/captures', capturesRoutes);
router.use('/briefs', briefsRoutes);
router.use('/analytics', analyticsRoutes);

// Middleware to check authentication
const requireAuth = async (req: any, res: any, next: any) => {
  const { isValid, userId } = await authService.validateSession(req);
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  req.userId = userId;
  next();
};

// ========== AUTH ROUTES ==========
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    if (result.success && result.user) {
      req.session.userId = result.user.id;
      req.session.userEmail = result.user.email;
      req.session.userRole = result.user.role;
      
      // Force session save to ensure it persists
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            debugLogger.error('Session save error', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    
    res.json(result);
  } catch (error: any) {
    debugLogger.error('Login error', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.register(email, password);
    
    if (result.success && result.user) {
      req.session.userId = result.user.id;
      req.session.userEmail = result.user.email;
      req.session.userRole = result.user.role;
      
      // Force session save to ensure it persists
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            debugLogger.error('Session save error', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    
    res.json(result);
  } catch (error: any) {
    debugLogger.error('Registration error', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.get('/auth/me', async (req, res) => {
  try {
    const { isValid, userId } = await authService.validateSession(req);
    if (!isValid || !userId) {
      return res.json({ success: true, user: null });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.json({ success: true, user: null });
    }
    
    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email,
        role: user.role || 'user'
      } 
    });
  } catch (error: any) {
    debugLogger.error('Get current user error', error);
    res.status(500).json({ success: false, message: 'Failed to get current user' });
  }
});

router.post('/auth/logout', requireAuth, async (req, res) => {
  try {
    await authService.logout(req);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    debugLogger.error('Logout error', error);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

// ========== WORKSPACE ROUTES ==========
router.get('/workspace/stats', requireAuth, async (req: any, res) => {
  try {
    const stats = await workspaceService.getWorkspaceStats(req.userId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    debugLogger.error('Workspace stats error', error);
    res.status(500).json({ success: false, message: 'Failed to fetch workspace stats' });
  }
});

router.get('/workspace/projects', requireAuth, async (req: any, res) => {
  try {
    const projects = await workspaceService.getUserProjects(req.userId);
    res.json({ success: true, data: projects });
  } catch (error: any) {
    debugLogger.error('Get projects error', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

router.post('/workspace/projects', requireAuth, async (req: any, res) => {
  try {
    const project = await workspaceService.createProject(req.userId, req.body);
    res.json({ success: true, data: project });
  } catch (error: any) {
    debugLogger.error('Create project error', error);
    res.status(500).json({ success: false, message: 'Failed to create project' });
  }
});

// ========== CAPTURE/SIGNAL ROUTES ==========
router.post('/captures', requireAuth, async (req: any, res) => {
  try {
    const capture = await workspaceService.createCapture({
      ...req.body,
      userId: req.userId,
    });
    res.json({ success: true, data: capture });
  } catch (error: any) {
    debugLogger.error('Create capture error', error);
    res.status(500).json({ success: false, message: 'Failed to create capture' });
  }
});

router.get('/captures/:projectId', requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const captures = await workspaceService.getProjectCaptures(
      req.params.projectId,
      status as string
    );
    res.json({ success: true, data: captures });
  } catch (error: any) {
    debugLogger.error('Get captures error', error);
    res.status(500).json({ success: false, message: 'Failed to fetch captures' });
  }
});

router.post('/captures/:id/promote', requireAuth, async (req, res) => {
  try {
    const { newStatus, reason } = req.body;
    const updated = await workspaceService.promoteCapture(
      req.params.id,
      newStatus,
      reason
    );
    res.json({ success: true, data: updated });
  } catch (error: any) {
    debugLogger.error('Promote capture error', error);
    res.status(500).json({ success: false, message: 'Failed to promote capture' });
  }
});

// ========== AI ANALYSIS ROUTES ==========
router.post('/analyze/truth', requireAuth, async (req, res) => {
  try {
    const { content, mode = 'quick' } = req.body;
    const analysis = await aiAnalysisService.analyzeTruth(content, {
      mode,
      contentType: 'text',
      truthAnalysisFramework: true,
    });
    res.json({ success: true, data: analysis });
  } catch (error: any) {
    debugLogger.error('Truth analysis error', error);
    res.status(500).json({ success: false, message: 'Analysis failed' });
  }
});

router.post('/analyze/visual', requireAuth, async (req, res) => {
  try {
    const { imageData } = req.body;
    const analysis = await aiAnalysisService.analyzeVisual(imageData, {
      mode: 'deep',
      contentType: 'image',
      truthAnalysisFramework: false,
    });
    res.json({ success: true, data: analysis });
  } catch (error: any) {
    debugLogger.error('Visual analysis error', error);
    res.status(500).json({ success: false, message: 'Visual analysis failed' });
  }
});

// ========== BRIEF GENERATION ROUTES ==========
router.post('/briefs/generate', requireAuth, async (req: any, res) => {
  try {
    const { projectId, captureIds } = req.body;
    const brief = await briefGenerationService.generateBrief(
      projectId,
      req.userId,
      captureIds
    );
    res.json({ success: true, data: brief });
  } catch (error: any) {
    debugLogger.error('Brief generation error', error);
    res.status(500).json({ success: false, message: 'Failed to generate brief' });
  }
});

router.post('/briefs/:id/export-slides', requireAuth, async (req, res) => {
  try {
    const slidesUrl = await briefGenerationService.exportToGoogleSlides(req.params.id);
    res.json({ success: true, data: { url: slidesUrl } });
  } catch (error: any) {
    debugLogger.error('Export to slides error', error);
    res.status(500).json({ success: false, message: 'Failed to export to slides' });
  }
});

// ========== SCRAPING ROUTES ==========
router.post('/scrape', requireAuth, async (req, res) => {
  try {
    const { url, platform } = req.body;
    const result = await brightDataService.scrapeContent(url, platform);
    res.json({ success: true, data: result });
  } catch (error: any) {
    debugLogger.error('Scraping error', error);
    res.status(500).json({ success: false, message: 'Scraping failed' });
  }
});

// ========== SYSTEM ROUTES ==========
router.get('/system/health', (req, res) => {
  const stats = systemMonitor.getStats();
  res.json({
    success: true,
    data: {
      ...stats,
      services: {
        ai: aiAnalysisService.getStatus(),
        google: googleIntegrationService.getStatus(),
        brightData: brightDataService.getStatus(),
      },
    },
  });
});

router.get('/system/status', (req, res) => {
  res.json({
    success: true,
    message: '2025 Rebuild - Phase 1 Complete',
    version: '2.0.0',
    phase: 'foundation-architecture',
    services: {
      auth: true,
      ai: aiAnalysisService.getStatus().initialized,
      google: googleIntegrationService.getStatus().initialized,
      scraping: brightDataService.getStatus().initialized,
    },
  });
});

export default router;