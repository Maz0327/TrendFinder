import rateLimit from "express-rate-limit";

export const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

export const heavyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // stricter for AI/scraping
  standardHeaders: true,
  legacyHeaders: false,
});