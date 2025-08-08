import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const session = (req as any).session;
  
  if (!session || !session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  // Add user info to request
  req.user = {
    id: session.userId,
    email: session.userEmail || ''
  };

  next();
}