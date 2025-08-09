import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@shared/database.types';

// Server-side Supabase client with service role key for admin operations
const supabaseAdmin = createClient<Database>(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Middleware to verify Supabase JWT tokens
export async function supabaseAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Fall back to session auth if no JWT token
      if (req.session?.user?.id) {
        return next();
      }
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user to request for downstream middleware
    req.user = {
      id: user.id,
      email: user.email || '',
      metadata: user.user_metadata,
    };

    // Also update session for compatibility
    if (req.session) {
      req.session.user = {
        id: user.id,
        email: user.email || '',
        username: user.user_metadata?.username || user.email?.split('@')[0] || '',
      };
    }

    next();
  } catch (error) {
    console.error('Supabase auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

// Optional middleware for routes that can work with or without auth
export async function optionalSupabaseAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Check session auth as fallback
      if (req.session?.user?.id) {
        req.user = req.session.user;
      }
      return next();
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (!error && user) {
      req.user = {
        id: user.id,
        email: user.email || '',
        metadata: user.user_metadata,
      };

      if (req.session) {
        req.session.user = {
          id: user.id,
          email: user.email || '',
          username: user.user_metadata?.username || user.email?.split('@')[0] || '',
        };
      }
    }

    next();
  } catch (error) {
    // Continue without auth on error
    next();
  }
}

// Admin-only middleware
export async function supabaseAdminAuth(req: Request, res: Response, next: NextFunction) {
  try {
    await supabaseAuth(req, res, () => {
      // Check if user has admin role
      const userRole = req.user?.metadata?.role || req.session?.user?.role;
      
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      next();
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

// Helper to get Supabase client with user's token
export function getSupabaseClient(token: string) {
  return createClient<Database>(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || '',
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}