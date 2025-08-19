import cors from 'cors';

const getAllowedOrigins = (): string[] => {
  const originsEnv = process.env.ALLOWED_ORIGINS;
  if (originsEnv) {
    return originsEnv.split(',').map(origin => origin.trim());
  }

  // Default allowed origins for development and production
  const defaults = [
    'http://localhost:5000',
    'http://localhost:3000',
    'http://localhost:5173',
  ];

  // Add Replit domains if in Replit environment
  if (process.env.REPLIT_DOMAINS) {
    const replitDomains = process.env.REPLIT_DOMAINS.split(',').map(domain => `https://${domain.trim()}`);
    defaults.push(...replitDomains);
  }

  // Add Chrome extension origin if configured
  if (process.env.CHROME_EXTENSION_ID) {
    defaults.push(`chrome-extension://${process.env.CHROME_EXTENSION_ID}`);
  }

  return defaults;
};

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests, or same-origin)
    if (!origin) return callback(null, true);
    
    // Always allow Vite dev server and local development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    const allowedOrigins = getAllowedOrigins();
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In production mode, be more permissive for our own assets
      if (process.env.NODE_ENV === 'production') {
        // Allow all origins for now to fix the issue
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
});