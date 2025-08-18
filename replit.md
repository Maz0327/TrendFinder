# Content Radar Application

## Overview
This project is a Strategic Intelligence platform designed to transform raw content signals into strategic decisions. It leverages a DSD Signal Drop methodology, a Truth Analysis Framework, and a Collective Intelligence Network. The platform combines manual content curation with AI-powered analysis (GPT-5 selective reasoning) to identify cultural moments, predict viral trends, and generate strategic briefs. Integrated with Supabase for authentication, real-time features, storage, and edge computing, its core purpose is to provide a comprehensive solution for strategic intelligence, enabling users to make informed strategic decisions based on data-driven insights.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (August 18, 2025)
- **Complete Legacy UI Cleanup**: Removed all legacy UI code (pages, routes, layouts, context, services) leaving only UI-V2 system
- **Import Path Resolution**: Fixed all broken service imports in UI-V2 hooks to use proper internal services
- **Tailwind Configuration**: Updated to scan only UI-V2 and shadcn/ui components for optimized builds
- **Single Frontend Architecture**: UI-V2 is now the sole frontend system, eliminating build conflicts
- **Navigation System Fixed**: Restored original AppHeader with working signout functionality using wouter routing
- **System Status**: Clean architecture with UI-V2 as single source of truth, backend fully operational, all imports resolved

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript (Vite)
- **UI System**: UI-V2 Modern Architecture (Apple-inspired design with glassmorphism)
- **UI/UX**: Shadcn/ui (Radix UI, Tailwind CSS with CSS variables)
- **State Management**: TanStack React Query + Zustand (for canvas state)
- **Routing**: Wouter (in UI-V2 system)
- **Form Handling**: React Hook Form with Zod validation  
- **Authentication**: Hybrid system (Supabase Auth + token-based)
- **Real-time**: Supabase Realtime (live updates, presence)
- **Storage**: Supabase Storage (media uploads, automatic thumbnails)
- **Design Philosophy**: UI-V2 provides sophisticated Apple-inspired interface with Brief Canvas (Google Slides-like editor), drag-and-drop capture triage, moments radar visualization, and comprehensive project management with premium glass effects and smooth animations.

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
- **Brief Canvas**: Supports 8 block types (text, image, capture_ref, note, quote, shape, list, chart) with autosave, snapshots, and collaborative locking.
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