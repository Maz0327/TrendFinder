import { User } from "@shared/schema";

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