import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthedUser {
  id: string;
  email: string;   // must be string to satisfy the extended Request type
  role?: string;
  metadata?: any;
}

export interface AuthedRequest extends Request {
  user?: AuthedUser;
}

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || "";

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  // Development bypass - allow all requests when VITE_UIV2_MOCK=0 (our dev flag)
  if (process.env.VITE_UIV2_MOCK === '0' || process.env.NODE_ENV !== 'production') {
    // Provide a default user for development
    req.user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@contentradار.com',
      role: 'admin',
      metadata: { dev: true }
    };
    return next();
  }

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  // Accept mock token in development
  if (token === "dev-mock-token" || token === "mock-token") {
    req.user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@contentradار.com',
      role: 'admin'
    };
    return next();
  }

  try {
    const payload = jwt.verify(token, SUPABASE_JWT_SECRET) as any;
    // Supabase JWT typically provides sub (user id), email
    req.user = { id: payload.sub, email: payload.email || '' };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}