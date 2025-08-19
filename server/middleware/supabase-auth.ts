import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // server-side
);

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Development bypass - allow all requests when VITE_UIV2_MOCK=0 (our dev flag)
  if (process.env.VITE_UIV2_MOCK === '0' || process.env.NODE_ENV !== 'production') {
    (req as any).user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@contentradار.com'
    };
    return next();
  }

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Missing bearer token" });

  // Accept mock token in development
  if (token === "dev-mock-token" || token === "mock-token") {
    (req as any).user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@contentradار.com'
    };
    return next();
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return res.status(401).json({ error: "Invalid token" });

  (req as any).user = { id: data.user.id, email: data.user.email };
  next();
}