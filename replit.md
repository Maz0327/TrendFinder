# Content Radar Application

## Overview

This is a full-stack content trend monitoring application that tracks viral content across multiple platforms using **Bright Data as the primary data source**. The system automatically scans Reddit, Instagram, YouTube, TikTok, and Twitter/X through Bright Data's API and browser automation, analyzes content using AI, and provides insights into trending topics with viral potential scoring and content hooks for social media optimization.

## User Preferences

Preferred communication style: Simple, everyday language.

## Current Status (January 30, 2025)

**REBUILD IN PROGRESS**: Transitioning from trend monitoring to strategist-focused workflow

**Phase 1 - Project-Based Architecture**: ✅ COMPLETE
- New 4-table schema: projects → captures → analysis → briefs
- Fixed Truth Analysis Engine with single AI call for all 4 layers
- Truth Analysis UI component with visual hierarchy
- Project management routes and storage implementation
- Projects page with create/edit/delete functionality

**Phase 2 - Chrome Extension Enhancement**: ✅ COMPLETE
- Smart capture modes implemented: Precision (yellow overlay) and Context (blue border)
- Keyboard shortcuts configured (Cmd+Shift+S, C, P, N)
- Project integration with active project tracking and project selector in popup
- Visual feedback for capture modes with Tab key toggle
- Background processing with Chrome Extension API endpoints
- Popup redesigned with project selector and new capture buttons

**Phase 3 - Onboarding System**: ✅ COMPLETE
- Interactive Product Tour with 6-step guided walkthrough
- Progressive Feature Disclosure with unlock system tracking user progress
- Sample Content & Templates with 3 demo projects (Jimmy John's, TikTok Trends, Nike Campaign)
- Welcome modal for first-time users with tour/skip options
- Feature unlock notifications and achievement system
- Tour integration in navigation with "Take Tour" option

**Phase 4 - Visual Brief Builder**: ⏳ PENDING
- Drag-drop interface for captures → brief sections
- Jimmy John's template implementation
- AI integration for brief generation
- Export functionality (Markdown, PDF, Slides)

**Architecture Changes**:
- Migrated from signals-based to project-based workflow
- Simplified from 5+ tables to 4 core tables
- Maintained backward compatibility with existing Signal Mining features
- Truth Analysis now properly integrated at capture level

**Technical Status**:
- Server running on port 5000
- Database schema updated with new tables including onboarding fields
- Chrome Extension enhanced with smart capture modes
- API endpoints operational for projects and captures
- Comprehensive onboarding system with tour providers and sample content

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL using Drizzle ORM
- **Cloud Database**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple
- **API Design**: RESTful API with structured error handling

### Build and Development
- **Monorepo Structure**: Shared types and schemas between client and server
- **Development**: Vite dev server with HMR integration
- **Production Build**: ESBuild for server bundling, Vite for client
- **Type Safety**: Comprehensive TypeScript configuration with strict mode

## Key Components

### Content Management System
- **Content Fetching**: Dual Bright Data integration with both API endpoints and browser automation for comprehensive scraping
- **Platform Coverage**: Reddit, Instagram, YouTube, TikTok, and Twitter/X through multiple scraping methods
- **Browser Automation**: Advanced scraping capabilities using Bright Data's browser infrastructure for JavaScript-heavy sites
- **AI Analysis**: OpenAI GPT-4o integration for content summarization and hook generation
- **Viral Scoring**: Algorithm-based scoring system for viral potential assessment
- **Content Categorization**: Automatic categorization into pop culture, technology, business, sports, etc.

### Data Processing Pipeline
- **Manual Scanning**: Auto-scanning disabled by default, users control when to start/stop scheduled scans
- **Dual Bright Data Integration**: Both API endpoints and real browser automation working in parallel
- **Content Filtering**: Platform-specific content extraction and processing
- **Engagement Tracking**: Metrics collection for upvotes, comments, views, etc.
- **Growth Rate Analysis**: Trend momentum calculation
- **Browser Automation**: Real Puppeteer integration with Bright Data Browser zone credentials

### Dashboard Interface
- **Real-time Stats**: Live dashboard with trend metrics and platform status
- **Content Filtering**: Advanced filtering by category, platform, time range, and viral score
- **Content Cards**: Rich content preview with engagement metrics and viral scores
- **Modal Details**: Expanded view with AI-generated hooks and full content analysis

### User Management
- **Authentication**: Username/password based authentication
- **Session Management**: Secure session handling with PostgreSQL storage

## Data Flow

### Strategic Intelligence Flow
1. **Multi-Platform Collection**: Tier 1 platforms (LinkedIn, Instagram, TikTok, Twitter/X, Medium) through Bright Data integration
2. **Smart AI Analysis**: 
   - **Gemini 2.5 Pro**: Visual content analysis, cultural intelligence, cross-platform correlation
   - **OpenAI GPT-4o**: Strategic framework generation, complex business reasoning
3. **Truth Analysis Framework**: Four-layer analysis (Fact → Observation → Insight → Human Truth)
4. **Signal Correlation**: Cross-platform pattern detection and cultural moment identification
5. **Strategic Brief Generation**: Professional outputs matching Jimmy John's format with user copy control
6. **Database Storage**: Clean 5-table architecture with proper indexing and relationships

### User Interaction Flow
1. **Dashboard Access**: Users view real-time trending content dashboard
2. **Content Filtering**: Apply filters for category, platform, time range, and sorting
3. **Content Selection**: Click on content cards to view detailed analysis
4. **Hook Generation**: Generate additional content hooks on-demand
5. **Content Actions**: Copy hooks, bookmark content, share externally

### Data Persistence
- **Content Storage**: All trending content stored with full metadata
- **Scan History**: Track scanning operations with success/failure metrics
- **User Sessions**: Secure session management in PostgreSQL
- **Analytics**: Content performance and engagement tracking over time

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL for primary data storage
- **OpenAI API**: GPT-4o for content analysis and hook generation
- **Bright Data API**: Primary data source for reliable social media content scraping using dataset endpoints
- **Bright Data Browser**: Real browser automation (WebSocket: wss://zone:user@brd.superproxy.io:9222) with production credentials for JavaScript-heavy sites like Instagram and TikTok
- **Platform APIs**: Reddit API, YouTube Data API, News APIs, Twitter API v2 (emergency fallback sources only)

### Development Tools
- **Replit Integration**: Development environment with cartographer plugin
- **Error Handling**: Runtime error modal for development debugging
- **Type Safety**: Drizzle Zod for schema validation and type generation

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide Icons**: Consistent iconography throughout the application
- **Font Awesome**: Platform-specific icons for social media

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Module Replacement**: Real-time code updates during development
- **Environment Variables**: Separate configuration for database and API keys
- **Database Migrations**: Drizzle migrations for schema management

### Production Deployment
- **Build Process**: 
  - Client: Vite production build to `dist/public`
  - Server: ESBuild compilation to `dist/index.js`
- **Static Serving**: Express serves built client assets
- **Database**: Production PostgreSQL via Neon Database
- **Environment**: NODE_ENV-based configuration switching

### Scalability Considerations
- **Database**: Serverless PostgreSQL scales automatically with demand
- **Content Fetching**: Configurable scanning intervals to manage API rate limits
- **Caching**: Query-based caching with TanStack React Query
- **Error Resilience**: Comprehensive error handling for external API failures

The application follows a clean separation of concerns with shared TypeScript types ensuring type safety across the full stack. The modular architecture allows for easy extension of new content platforms and AI analysis capabilities.