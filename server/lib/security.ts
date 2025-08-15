import helmet from 'helmet';

// Completely disable helmet in development to avoid crashes
export const securityMiddleware = process.env.NODE_ENV === 'development' 
  ? (req: any, res: any, next: any) => next() // No-op middleware in development
  : helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https:"],
          fontSrc: ["'self'", "https:", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      hidePoweredBy: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" }
    });