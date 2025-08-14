import { Router } from "express";
import { registerProjectRoutes } from "./projects";
// Brief routes now handled by main server/routes.ts
import googleExportsRouter from "./google-exports";
import { setupSettingsRoutes } from "./settings";
import { setupAnnotationsRoutes } from "./annotations";
import { setupAnalyticsRoutes } from "./analytics";
import { setupSearchRoutes } from "./search";

export function buildApiRouter() {
  const router = Router();

  // Existing modules (keep these as-is)
  registerProjectRoutes(router as any);
  registerBriefRoutes(router as any);
  router.use("/google", googleExportsRouter);

  // Lovable UI routes
  setupSettingsRoutes(router as any);
  setupAnnotationsRoutes(router as any);
  setupAnalyticsRoutes(router as any);
  setupSearchRoutes(router as any);

  return router;
}