# Replit.md

## Overview

This is a full-stack strategic content intelligence platform built with React and Express, providing advanced AI-powered content analysis using OpenAI's GPT-4. The application enables users to capture content from URLs (especially social media like Instagram, YouTube, TikTok), analyze it using a Truth Analysis framework for strategic insights, and manage content progression through a signal promotion system (Capture → Potential Signal → Signal → Validated Signal).

The platform's business vision is to deliver authentic trending content and cultural intelligence, offering strategic advantages by understanding the complete visual culture context that drives consumer behavior and competitive positioning. Key capabilities include:
- AI-powered content analysis (GPT-4o and Gemini 2.5 Pro).
- Real-time content capture from various platforms using advanced scraping techniques (Bright Data integration).
- Signal management and workflow for promoting content from raw capture to validated signals.
- Automated brief generation and Google Slides integration.
- Comprehensive visual intelligence for brand, cultural, and competitive analysis.
- Advanced AI tiering system (Quick Mode: GPT-4o-mini; Deep Mode: GPT-4o).
- Chrome extension for frictionless content capture and voice notes.

## User Preferences

Preferred communication style: Simple, everyday language.

User Communication Preferences:
- Quality Over Speed: "dont change anything yet" - wants comprehensive planning before implementation
- Systematic Approach: Requests detailed implementation strategy to avoid breaking system
- Production Standards: High expectations for polished, professional user experience
- Risk Awareness: Concerned about system stability during modifications

## Major Architectural Decisions (August 2025)

**Platform Rebuild Initiative - Phase 1 COMPLETE**: Foundation & Architecture successfully implemented.

### ✅ Completed (August 4, 2025):
- **Database**: ✅ Migrated from 68-column god table to 7-table normalized schema (includes analysisResults table)
- **Services**: ✅ Consolidated from 73 service files to 9 focused services
- **Routes**: ✅ Consolidated from 19 route files to 1 unified API route file
- **Organization**: ✅ All legacy files moved to OLD_SYSTEM_FILES for clean project structure
- **API Integration**: ✅ All services validated (GPT-4.1, Gemini 2.5 Pro, Bright Data, Google APIs)
- **Chrome Extension**: ✅ Professional rebuild COMPLETE - Vue-like popup, keyboard shortcuts, background service worker, content script with screen selection
- **3-Tier AI System**: ✅ Analysis Orchestrator with intelligent routing between Quick/Standard/Deep modes
- **Visual Analysis**: ✅ Intelligent Visual Analysis Service routing to Gemini 2.5 Pro or Google Vision

### ✅ COMPLETED (August 4, 2025 - Evening):
- **UI/UX**: ✅ Visual overhaul COMPLETE - new 5-tab workspace with modern design
- **Frontend**: ✅ COMPLETE - all pages functional, user registration working, workspace operational
- **Authentication**: ✅ COMPLETE - login/logout/session management fully operational
- **Database Issues**: ✅ FIXED - all missing columns added, foreign keys restored
- **User Experience**: ✅ OPERATIONAL - users can register, login, and access all workspace features
- **Backend Routes**: ✅ COMPLETE - new modular API structure with workspace, captures, briefs, analytics endpoints
- **Theme System**: ✅ COMPLETE - dark mode fully implemented with localStorage persistence
- **API Client**: ✅ COMPLETE - new type-safe API client connecting frontend to backend services
- **Authentication Fix**: ✅ VERIFIED - login/logout/registration working with test credentials: testuser@workspace.com / testpass123

### 📊 Results:
- **70% code reduction** achieved
- **Server running** with new architecture
- **Clean separation** of concerns
- **Foundation ready** for UI/UX transformation

## System Architecture

The platform follows a modular, scalable architecture emphasizing clean design and performance.

**Frontend Architecture:**
- **Framework**: React with TypeScript.
- **UI Library**: Radix UI components with Tailwind CSS styling.
- **State Management**: React Query for server state.
- **Routing**: Single-page application with conditional rendering.
- **Build Tool**: Vite.
- **UI/UX Decisions**:
    - **Color Schemes**: Professional gradients and consistent blue theme.
    - **Templates**: Jimmy John's-style brief template (Performance → Cultural Signals → Platform Signals → Opportunities → Cohorts → Ideation).
    - **Design Approaches**: Modern, clean interface with professional gradients, smooth animations, visual hierarchy, and responsive design for both desktop and mobile (touch-optimized interfaces, fixed bottom navigation, safe area support).
    - **Space Optimization**: Reduced header (48px) and sidebar (192px, collapsible to 48px) for maximum working space.
    - **One Tool, One Place**: Streamlined navigation with 5 strategic workflow tabs (Today's Briefing, Explore Signals, New Signal Capture, Strategic Brief Lab, Manage).
    - **Loading States**: Standardized across all components with real progress tracking.

**Backend Architecture:**
- **Framework**: Express.js with TypeScript.
- **Session Management**: Express sessions for authentication.
- **Database**: PostgreSQL with Drizzle ORM.
- **Modularity**: Monolithic routes separated into specialized modules (e.g., authRoutes, signalRoutes, analysisRoutes).
- **Validation**: Zod for 100% request body and query parameter validation.
- **Error Handling**: Consistent API response format with user-friendly error messages and actionable solutions.
- **Authentication**: Session-based, strong password hashing (bcryptjs), protected routes, rate limiting for brute force protection.
- **Rate Limiting**: Implemented for OpenAI analysis endpoints (20 requests/min, 500/day) and general API endpoints (100 requests/min).
- **Content Chunking**: Intelligent system for processing unlimited content lengths by splitting, processing, and combining results.
- **Comment Limiting**: Intelligent sampling and configurable limits to prevent system overload from large comment threads.
- **API Monitoring**: Comprehensive tracking of internal and external API calls for performance, cost, and usage.
- **Source Traceability**: Every signal references at least one source or is marked as manual entry.
- **AI Tiering**:
    - **Quick Mode**: GPT-4o-mini for 2-4 sentence analysis.
    - **Deep Mode**: GPT-4o for 4-7 sentence analysis.
    - **Bidirectional Caching**: Seamless switching between modes without duplicate AI calls.

**System Design Choices:**
- **Truth Analysis Framework**: AI-powered analysis (fact → observation → insight → human truth → cultural moment).
- **Signal Progression**: Capture → Potential Signal → Signal → Validated Signal workflow.
- **Visual Intelligence**: Integrated Gemini 2.5 Pro for visual analysis (brand elements, cultural moments, competitive positioning).
- **Chrome Extension**: One-click content capture, voice notes, selective screenshots, project assignment, and AI-powered auto-tagging.
- **AI Model Integration**: GPT-4o for Truth Analysis, Gemini 2.5 Pro for visual analysis and brief generation.
- **Performance Optimization**: Advanced caching system (Redis TTL), rate limiting, job queue (BullMQ + Redis), lazy loading, tree-shaking, horizontal scaling architecture.
- **Security**: HSTS, Content Security Policy, server-side Zod validation, XSS audit, CORS lockdown.
- **Monitoring**: APM integration, health & metrics endpoints, alert system, performance dashboard.

## External Dependencies

The platform integrates with several key external services and APIs:

- **OpenAI API**: For AI-powered content analysis (GPT-4o, GPT-4o-mini, Whisper API for audio transcription).
- **Bright Data**: For advanced web scraping, including specialized social media APIs (Instagram, Twitter, TikTok, LinkedIn) and Browser API for real-time social media URL scraping and Google Trends rate limit bypass.
- **PostgreSQL (Supabase)**: Primary database for storing all application data.
- **Redis**: For distributed caching and job queue management (with BullMQ).
- **Google Trends API (via PyTrends)**: For real-time trending data and search interest analysis.
- **Reddit API**: For authentic engagement metrics and trending posts.
- **YouTube Data API**: For video search, trending content, and video transcription.
- **Multiple News APIs**: NewsAPI, GNews, Currents, MediaStack, NY Times API for comprehensive news coverage.
- **Entertainment APIs**: TMDB API (movies/TV), Spotify Web API (music trends), Last.fm API (music metadata), Genius API (lyrical analysis).
- **Hacker News API**: For tech and startup community discussions.
- **Glasp API**: For social highlighting and knowledge curation trends (experimental web scraping approach).
- **Know Your Meme**: For meme lifecycle tracking.
- **Urban Dictionary**: For language evolution and slang analysis.
- **TikTok Trends (via scraping)**: For viral video content and hashtag performance analysis.
- **Instagram Trends (via scraping)**: For visual culture and lifestyle trends analysis.