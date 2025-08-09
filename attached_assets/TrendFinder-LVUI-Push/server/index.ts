import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { debugLogger, errorHandler } from "./services/debug-logger";
import { systemMonitor } from "./services/system-monitor";

const MemStore = MemoryStore(session);

const app = express();
// Increase payload limits for visual analysis with base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Session configuration
app.use(
  session({
    store: new MemStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'content-radar-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Disable secure for development
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax' // More permissive for development
    }
  })
);

// Enhanced CORS headers for Chrome extension and credentials
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  const origin = req.headers.origin;
  
  // Allow Chrome extension origins
  if (origin && (origin.startsWith('chrome-extension://') || origin.startsWith('moz-extension://'))) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // Standard CORS for web clients
    const allowedOrigins = [
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin || 'http://localhost:5000');
    }
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Process error handlers
process.on('uncaughtException', (error) => {
  debugLogger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  debugLogger.error('Unhandled Rejection at:', promise, 'rejection');
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
      
      // Enhanced debug logging
      debugLogger.apiCall(req, res, duration, res.statusCode >= 400 ? new Error(capturedJsonResponse?.message || 'Request failed') : undefined);
      
      // Record metrics for system monitoring
      const userId = (req as any).session?.userId;
      const userAgent = req.get('User-Agent');
      const errorMessage = res.statusCode >= 400 ? capturedJsonResponse?.error || 'Request failed' : undefined;
      
      systemMonitor.recordRequest(
        req.method,
        path,
        res.statusCode,
        duration,
        userId,
        userAgent,
        errorMessage
      );
    }
  });

  next();
});

(async () => {
  // Debug endpoints (no admin required) for frontend debug panel
  app.get('/api/debug/logs', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const level = req.query.level as string;
      const validLevel = level && ['error', 'warn', 'info', 'debug'].includes(level) ? level as 'error' | 'warn' | 'info' | 'debug' : undefined;
      const logs = debugLogger.getRecentLogs(limit, validLevel);
      res.json({ 
        success: true, 
        data: { logs, count: logs.length, level, limit }
      });
    } catch (error: any) {
      debugLogger.error('Failed to retrieve debug logs', error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve debug logs"
      });
    }
  });

  app.get('/api/debug/errors', async (req, res) => {
    try {
      const errorSummary = debugLogger.getErrorSummary();
      res.json({ 
        success: true, 
        data: errorSummary
      });
    } catch (error: any) {
      debugLogger.error('Failed to retrieve error summary', error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve error summary"
      });
    }
  });

  app.get('/api/debug/performance', async (req, res) => {
    try {
      const metrics = debugLogger.getPerformanceMetrics();
      res.json({ 
        success: true, 
        data: { metrics }
      });
    } catch (error: any) {
      debugLogger.error('Failed to retrieve performance metrics', error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve performance metrics"
      });
    }
  });

  app.get('/api/system/health', async (req, res) => {
    try {
      const health = systemMonitor.getHealthStatus();
      const status = health.healthy ? 200 : 503;
      res.status(status).json({ 
        success: health.healthy,
        data: health
      });
    } catch (error: any) {
      debugLogger.error('Failed to retrieve system health', error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve system health"
      });
    }
  });

  app.get('/api/system/metrics', async (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 1;
      const metrics = systemMonitor.getMetricsHistory(hours);
      res.json({ 
        success: true, 
        data: { metrics, hours }
      });
    } catch (error: any) {
      debugLogger.error('Failed to retrieve system metrics', error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve system metrics"
      });
    }
  });

  app.get('/api/system/requests', async (req, res) => {
    try {
      const stats = systemMonitor.getRequestStats();
      res.json({ 
        success: true, 
        data: stats
      });
    } catch (error: any) {
      debugLogger.error('Failed to retrieve request stats', error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to retrieve request stats"
      });
    }
  });

  // Use Supabase database if SUPABASE_DATABASE_URL is available
  const DATABASE_URL = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  console.log("🔗 Database URL source:", process.env.SUPABASE_DATABASE_URL ? "Supabase" : "Neon");
  
  const server = await registerRoutes(app);

  // Enhanced error handler with debug logging
  app.use(errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
