# Supabase Migration Plan - Content Radar Platform

## Migration Overview
Moving from Neon PostgreSQL to Supabase for clean database schema and better tooling.

## New Database Architecture

### Core Tables
1. **users** - Clean user management with Supabase Auth integration
2. **projects** - Strategic campaigns and initiatives 
3. **captures** - Content captured via Chrome Extension with Truth Analysis
4. **content_radar** - Trending content from multiple platforms
5. **briefs** - Generated strategic briefs
6. **brief_captures** - Many-to-many relationship for briefs and captures

### Key Benefits of Supabase Migration
- Clean schema without legacy conflicts
- Built-in authentication system
- Real-time subscriptions for live updates
- Better database tooling and management
- Row Level Security (RLS) for multi-tenant support
- Automatic API generation

## Implementation Steps
1. Create new Supabase project
2. Design clean schema with proper relationships
3. Update application to use Supabase connection
4. Migrate essential data (projects, users)
5. Test Truth Analysis Framework with clean database
6. Update documentation

## Schema Design Principles
- Simple, clear column names
- Proper foreign key relationships
- JSONB for flexible metadata storage
- Timestamps for audit trails
- UUID primary keys for scalability