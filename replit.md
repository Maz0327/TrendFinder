# Content Radar Application

## Overview
This project is a comprehensive Strategic Intelligence platform featuring the DSD Signal Drop methodology (Define→Shift→Deliver), advanced Truth Analysis Framework, and Collective Intelligence Network. The system combines manual content curation with AI-powered analysis using GPT-5 selective reasoning to identify cultural moments, predict viral trends, and generate strategic briefs. It provides businesses with actionable intelligence through client-specific relevance scoring, hypothesis tracking, and automated brief generation - transforming raw content signals into strategic decisions.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript (Vite build tool)
- **UI/UX**: Shadcn/ui components on Radix UI, styled with Tailwind CSS (CSS variables for theming)
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation
- **Design Philosophy**: Employs a strategic, business-focused workflow ("Explore Signals", "New Signal Capture", "Strategic Brief Lab", "Manage") and a unified "Explore Signals" interface with four discovery modes. The main dashboard is "Today's Briefing."
- **UI Components**: Integrates `StatsOverview`, `SystemStatus`, `StrategicModal`, `EnhancedAnalysisPanel`, and `OnboardingTour` components.
- **Enhanced Strategic Intelligence Pages**: Features `CaptureTaggingEnhanced`, `TruthAnalysisEnhanced`, `HypothesisTrackingEnhanced`, and `CulturalMomentsEnhanced` with advanced filtering, analysis, and visualization.

### Backend Architecture
- **Runtime**: Node.js with Express.js (TypeScript, ES modules)
- **Database**: PostgreSQL with Drizzle ORM (Neon Database for cloud deployment)
- **Session Management**: PostgreSQL-based sessions with `connect-pg-simple`
- **API Design**: RESTful API with structured error handling
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
- **Neon Database**: Serverless PostgreSQL for primary data storage.
- **OpenAI API**: GPT-5 with selective reasoning for AI-driven content analysis and hook generation.
- **Bright Data API**: Primary data source for social media content scraping.
- **Bright Data Browser**: For real browser automation on JavaScript-heavy sites like Instagram and TikTok.
- **Google API Ecosystem**: Integration for Google Slides, Docs, Sheets, Drive, Vision, NLP, Custom Search, and BigQuery, including OAuth authentication.
- **Google Cloud AI**: Specifically Google Vision and NLP for advanced content analysis.