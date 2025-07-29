# Content Radar Application

## Overview

This is a full-stack content trend monitoring application that tracks viral content across multiple platforms using **Bright Data as the primary data source**. The system automatically scans Reddit, Instagram, YouTube, TikTok, and Twitter/X through Bright Data's API and browser automation, analyzes content using AI, and provides insights into trending topics with viral potential scoring and content hooks for social media optimization.

## User Preferences

Preferred communication style: Simple, everyday language.

## Current Status (July 29, 2025)

**Database Issue**: Both Supabase and Replit PostgreSQL databases experiencing DNS resolution failures in this environment. App running on memory storage temporarily - all features work except data doesn't persist between restarts.

**Working Services**: ✅ OpenAI API, ✅ Gemini API, ✅ Bright Data API, ✅ App functionality

**Next Priority**: Build strategic intelligence platform features while database connectivity is being resolved.

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

### Content Ingestion Flow
1. **Scheduled Triggers**: Cron jobs initiate content scanning across platforms
2. **Dual Bright Data Integration**: 
   - **API Scraping**: Direct API calls to Bright Data's social media datasets
   - **Browser Automation**: Advanced browser-based scraping for complex interactions and JavaScript rendering
3. **Parallel Processing**: Both API and browser methods run simultaneously for maximum data coverage
4. **Fallback Sources**: Secondary fetching from direct platform APIs when needed
5. **Content Processing**: Extract relevant data (title, content, engagement metrics)
6. **AI Analysis**: Generate summaries, hooks, and viral scores using OpenAI
7. **Database Storage**: Persist processed content with metadata and categorization

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