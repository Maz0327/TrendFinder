# Content Radar Application

## Overview
This project is a Strategic Intelligence platform utilizing the DSD Signal Drop methodology (Define→Shift→Deliver), a Truth Analysis Framework, and a Collective Intelligence Network. It combines manual content curation with AI-powered analysis (GPT-5 selective reasoning) to identify cultural moments, predict viral trends, and generate strategic briefs. Integrated with Supabase for authentication, real-time features, storage, and edge computing, it transforms raw content signals into strategic decisions.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
**August 12, 2025 - Consolidated Supabase Authentication Flow**
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
- **Chrome Extension**: DSD tagging, smart tag suggestions, section assignment for automated brief assembly.
- **Export Capabilities**: Google Slides, CSV/Markdown, Quote Bank, Manual Boost Planner.

## External Dependencies

- **Supabase**: Complete backend platform (Authentication, PostgreSQL Database, Real-time, Storage, Edge Functions).
- **OpenAI API**: GPT-4o for AI-driven content analysis and hook generation.
- **Bright Data API**: Primary data source for social media content scraping.
- **Bright Data Browser**: For real browser automation on JavaScript-heavy sites.
- **Google API Ecosystem**: Integration for Google Slides, Docs, Sheets, Drive, Vision, NLP, Custom Search, BigQuery (including OAuth).
- **Google Cloud AI**: Google Vision and NLP for advanced content analysis.