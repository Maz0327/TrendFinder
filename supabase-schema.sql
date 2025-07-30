-- Supabase Migration Schema - Content Radar Platform
-- Strategic Intelligence and Truth Analysis Framework
-- Clean database design without legacy conflicts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (integrates with Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'user',
  onboarding_completed BOOLEAN DEFAULT false,
  tour_completed BOOLEAN DEFAULT false,
  progress_data JSONB DEFAULT '{}',
  google_tokens JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Projects table - Strategic campaigns and initiatives
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  brief_template TEXT DEFAULT 'jimmy-johns',
  status TEXT DEFAULT 'active',
  client TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Captures table - Content captured via Chrome Extension
CREATE TABLE captures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Capture metadata
  type TEXT NOT NULL, -- 'screenshot', 'text', 'url', 'video-frame', 'thread'
  title TEXT,
  content TEXT,
  url TEXT,
  platform TEXT,
  
  -- Enhanced content fields
  screenshot_url TEXT,
  summary TEXT,
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  
  -- Truth Analysis Framework
  truth_analysis JSONB,
  analysis_status TEXT DEFAULT 'pending',
  
  -- Google AI Analysis
  google_analysis JSONB,
  
  -- Status and timestamps
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Content Radar table - Trending content from platforms
CREATE TABLE content_radar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  hook1 TEXT,
  hook2 TEXT,
  category TEXT NOT NULL,
  platform TEXT NOT NULL,
  viral_score DECIMAL(5,2) DEFAULT 0.0,
  engagement INTEGER DEFAULT 0,
  growth_rate DECIMAL(10,2) DEFAULT 0.0,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Briefs table - Generated strategic briefs
CREATE TABLE briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  template_type TEXT DEFAULT 'jimmy-johns',
  description TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Brief Captures junction table
CREATE TABLE brief_captures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brief_id UUID NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
  capture_id UUID NOT NULL REFERENCES captures(id) ON DELETE CASCADE,
  section TEXT,
  order_index INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brief_id, capture_id)
);

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_captures_project_id ON captures(project_id);
CREATE INDEX idx_captures_user_id ON captures(user_id);
CREATE INDEX idx_captures_status ON captures(status);
CREATE INDEX idx_captures_analysis_status ON captures(analysis_status);
CREATE INDEX idx_content_radar_category ON content_radar(category);
CREATE INDEX idx_content_radar_platform ON content_radar(platform);
CREATE INDEX idx_content_radar_viral_score ON content_radar(viral_score);
CREATE INDEX idx_content_radar_created_at ON content_radar(created_at);
CREATE INDEX idx_briefs_project_id ON briefs(project_id);

-- Insert sample data for testing
INSERT INTO users (id, email, username, role) VALUES
('777cc116-c924-4e13-87c0-e0a26b7596b6', 'admin@strategist.com', 'admin', 'admin'),
('888dd227-d035-5f24-98d1-f1b37c8696c7', 'strategist@content.com', 'strategist', 'user');

-- Insert sample project
INSERT INTO projects (id, user_id, name, description, brief_template) VALUES
('b5360642-11d1-440b-a812-d838089b141e', '777cc116-c924-4e13-87c0-e0a26b7596b6', 'Jimmy Johns PAC Drop #8', 'Strategic analysis of PAC Drop campaign performance and optimization opportunities', 'jimmy-johns');

-- Insert sample content for testing
INSERT INTO content_radar (title, url, content, category, platform, viral_score, engagement) VALUES
('Truth Analysis Framework Success', 'https://strategist.com/truth-framework', 'Complete implementation of 4-layer Truth Analysis Framework for strategic intelligence processing', 'methodology', 'strategic-platform', 9.5, 450),
('Jimmy Johns Campaign Optimization', 'https://campaigns.com/jimmy-johns-pac', 'PAC Drop #8 campaign achieving exceptional engagement rates through strategic content optimization', 'campaign-analysis', 'marketing-platform', 8.8, 380),
('Database Schema Migration Complete', 'https://tech.com/supabase-migration', 'Successful migration to Supabase with clean schema design and enhanced performance', 'technical', 'development-platform', 7.2, 220);