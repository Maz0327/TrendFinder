# Content Radar Application

## Overview
This project is a full-stack content trend monitoring application designed to identify and analyze viral content across major social media platforms. It leverages AI for content analysis, viral potential scoring, and generating content hooks for social media optimization. The application aims to provide businesses and marketers with actionable insights into trending topics and cultural moments, enabling them to capitalize on emerging trends. Its core capability lies in automatically scanning, analyzing, and reporting on content from Reddit, Instagram, YouTube, TikTok, and Twitter/X, using sophisticated data sources and AI models.

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
- **Core Logic**: Features a project-based architecture using a 4-table schema (projects → captures → analysis → briefs) and a "Truth Analysis Engine" for AI-driven content assessment across four layers (Fact → Observation → Insight → Human Truth).

### Key Components
- **Content Management System**: Integrates Bright Data's API and browser automation for scraping, covering Reddit, Instagram, YouTube, TikTok, and Twitter/X. Utilizes OpenAI GPT-4o for content summarization and hook generation, and Gemini Visual Analysis for brand elements and cultural intelligence. Includes an algorithm for viral potential scoring and automatic content categorization.
- **Data Processing Pipeline**: Supports manual content scanning, dual Bright Data integration (API and real browser automation), content filtering, engagement tracking, and growth rate analysis.
- **Dashboard Interface**: Provides real-time trend metrics, advanced filtering, rich content previews, and expanded views with AI-generated hooks.
- **User Management**: Standard username/password authentication with secure session handling.
- **Chrome Extension**: Enhances content capture with smart modes (Precision/Context), keyboard shortcuts, project integration, and visual feedback.

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL for primary data storage.
- **OpenAI API**: GPT-5 for AI-driven content analysis and hook generation (50% cost savings vs GPT-4o).
- **Bright Data API**: Primary data source for social media content scraping (dataset endpoints).
- **Bright Data Browser**: For real browser automation on JavaScript-heavy sites like Instagram and TikTok (WebSocket: `wss://zone:user@brd.superproxy.io:9222`).
- **Google API Ecosystem**: Integration for Google Slides, Docs, Sheets, Drive, Vision, NLP, Custom Search, and BigQuery, including OAuth authentication.
- **Google Cloud AI**: Specifically Google Vision and NLP for advanced content analysis.

### UI and Styling
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first styling framework.
- **Lucide Icons**: For consistent application iconography.
- **Font Awesome**: For platform-specific social media icons.