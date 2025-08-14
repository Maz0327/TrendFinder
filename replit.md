# Content Radar Application

## Overview
This project is a Strategic Intelligence platform utilizing the DSD Signal Drop methodology (Define→Shift→Deliver), a Truth Analysis Framework, and a Collective Intelligence Network. It combines manual content curation with AI-powered analysis (GPT-5 selective reasoning) to identify cultural moments, predict viral trends, and generate strategic briefs. Integrated with Supabase for authentication, real-time features, storage, and edge computing, it transforms raw content signals into strategic decisions.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
**August 14, 2025 - Task Block #3 Complete: Full-Stack API Consolidation** 
- **Database Schema Enhanced**: Applied tags migration to dsd_briefs table with GIN indexes for performance ✅
- **Server Infrastructure**: Enhanced CORS configuration and reusable Supabase auth middleware for all API routes ✅
- **Comprehensive API Endpoints**: Complete paginated endpoints for captures, briefs, moments, feeds with tag filtering ✅
- **Advanced Storage Layer**: Implemented all pagination, search, and tag management methods (listCapturesWithPagination, updateCaptureTags, getBriefWithDetails, etc.) ✅
- **Client-Server Integration**: Updated all client services to use new API response formats with enhanced features ✅
- **Authentication Flow**: Bearer token validation working correctly across all endpoints ✅
- **Route Consolidation**: Legacy routes temporarily disabled, new comprehensive API operational ✅
- **Feature Enhancement**: Tags support, advanced search, pagination, and filtering active across all content types ✅

**Previous - Phase 5-6 Google Export Scaffolding Complete** 
- **Task Block #1 Complete**: API consolidation and Google export scaffolding complete ✅

**August 13, 2025 - Complete Chrome Extension Integration**
- **Chrome Extension deployed**: Full-featured browser extension with token-based authentication
- **Database schema updated**: Added extension_tokens and analysis_jobs tables with enhanced captures metadata
- **Server-side API**: Robust extension endpoints with token authentication middleware and CORS support
- **Client Settings UI**: Professional token management interface with connection testing
- **Extension features**: Interactive element capture, platform detection, multiple capture methods, real-time status
- **Security architecture**: Token hashing, revocation system, rate limiting, and secure API communication
- **End-to-end workflow**: Browser → token auth → API → database → analysis pipeline integration

**August 12, 2025 - Created Complete Lovable Backend Interface Pack**
- **Generated handoff package**: Complete integration artifacts for UI development teams
- **29 files packaged**: Database types, Supabase client, contexts, services, hooks, pages, docs
- **Documentation created**: FRONTEND_CONTRACT.md and README_FOR_UI_DEV.md with integration rules
- **Security verified**: No hardcoded secrets found in any files  
- **Package ready**: `lovable_backend_interface_pack_20250812_223405.tar.gz` (22K) for Lovable.dev or UI teams
- **Contract-driven**: Defines exact integration points to prevent backend breaking changes

**Previous: Consolidated Supabase Authentication Flow**
- **Fixed "dueling auth flows" problem**: Eliminated multiple competing Supabase client instances
- **Single source of truth**: Created centralized AuthContext with one global auth state listener
- **Streamlined auth routing**: Implemented RequireAuth component with proper hooks usage
- **Updated OAuth flow**: Fixed Google sign-in redirect URLs and callback handling
- **Removed duplicate clients**: Consolidated all Supabase imports to single `/integrations/supabase/client.ts` 
- **Build verified**: All TypeScript compilation passing, authentication working end-to-end
- **Auth debug component**: Added temporary monitoring for session state verification

**Previous: Apple-Inspired UI Polish Applied**
- Applied comprehensive Apple-inspired design system with glass effects, pill buttons, and smooth animations
- Created design tokens file with Apple-style CSS variables supporting light/dark themes
- Updated UI components (Button, Input) with glass styling and focus states
- Redesigned app header with glass backdrop and segmented navigation
- Added SF Pro typography stack with system font fallbacks
- All changes backed up and feature flagged for easy rollback

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript (Vite)
- **UI/UX**: Shadcn/ui (Radix UI, Tailwind CSS for styling with CSS variables)
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: Supabase Auth (JWT, social logins, magic links)
- **Real-time**: Supabase Realtime (live updates, presence)
- **Storage**: Supabase Storage (media uploads, automatic thumbnails)
- **Design Philosophy**: Business-focused workflow ("Explore Signals", "New Signal Capture", "Strategic Brief Lab", "Manage") with a unified "Explore Signals" interface and a "Today's Briefing" dashboard.
- **Key Components**: `StatsOverview`, `SystemStatus`, `StrategicModal`, `EnhancedAnalysisPanel`, `OnboardingTour`, `CaptureTaggingEnhanced`, `TruthAnalysisEnhanced`, `HypothesisTrackingEnhanced`, `CulturalMomentsEnhanced`.

### Backend Architecture
- **Runtime**: Node.js with Express.js (TypeScript, ES modules)
- **Database**: Supabase PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth (JWT middleware, Row Level Security)
- **Edge Functions**: Supabase Edge Functions (AI processing: content analysis, truth analysis, brief generation)
- **Real-time**: Supabase Realtime channels
- **Storage**: Supabase Storage buckets
- **Session Management**: Hybrid (Supabase JWT with PostgreSQL session fallback)
- **API Design**: Auto-generated Supabase APIs with RESTful fallback
- **Security**: Row Level Security policies for multi-tenant data isolation
- **Core Logic**: 11-table schema supporting Strategic Intelligence, and a "Truth Analysis Engine" with GPT-5 reasoning across four layers (Fact → Observation → Insight → Human Truth).

### Key Components
- **DSD Signal Drop System**: Strategic brief builder using Define→Shift→Deliver methodology.
- **Truth Analysis Framework**: 4-layer philosophical analysis (Fact→Observation→Insight→Human Truth) using GPT-5.
- **Strategic Intelligence Features**: Viral potential scoring, cultural moment detection, brand voice alignment scoring, hypothesis tracking.
- **Collective Intelligence Network**: Anonymized pattern recognition, cultural moment emergence detection, network confidence scoring.
- **Chrome Extension**: Complete browser extension with token-based authentication, interactive element capture, platform detection, and seamless integration with the analysis pipeline.
- **Export Capabilities**: Google Slides, CSV/Markdown, Quote Bank, Manual Boost Planner.

## External Dependencies

- **Supabase**: Complete backend platform (Authentication, PostgreSQL Database, Real-time, Storage, Edge Functions).
- **OpenAI API**: GPT-4o for AI-driven content analysis and hook generation.
- **Bright Data API**: Primary data source for social media content scraping.
- **Bright Data Browser**: For real browser automation on JavaScript-heavy sites.
- **Google API Ecosystem**: Integration for Google Slides, Docs, Sheets, Drive, Vision, NLP, Custom Search, BigQuery (including OAuth).
- **Google Cloud AI**: Google Vision and NLP for advanced content analysis.