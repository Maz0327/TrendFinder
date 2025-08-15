# Content Radar Application

## Overview
This project is a Strategic Intelligence platform that transforms raw content signals into strategic decisions. It uses the DSD Signal Drop methodology (Define→Shift→Deliver), a Truth Analysis Framework, and a Collective Intelligence Network. The platform combines manual content curation with AI-powered analysis (GPT-5 selective reasoning) to identify cultural moments, predict viral trends, and generate strategic briefs. Integrated with Supabase for authentication, real-time features, storage, and edge computing, its core purpose is to provide a comprehensive solution for strategic intelligence.

## User Preferences
Preferred communication style: Simple, everyday language.

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
- **Design Philosophy**: Business-focused workflow with a unified "Explore Signals" interface and a "Today's Briefing" dashboard. Apple-inspired design system with glass effects, pill buttons, smooth animations, and SF Pro typography.

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
- **Brief Canvas**: Implementation supporting 8 block types (text, image, capture_ref, note, quote, shape, list, chart) with autosave, snapshots, and collaborative locking.
- **Truth Analysis Framework**: 4-layer philosophical analysis (Fact→Observation→Insight→Human Truth) using GPT-5.
- **Strategic Intelligence Features**: Viral potential scoring, cultural moment detection, brand voice alignment scoring, hypothesis tracking.
- **Collective Intelligence Network**: Anonymized pattern recognition, cultural moment emergence detection, network confidence scoring.
- **Chrome Extension**: Full-featured browser extension with token-based authentication, interactive element capture, platform detection, and seamless integration with the analysis pipeline.
- **Export Capabilities**: Google Slides, CSV/Markdown, Quote Bank, Manual Boost Planner.

## External Dependencies

- **Supabase**: Complete backend platform (Authentication, PostgreSQL Database, Real-time, Storage, Edge Functions).
- **OpenAI API**: GPT-4o for AI-driven content analysis and hook generation.
- **Bright Data API**: Primary data source for social media content scraping.
- **Bright Data Browser**: For real browser automation on JavaScript-heavy sites.
- **Google API Ecosystem**: Integration for Google Slides, Docs, Sheets, Drive, Vision, NLP, Custom Search, BigQuery (including OAuth).
- **Google Cloud AI**: Google Vision and NLP for advanced content analysis.

## Recent Changes

**August 14, 2025 - Repository Cleanup & Hardening Complete**
- **Legacy Asset Cleanup**: Removed content-radar/ and attached_assets/ folders, updated .gitignore for heavy assets ✅
- **API Standardization**: Updated all client API configurations to use relative /api endpoints instead of hardcoded localhost ✅
- **Tailwind v3 Maintained**: Confirmed v3.4.10 setup intact, no changes needed (preparing for Bolt UI integration) ✅
- **Feature Flag Compatibility**: Added FLAGS = FEATURES alias for backward compatibility across imports ✅
- **Environment Organization**: Removed duplicate .env.new, maintained .env.example as canonical template ✅
- **Testing Infrastructure**: Created comprehensive scripts/smoke.ts for build validation and health checks ✅
- **Build Verification**: Confirmed TypeScript compilation and production builds working (8.02s build time) ✅
- **Zero Breaking Changes**: All functionality, design, and integrations preserved exactly ✅

**Task Block #7 Complete: Brief Canvas Backend (pages/blocks, autosave, snapshots, publish)**

**August 15, 2025 - Complete UI-V2 Glassmorphism Design System Implementation**
- **Unified Styling**: Replaced all hardcoded styling (bg-white, bg-blue-500, border-gray) with glassmorphism classes ✅
- **Complete Coverage**: Updated 7 pages + 3 core components with frost-card, frost-strong, frost-subtle patterns ✅
- **Visual Consistency**: Achieved unified soft glassmorphism aesthetic across entire platform ✅
- **Design Harmony**: All buttons, cards, borders, and interactive elements now use consistent glass styling ✅
- **Apple-Inspired Polish**: Enhanced frosted glass effects with proper opacity balance and readability ✅

**August 14, 2025 - Task Block 8A (Moments Radar) + 8B (Chrome Extension Capture) Complete**
- **Database Infrastructure**: Created moments and ext_tokens tables with proper indexing, materialized views, and RLS policies ✅
- **Real-time Streaming**: Implemented SSE utilities for live data streaming to frontend clients with 10-second intervals ✅
- **Moments API**: Complete read-model system with pagination, filtering, and background aggregation worker ✅  
- **Extension Security**: Token-based authentication with SHA-256 hashing, expiration, and secure scope management ✅
- **Capture Integration**: Multipart file upload support with automatic analysis enqueuing and storage abstraction ✅
- **Background Processing**: Moments aggregator worker running every 2 minutes for real-time trend detection ✅
- **API Architecture**: All routes properly secured, CORS configured for Chrome extensions, comprehensive error handling ✅