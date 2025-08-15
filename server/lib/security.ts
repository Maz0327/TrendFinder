import helmet from 'helmet';

export const securityMiddleware = helmet({
  // Content Security Policy - minimal to avoid breaking functionality
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
  
  // Cross-origin policies
  crossOriginEmbedderPolicy: false, // Allow embedding for API usage
  crossOriginResourcePolicy: { policy: "cross-origin" },
  
  // Security headers
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  
  // Disable X-Powered-By header
  hidePoweredBy: true,
  
  // Referrer policy
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});