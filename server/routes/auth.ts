import { Express, Request, Response } from "express";
import type { AuthUser } from "../types/dto";

// Simple auth validation - since SUPABASE_JWT_SECRET is missing, we'll use a basic approach
function getUserFromRequest(req: Request): AuthUser | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  // For now, since we don't have SUPABASE_JWT_SECRET, we'll do basic validation
  // In production, this should decode and verify the JWT
  const token = authHeader.substring(7);
  
  if (!token || token.length < 20) {
    return null;
  }

  // Mock user for development - in production, decode JWT and get actual user data
  return {
    id: 'user-123',
    email: 'user@example.com',
    name: 'Test User',
    avatarUrl: null
  };
}

export function registerAuthRoutes(app: Express) {
  // Get current authenticated user
  app.get('/api/auth/me', async (req: Request, res: Response) => {
    try {
      const user = getUserFromRequest(req);
      res.json(user);
    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });

  // Google auth start - placeholder for UI
  app.post('/api/auth/google/start', async (req: Request, res: Response) => {
    // This is handled by existing Supabase auth flow on client
    res.json({ ok: true, message: 'Use Supabase auth flow on client' });
  });
}

export { getUserFromRequest };