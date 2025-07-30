import { User } from "@shared/supabase-schema";

declare global {
  namespace Express {
    interface Request {
      session?: {
        userId?: string;
        user?: User;
      };
    }
  }
}

export {};