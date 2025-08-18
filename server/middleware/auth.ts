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
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  // Development mode: accept mock token (NODE_ENV may be empty in development)
  if (token === "dev-mock-token") {
    req.user = { id: "dev-user", email: "dev@example.com" };
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