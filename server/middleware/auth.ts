import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Request {
  user?: { id: string; email: string; metadata?: any; role?: string };
}

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || "";

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const payload = jwt.verify(token, SUPABASE_JWT_SECRET) as any;
    // Supabase JWT typically includes sub (user id) and email
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}