# Content Radar Application

## Overview
This project is a comprehensive Strategic Intelligence platform featuring the DSD Signal Drop methodology (Define→Shift→Deliver), advanced Truth Analysis Framework, and Collective Intelligence Network. The system combines manual content curation with AI-powered analysis using GPT-5 selective reasoning to identify cultural moments, predict viral trends, and generate strategic briefs. Now fully integrated with Supabase for authentication, real-time features, storage, and edge computing - transforming raw content signals into strategic decisions with enterprise-grade infrastructure.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript (Vite build tool)
- **UI/UX**: Shadcn/ui components on Radix UI, styled with Tailwind CSS (CSS variables for theming)
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Supabase Auth with JWT tokens, social logins (Google, GitHub, Twitter), and magic links
- **Real-time**: Supabase Realtime for live updates, presence, and collaboration
- **Storage**: Supabase Storage for media uploads with automatic thumbnails
- **Design Philosophy**: Employs a strategic, business-focused workflow ("Explore Signals", "New Signal Capture", "Strategic Brief Lab", "Manage") and a unified "Explore Signals" interface with four discovery modes. The main dashboard is "Today's Briefing."
- **UI Components**: Integrates `StatsOverview`, `SystemStatus`, `StrategicModal`, `EnhancedAnalysisPanel`, and `OnboardingTour` components.
- **Enhanced Strategic Intelligence Pages**: Features `CaptureTaggingEnhanced`, `TruthAnalysisEnhanced`, `HypothesisTrackingEnhanced`, and `CulturalMomentsEnhanced` with advanced filtering, analysis, and visualization.

### Backend Architecture
- **Runtime**: Node.js with Express.js (TypeScript, ES modules)
- **Database**: Supabase PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth with JWT middleware, Row Level Security
- **Edge Functions**: Supabase Edge Functions for AI processing (content analysis, truth analysis, brief generation)
- **Real-time**: Supabase Realtime channels for live updates and presence
- **Storage**: Supabase Storage buckets for captures, briefs, avatars, exports
- **Session Management**: Hybrid approach - Supabase JWT with PostgreSQL session fallback
- **API Design**: Auto-generated Supabase APIs with RESTful fallback
- **Security**: Row Level Security policies for multi-tenant data isolation
- **Core Logic**: Features an 11-table schema supporting Strategic Intelligence (projects → captures → analysis → briefs + client_profiles → dsd_briefs + collective_patterns + cultural_moments + hypothesis_validations) and a "Truth Analysis Engine" with GPT-5 reasoning across four layers (Fact → Observation → Insight → Human Truth).

### Key Components
- **DSD Signal Drop System**: Strategic brief builder using Define→Shift→Deliver methodology with automated assembly from tagged captures.
- **Truth Analysis Framework**: 4-layer philosophical analysis (Fact→Observation→Insight→Human Truth) using GPT-5 selective reasoning.
- **Strategic Intelligence Features**: Viral potential scoring, cultural moment detection with cross-generational analysis, brand voice alignment scoring, and hypothesis tracking with outcome validation.
- **Collective Intelligence Network**: Anonymized pattern recognition, cultural moment emergence detection, and network confidence scoring.
- **Chrome Extension**: Enhanced with DSD tagging (Life Lens, Raw Behavior, Channel Vibes, etc.), smart tag suggestions, and section assignment for automated brief assembly.
- **Export Capabilities**: Google Slides integration for DSD briefs, CSV/Markdown exports, Quote Bank extraction, and Manual Boost Planner generation.

## External Dependencies

### Core Infrastructure
- **Supabase**: Complete backend platform providing:
  - **Authentication**: JWT-based auth with social logins and magic links
  - **Database**: PostgreSQL with auto-generated APIs and Row Level Security
  - **Real-time**: WebSocket channels for live updates and presence
  - **Storage**: S3-compatible object storage with CDN and transformations
  - **Edge Functions**: Serverless computing for AI processing
- **OpenAI API**: GPT-4o with selective reasoning for AI-driven content analysis and hook generation
- **Bright Data API**: Primary data source for social media content scraping
- **Bright Data Browser**: For real browser automation on JavaScript-heavy sites like Instagram and TikTok
- **Google API Ecosystem**: Integration for Google Slides, Docs, Sheets, Drive, Vision, NLP, Custom Search, and BigQuery, including OAuth authentication
- **Google Cloud AI**: Specifically Google Vision and NLP for advanced content analysis

## Supabase Integration Details

### Phase 1: Authentication Migration (Completed)
- JWT-based authentication replacing session-based auth
- Social login providers (Google, GitHub, Twitter)
- Magic link authentication for passwordless login
- Automatic user migration from existing database
- Middleware for JWT verification with session fallback

### Phase 2: Real-time Features (Completed)
- Live capture updates across all users
- Cultural moment detection notifications
- DSD brief collaboration with presence
- Real-time dashboard metrics
- Content collaboration with live editing

### Phase 3: Storage Integration (Completed)
- Organized buckets: captures, briefs, avatars, exports
- Chrome extension media uploads with batch processing
- Automatic thumbnail generation for images
- Signed URLs for private content access
- Storage usage tracking per user

### Phase 4: Advanced Features (Completed)
- Row Level Security for all tables
- Edge Functions for heavy AI processing:
  - Content analysis with viral scoring
  - Truth Analysis Framework implementation
  - DSD Brief generation
- Auto-generated REST APIs from database schema
- TypeScript type safety with generated types

### Recent Changes (August 2025)
- **JWT Authentication Implementation**: Successfully migrated core capture routes to JWT-based authentication
  - Protected routes: GET /api/captures, /api/captures/recent, /api/captures/all, POST /api/extension/capture
  - Added middleware layers: requireAuth, validateBody with Zod validation
  - Created front-end API wrapper for automatic JWT token attachment
- **Rate Limiting**: Implemented Express rate limiting (60 req/min) for public and heavy API routes
- **Supabase Migration**: Updated to new project (uytiwodjtulpjvgjtsod.supabase.co) with full connectivity

### Required Environment Variables
```
VITE_SUPABASE_URL=https://uytiwodjtulpjvgjtsod.supabase.co
VITE_SUPABASE_ANON_KEY=<configured>
SUPABASE_SERVICE_ROLE_KEY=<configured>
```

### Authentication Architecture
- **Hybrid System**: JWT authentication for API routes with session-based fallback
- **Protected Routes**: All capture endpoints now require valid Supabase JWT tokens
- **Frontend Integration**: Automatic token attachment via apiFetch wrapper in client/src/lib/api.ts
- **Rate Limiting**: Applied to /api/public/*, /api/bright-data/*, /api/ai/* endpoints