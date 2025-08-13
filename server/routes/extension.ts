import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { 
  generateExtensionToken, 
  verifyExtensionToken, 
  revokeExtensionToken, 
  getUserExtensionTokens 
} from '../lib/extensionAuth';

const router = Router();

// Create new extension token (authenticated route)
router.post('/tokens', async (req, res) => {
  try {
    const { name } = req.body;
    const userId = (req as any).user?.id; // Assuming user is attached via auth middleware
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'Token name is required' });
    }
    
    const token = await generateExtensionToken(userId, name);
    res.json({ token, message: 'Extension token created successfully' });
  } catch (error) {
    console.error('Error creating extension token:', error);
    res.status(500).json({ error: 'Failed to create extension token' });
  }
});

// List user's extension tokens
router.get('/tokens', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const tokens = await getUserExtensionTokens(userId);
    res.json({ tokens });
  } catch (error) {
    console.error('Error fetching extension tokens:', error);
    res.status(500).json({ error: 'Failed to fetch extension tokens' });
  }
});

// Revoke extension token
router.delete('/tokens/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    await revokeExtensionToken(tokenId, userId);
    res.json({ message: 'Extension token revoked successfully' });
  } catch (error) {
    console.error('Error revoking extension token:', error);
    res.status(500).json({ error: 'Failed to revoke extension token' });
  }
});

// Capture endpoint for Chrome Extension (uses extension token auth)
router.post('/capture', verifyExtensionToken, async (req, res) => {
  try {
    const userId = (req as any).extensionUserId;
    const { 
      title, 
      content, 
      url, 
      platform, 
      tags,
      image_url,
      image_thumb_url,
      selection_rect,
      ocr_text,
      source_author,
      source_posted_at,
      source_metrics,
      project_id 
    } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    // Insert capture into database
    const { data: capture, error } = await supabaseAdmin
      .from('captures')
      .insert({
        user_id: userId,
        title,
        content,
        url,
        platform,
        tags,
        image_url,
        image_thumb_url,
        selection_rect,
        ocr_text,
        source_author,
        source_posted_at,
        source_metrics,
        project_id,
        analysis_status: 'pending'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating capture:', error);
      return res.status(500).json({ error: 'Failed to create capture' });
    }
    
    // Create analysis job
    const { error: jobError } = await supabaseAdmin
      .from('analysis_jobs')
      .insert({
        capture_id: capture.id,
        status: 'pending'
      });
      
    if (jobError) {
      console.error('Error creating analysis job:', jobError);
    }
    
    res.status(201).json({ 
      capture: {
        id: capture.id,
        title: capture.title,
        url: capture.url,
        created_at: capture.created_at
      },
      message: 'Capture created successfully' 
    });
  } catch (error) {
    console.error('Error processing capture:', error);
    res.status(500).json({ error: 'Failed to process capture' });
  }
});

// Health check for extension
router.get('/health', verifyExtensionToken, (req, res) => {
  res.json({ 
    status: 'ok', 
    userId: (req as any).extensionUserId,
    timestamp: new Date().toISOString() 
  });
});

export { router as extensionRouter };