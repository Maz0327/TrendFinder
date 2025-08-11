import { Router } from 'express';
import { z } from 'zod';
import { createGoogleSlidesService } from '../services/google-slides-service';
import { createGoogleDocsService } from '../services/google-docs-service';
import { createGoogleSheetsService } from '../services/google-sheets-service';
import { createGoogleDriveService } from '../services/google-drive-service';
import { googleVisionService } from '../services/google-vision-service';
import { googleNLPService } from '../services/google-nlp-service';
import { googleAuthService } from '../services/google-auth';
import { requireAuth } from '../middleware/auth';
import { storage } from '../storage';

const router = Router();

// Schema for export request
const exportRequestSchema = z.object({
  projectId: z.string(),
  briefId: z.string(),
  exportTypes: z.array(z.enum(['slides', 'docs', 'sheets', 'drive'])),
  title: z.string().optional()
});

// Google OAuth initiation
router.get('/auth/google', requireAuth, (req, res) => {
  try {
    const authUrl = googleAuthService.generateAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
});

// Google OAuth callback
router.get('/auth/google/callback', requireAuth, async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    const tokens = await googleAuthService.exchangeCodeForTokens(code);
    
    // Store tokens in user session or database
    // For now, we'll store in session
    req.session.googleTokens = tokens;
    
    res.redirect('/briefs?google_auth=success');
  } catch (error) {
    console.error('Error exchanging Google auth code:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google' });
  }
});

// Export brief to Google services
router.post('/export', requireAuth, async (req, res) => {
  try {
    const validatedData = exportRequestSchema.parse(req.body);
    const { projectId, briefId, exportTypes, title } = validatedData;

    // Check if user has Google tokens
    if (!req.session.googleTokens) {
      return res.status(401).json({ 
        error: 'Google authentication required',
        authRequired: true 
      });
    }

    // Get project and brief data
    const project = await storage.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const brief = await storage.getDsdBriefById(briefId as string);
    if (!brief) {
      return res.status(404).json({ error: 'Brief not found' });
    }

    // Get captures for the project
    const captures = await storage.getCaptures(projectId);

    // Guard images & map to the DTO
    const capturesWithImages = (captures ?? [])
      .filter((c: any) => c?.type === 'image' && !!c?.imageData)
      .map((c: any) => ({
        title: c.title ?? 'Untitled',
        content: c.content ?? '',
        type: 'image',
        imageData: c.imageData as string,
      }));

    const briefData = {
      title: title || brief.title || project.name,
      content: (brief as any).content ?? { define: [], shift: [], deliver: [] },
      captures: capturesWithImages
    };

    const results: any = {};

    // Create Google Drive folder first if requested
    let projectFolder = null;
    if (exportTypes.includes('drive')) {
      const driveService = await createGoogleDriveService(req.session.googleTokens);
      projectFolder = await driveService.createProjectFolder(briefData.title);
      results.drive = projectFolder;
    }

    // Export to Google Slides
    if (exportTypes.includes('slides')) {
      const slidesService = await createGoogleSlidesService(req.session.googleTokens);
      const slidesRaw = await slidesService.createPresentationFromBrief(briefData as any);
      results.slides = { id: String(slidesRaw.presentationId), title: slidesRaw.title };
    }

    // Export to Google Docs
    if (exportTypes.includes('docs')) {
      const docsService = await createGoogleDocsService(req.session.googleTokens);
      const docsRaw = await docsService.createDetailedBriefDocument(briefData as any);
      results.docs = { id: String(docsRaw.documentId), title: docsRaw.title };
    }

    // Export to Google Sheets
    if (exportTypes.includes('sheets')) {
      const sheetsService = await createGoogleSheetsService(req.session.googleTokens);
      const sheetsRaw = await sheetsService.createAnalysisSpreadsheet(briefData as any);
      results.sheets = { id: String(sheetsRaw.spreadsheetId), title: sheetsRaw.title };
    }

    // Organize assets in Drive folder if created
    if (projectFolder && Object.keys(results).length > 1) {
      const driveService = await createGoogleDriveService(req.session.googleTokens);
      const organizeAssets: any = {};
      
      if (results.slides) organizeAssets.slides = { id: results.slides.id, title: results.slides.title };
      if (results.docs) organizeAssets.docs = { id: results.docs.id, title: results.docs.title };
      if (results.sheets) organizeAssets.sheets = { id: results.sheets.id, title: results.sheets.title };

      await driveService.organizeProjectAssets(projectFolder.folderId, organizeAssets);
    }

    res.json({
      success: true,
      exports: results,
      message: `Successfully exported to ${exportTypes.length} Google service(s)`
    });

  } catch (error) {
    console.error('Error exporting to Google services:', error);
    res.status(500).json({ error: 'Failed to export to Google services' });
  }
});

// Enhanced analysis with Google Vision and NLP
router.post('/analyze/enhanced/:captureId', requireAuth, async (req, res) => {
  try {
    const { captureId } = req.params;
    const capture = await storage.getCaptureById(captureId);
    if (!capture) {
      return res.status(404).json({ error: 'Capture not found' });
    }

    const enhancedAnalysis: any = {};

    // Google Vision analysis for images
    if (capture.type === 'image' && (capture as any).imageData) {
      try {
        enhancedAnalysis.vision = await googleVisionService.analyzeImageContent((capture as any).imageData);
      } catch (error) {
        console.error('Google Vision analysis failed:', error);
        enhancedAnalysis.vision = { error: 'Vision analysis unavailable' };
      }
    }

    // Google NLP analysis for text content
    if (capture.content && capture.content.length > 50) {
      try {
        enhancedAnalysis.nlp = await googleNLPService.analyzeTextContent(capture.content);
      } catch (error) {
        console.error('Google NLP analysis failed:', error);
        enhancedAnalysis.nlp = { error: 'NLP analysis unavailable' };
      }
    }

    // Update capture with enhanced analysis
    const updatedCapture = await storage.updateCapture(captureId, {
      googleAnalysis: enhancedAnalysis
    } as any);

    res.json({
      success: true,
      captureId,
      enhancedAnalysis,
      message: 'Enhanced Google analysis completed'
    });

  } catch (error) {
    console.error('Error performing enhanced analysis:', error);
    res.status(500).json({ error: 'Failed to perform enhanced analysis' });
  }
});

// Check Google authentication status
router.get('/auth/status', requireAuth, (req, res) => {
  const hasTokens = !!req.session.googleTokens;
  const tokenInfo = hasTokens ? {
    hasAccessToken: !!req.session.googleTokens?.access_token,
    hasRefreshToken: !!req.session.googleTokens?.refresh_token,
    expiryDate: req.session.googleTokens?.expiry_date
  } : null;

  res.json({
    authenticated: hasTokens,
    tokenInfo,
    availableServices: hasTokens ? [
      'slides', 'docs', 'sheets', 'drive', 'vision', 'nlp'
    ] : []
  });
});

// Batch export all project data
router.post('/export/project/:projectId', requireAuth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { shareWith = [] } = req.body;

    if (!req.session.googleTokens) {
      return res.status(401).json({ 
        error: 'Google authentication required',
        authRequired: true 
      });
    }

    const project = await storage.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const captures = await storage.getCaptures(projectId);
    const briefs = await storage.getBriefs(projectId);

    // Create comprehensive project export
    const projectData = {
      title: project.name,
      content: {
        define: (project as any).definePoints || [],
        shift: (project as any).shiftPoints || [],
        deliver: (project as any).deliverPoints || []
      },
      captures: captures || []
    };

    // Create all Google services
    const [driveService, slidesService, docsService, sheetsService] = await Promise.all([
      createGoogleDriveService(req.session.googleTokens),
      createGoogleSlidesService(req.session.googleTokens),
      createGoogleDocsService(req.session.googleTokens),
      createGoogleSheetsService(req.session.googleTokens)
    ]);

    // Create project folder
    const projectFolder = await driveService.createProjectFolder(project.name);

    // Export to all formats in parallel
    const [slidesResult, docsResult, sheetsResult] = await Promise.all([
      slidesService.createPresentationFromBrief(projectData as any),
      docsService.createDetailedBriefDocument(projectData as any),
      sheetsService.createAnalysisSpreadsheet(projectData as any)
    ]);

    // Organize assets in Drive
    await driveService.organizeProjectAssets(projectFolder.folderId, {
      slides: { id: slidesResult.presentationId, title: slidesResult.title },
      docs: { id: docsResult.documentId, title: docsResult.title },
      sheets: { id: sheetsResult.spreadsheetId, title: sheetsResult.title }
    });

    // Share with team if specified
    if (shareWith.length > 0) {
      await driveService.shareProjectFolder(projectFolder.folderId, shareWith, 'writer');
    }

    // Upload capture images - check for imageData in metadata or as direct property
    const capturesWithImages = captures?.filter(c => 
      (c as any).imageData || 
      (c.metadata && typeof c.metadata === 'object' && (c.metadata as any).imageData)
    ).map(c => ({
      title: c.title || 'Untitled',
      content: c.content || '',
      type: 'image',
      imageData: (c as any).imageData || (c.metadata as any)?.imageData
    })) || [];
    let uploadedAssets = null;
    if (capturesWithImages.length > 0) {
      uploadedAssets = await driveService.uploadCaptureAssets(
        projectFolder.folderId, 
        capturesWithImages
      );
    }

    res.json({
      success: true,
      project: {
        name: project.name,
        folderId: projectFolder.folderId,
        folderUrl: projectFolder.url
      },
      exports: {
        slides: slidesResult,
        docs: docsResult,
        sheets: sheetsResult,
        assets: uploadedAssets
      },
      sharing: {
        sharedWith: shareWith.length,
        folderShared: shareWith.length > 0
      },
      message: `Complete project export created with ${captures?.length || 0} captures and ${briefs?.length || 0} briefs`
    });

  } catch (error) {
    console.error('Error exporting project:', error);
    res.status(500).json({ error: 'Failed to export project' });
  }
});

export default router;