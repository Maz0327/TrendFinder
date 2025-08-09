# Content Radar Application

## Overview
This project is a comprehensive Strategic Intelligence platform featuring the DSD Signal Drop methodology (Define→Shift→Deliver), advanced Truth Analysis Framework, and Collective Intelligence Network. The system combines manual content curation with AI-powered analysis using GPT-5 selective reasoning to identify cultural moments, predict viral trends, and generate strategic briefs. It provides businesses with actionable intelligence through client-specific relevance scoring, hypothesis tracking, and automated brief generation - transforming raw content signals into strategic decisions.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript (Vite build tool)
- **UI/UX**: Shadcn/ui components built on Radix UI primitives, styled with Tailwind CSS (CSS variables for theming)
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation
- **Design Philosophy**: Employs a strategic, business-focused workflow ("Explore Signals", "New Signal Capture", "Strategic Brief Lab", "Manage") and a unified "Explore Signals" interface with four discovery modes. The main dashboard is "Today's Briefing," acting as a daily intelligence hub.

### Backend Architecture
- **Runtime**: Node.js with Express.js (TypeScript, ES modules)
- **Database**: PostgreSQL with Drizzle ORM (Neon Database for cloud deployment)
- **Session Management**: PostgreSQL-based sessions with `connect-pg-simple`
- **API Design**: RESTful API with structured error handling
- **Core Logic**: Features enhanced 11-table schema supporting Strategic Intelligence (projects → captures → analysis → briefs + client_profiles → dsd_briefs + collective_patterns + cultural_moments + hypothesis_validations) and "Truth Analysis Engine" with GPT-5 reasoning for enhanced content assessment across four layers (Fact → Observation → Insight → Human Truth).

### Key Components
- **DSD Signal Drop System**: Strategic brief builder using Define→Shift→Deliver methodology with automated assembly from tagged captures into client-ready presentations.
- **Truth Analysis Framework**: 4-layer philosophical analysis (Fact→Observation→Insight→Human Truth) unique in the market, using GPT-5 selective reasoning for cost-effective deep insights.
- **Strategic Intelligence Features**: Viral potential scoring (0-100), cultural moment detection with cross-generational analysis, brand voice alignment scoring, and hypothesis tracking with outcome validation.
- **Collective Intelligence Network**: Anonymized pattern recognition across users, cultural moment emergence detection, and network confidence scoring that improves predictions with scale.
- **Chrome Extension**: Enhanced with DSD tagging (Life Lens, Raw Behavior, Channel Vibes, etc.), smart tag suggestions, and section assignment for automated brief assembly.
- **Export Capabilities**: Google Slides integration for DSD briefs, CSV/Markdown exports, Quote Bank extraction, and Manual Boost Planner generation.

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL for primary data storage.
- **OpenAI API**: GPT-5 with selective reasoning for AI-driven content analysis and hook generation (50% cost savings vs GPT-4o, 80% fewer errors with reasoning mode).
- **Bright Data API**: Primary data source for social media content scraping (dataset endpoints).
- **Bright Data Browser**: For real browser automation on JavaScript-heavy sites like Instagram and TikTok (WebSocket: `wss://zone:user@brd.superproxy.io:9222`).
- **Google API Ecosystem**: Integration for Google Slides, Docs, Sheets, Drive, Vision, NLP, Custom Search, and BigQuery, including OAuth authentication.
- **Google Cloud AI**: Specifically Google Vision and NLP for advanced content analysis.

## Recent Changes (January 2025)

### TrendFinder-LVUI-Push Integration Complete (January 9, 2025)
- **Major UI Architecture Migration**: Successfully migrated from SidebarProvider to sophisticated PageLayout system with TrendFinder-LVUI-Push design patterns
- **Enhanced Animation System**: Implemented FadeIn and StaggeredFadeIn components with directional animations and configurable delays
- **Advanced Strategic Intelligence Cards**: Created StrategicCard component adapted from TrendCard with DSD tags, viral scoring, truth analysis indicators, and cultural relevance metrics
- **Professional Chrome Extension**: Enhanced with sophisticated capture modes, AI integration, keyboard shortcuts, priority levels, and professional popup interface
- **PageLayout System**: Migrated all Strategic Intelligence pages to use clean PageLayout with professional headers, responsive design, and enhanced animations

### **COMPREHENSIVE TrendFinder-LVUI-Push Components Integration (January 9, 2025)**
- **StatsOverview Component**: Integrated across ALL enhanced pages (capture-tagging, truth-analysis, hypothesis-tracking, cultural-moments) and main dashboard with variant support (dashboard, strategic)
- **SystemStatus Component**: Added comprehensive system monitoring to ALL enhanced pages and main dashboard for real-time service health tracking
- **StrategicModal Component**: Implemented detailed content analysis modals across ALL enhanced pages for deep-dive content examination
- **EnhancedAnalysisPanel Component**: Integrated Google AI analysis capabilities into truth-analysis-enhanced page with strategic intelligence, truth framework, and NLP analysis
- **OnboardingTour Component**: Available system-wide through TourProvider integration in App.tsx for user guidance and feature discovery

### **Enhanced Strategic Intelligence Pages (Complete)**:
  - **CaptureTaggingEnhanced**: Advanced filtering, search, StatsOverview, SystemStatus, StrategicModal, and sophisticated tagging interface with hover overlays
  - **TruthAnalysisEnhanced**: 4-layer framework visualization, batch processing, EnhancedAnalysisPanel with Google AI integration, StatsOverview, SystemStatus, and detailed analysis panels with GPT-5 reasoning
  - **HypothesisTrackingEnhanced**: Prediction validation system with confidence scoring, status tracking, accuracy metrics, StatsOverview, SystemStatus, and StrategicModal for hypothesis analysis
  - **CulturalMomentsEnhanced**: Cross-generational trend detection with viral intensity tracking, platform distribution analysis, StatsOverview, SystemStatus, and StrategicModal for cultural moment insights
- **Main Dashboard Enhancement**: Integrated StatsOverview and SystemStatus for comprehensive real-time platform monitoring
- **Loading States**: Professional LoadingSpinner, LoadingOverlay, and LoadingCard components for better UX
- **Routing Enhancement**: Added enhanced routes while maintaining legacy compatibility for backward navigation
- **Visual Feedback**: Sophisticated hover effects, transition animations, and progressive disclosure patterns

### Lovable UI Integration (January 9, 2025)
- **Major Frontend Upgrade**: Successfully integrated professional Lovable UI components while maintaining all Strategic Intelligence backend capabilities
- **New Features Added**: Canvas annotations, user settings management, advanced analytics dashboard, enhanced search functionality
- **Database Extensions**: Added 3 new tables (user_settings, annotations, analytics_data) to support Lovable UI features
- **API Enhancements**: Created comprehensive REST endpoints for settings, annotations, analytics, and search
- **UI Components**: Integrated MetricCard, TrendChart, SignalCard, AppSidebar from Lovable with full dark mode support
- **Routing Migration**: Converted Lovable's React Router components to work with Wouter routing system
- **Dashboard Replacement**: New professional dashboard at "/" with real-time metrics, trend visualization, and quick actions
- **Enhanced Authentication**: Created modern auth pages with framer-motion animations, password strength indicators, and micro-interactions
- **Color Scheme Unification**: Updated primary colors to consistent blue (hsl(217, 70%, 53%)) across authentication, dashboard, and sidebar components

## Recent Changes (January 2025)

### Strategic Intelligence Implementation
- **Database Schema Extensions**: Added 5 new tables (client_profiles, dsd_briefs, collective_patterns, cultural_moments, hypothesis_validations) and enhanced captures table with DSD tags, viral scoring, and prediction tracking
- **Storage Layer Enhancement**: Implemented complete CRUD operations for all Strategic Intelligence features in DatabaseStorage class
- **API Routes**: Created comprehensive RESTful endpoints for client profiles, DSD briefs, collective patterns, cultural moments, and hypothesis validations
- **DSD Signal Drop Integration**: Captures now support DSD tagging (Life Lens, Raw Behavior, Channel Vibes, etc.) and section assignment (Define→Shift→Deliver)
- **Viral Intelligence**: Added viral scoring (0-100), cultural resonance tracking, and cross-generational analysis capabilities
- **Collective Network**: Implemented anonymized pattern recognition and confidence scoring that improves with user scale
- **Hypothesis Tracking**: Built prediction and outcome validation system for measuring accuracy of trend predictions

### UI and Styling
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first styling framework.
- **Lucide Icons**: For consistent application iconography.
- **Font Awesome**: For platform-specific social media icons.