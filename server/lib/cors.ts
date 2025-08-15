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

  return defaults;
};

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
});