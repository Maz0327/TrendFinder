# Supabase Setup Guide for Strategic Intelligence Platform

## 🎯 **Ideal Supabase Configuration**

### **Project Settings**
- **Name**: `strategic-intelligence-platform`
- **Organization**: Your personal organization
- **Region**: Choose closest to your location (US East for optimal performance)
- **Database Password**: Strong password (save this - you'll need it)
- **Pricing Plan**: Free tier is sufficient for development/testing

### **Database Configuration**
- **PostgreSQL Version**: 15+ (automatically configured)
- **Connection Pooling**: Enabled (default)
- **SSL Mode**: Required (default)
- **Row Level Security**: We'll enable this for specific tables

---

## 📋 **Step-by-Step Setup Instructions**

### **Step 1: Create Supabase Project**

1. **Go to Supabase Dashboard**
   - Visit [supabase.com/dashboard](https://supabase.com/dashboard)
   - Sign in or create account if needed

2. **Create New Project**
   - Click "New Project" button
   - Choose your organization (or create one)

3. **Configure Project**
   ```
   Name: strategic-intelligence-platform
   Database Password: [Create strong password - SAVE THIS!]
   Region: US East (Ohio) or closest to you
   Pricing Plan: Free
   ```
   - Click "Create new project"
   - Wait 2-3 minutes for provisioning

### **Step 2: Get Connection Details**

1. **Access Project Settings**
   - Click on your project name
   - Go to "Settings" in sidebar
   - Click "Database"

2. **Copy Connection String**
   - Scroll to "Connection string" section
   - Select "URI" tab
   - Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
   - **Important**: Replace `[YOUR-PASSWORD]` with your actual database password

### **Step 3: Configure Replit Connection**

1. **Add to Replit Secrets**
   - In Replit, go to "Secrets" tab (lock icon)
   - Click "Add new secret"
   - Key: `DATABASE_URL`
   - Value: Your complete connection string with real password

2. **Test Connection**
   - The connection string should look like:
   ```
   postgresql://postgres:your_actual_password@db.xxxxx.supabase.co:5432/postgres
   ```

### **Step 4: Configure Database Schema**

Our platform needs these tables:

1. **Core Tables**
   ```sql
   -- Users (authentication)
   users (id, email, password, role, created_at)
   
   -- Strategic Signals (main content analysis)
   signals (id, user_id, title, content, url, summary, sentiment, 
           truth_fact, truth_observation, truth_insight, human_truth,
           cultural_moment, viral_potential, status, created_at)
   
   -- Projects (strategic brief organization)
   projects (id, user_id, name, description, status, created_at)
   
   -- Sources (content source tracking)
   sources (id, name, type, url, status, last_scanned)
   
   -- Visual Assets (image analysis)
   visual_assets (id, signal_id, url, analysis, brand_elements)
   ```

2. **Advanced Tables**
   ```sql
   -- Brief Templates (strategic framework)
   brief_templates (id, name, sections, framework_type)
   
   -- User Profiles (preferences and settings)
   user_profiles (id, user_id, preferences, topic_interests)
   
   -- Feed Items (RSS and external content)
   feed_items (id, source_id, title, content, published_at)
   ```

---

## 🔧 **Database Migration Process**

### **Option 1: Automatic Schema Setup (Recommended)**
Once connected, our Drizzle ORM will automatically create tables:
```bash
npm run db:push
```

### **Option 2: Manual Table Creation**
If you prefer manual setup, use Supabase SQL Editor:

1. **Go to SQL Editor**
   - In Supabase dashboard, click "SQL Editor"
   - Create new query

2. **Run Schema Creation Script**
   ```sql
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   
   -- Create users table
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     email TEXT UNIQUE NOT NULL,
     password TEXT NOT NULL,
     role TEXT DEFAULT 'user',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Create signals table (main content analysis)
   CREATE TABLE signals (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES users(id),
     title TEXT,
     content TEXT,
     url TEXT,
     summary TEXT,
     truth_fact TEXT,
     truth_observation TEXT,
     truth_insight TEXT,
     human_truth TEXT,
     cultural_moment TEXT,
     viral_potential TEXT,
     status TEXT DEFAULT 'capture',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

---

## 🛡️ **Security Configuration**

### **Row Level Security (RLS)**
Enable RLS for sensitive tables:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Enable RLS on signals table  
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own signals
CREATE POLICY "Users can manage own signals" ON signals
  FOR ALL USING (user_id = auth.uid());
```

### **API Keys and Permissions**
1. **Service Role Key** (for server-side operations)
   - Go to Settings → API
   - Copy "service_role" key
   - Add to Replit Secrets as `SUPABASE_SERVICE_KEY`

2. **Anonymous Key** (for client-side operations)
   - Copy "anon public" key
   - Add to Replit Secrets as `SUPABASE_ANON_KEY`

---

## 🚀 **Connection Verification**

### **Test Database Connection**
```javascript
// Test connection in Node.js
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const result = await sql`SELECT version()`;
console.log('Connected to PostgreSQL:', result[0].version);
```

### **Expected Connection String Format**
```
postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres
```

Where:
- `PASSWORD`: Your database password
- `PROJECT_ID`: Your Supabase project identifier

---

## 🔍 **Troubleshooting Common Issues**

### **Issue: "ENOTFOUND" DNS Error**
- **Cause**: Project paused/deleted or wrong URL
- **Solution**: Check project status in Supabase dashboard, resume if paused

### **Issue: Authentication Failed**
- **Cause**: Wrong password in connection string
- **Solution**: Reset database password in Supabase settings

### **Issue: Connection Timeout**
- **Cause**: Network/firewall issues
- **Solution**: Try different region or check firewall settings

### **Issue: SSL Connection Error**
- **Cause**: SSL certificate issues
- **Solution**: Add `?sslmode=require` to connection string

---

## 📊 **Performance Optimization**

### **Connection Pooling**
- Supabase automatically enables connection pooling
- Use port 6543 for pooled connections (recommended)
- Use port 5432 for direct connections (only if needed)

### **Database Indexes**
```sql
-- Create indexes for better performance
CREATE INDEX idx_signals_user_id ON signals(user_id);
CREATE INDEX idx_signals_created_at ON signals(created_at);
CREATE INDEX idx_signals_status ON signals(status);
```

---

## ✅ **Final Verification Checklist**

Before starting development, verify:

- [ ] Supabase project created and active
- [ ] DATABASE_URL added to Replit Secrets with correct password
- [ ] Connection test successful (no DNS errors)
- [ ] Tables created via `npm run db:push` or manual SQL
- [ ] Service role and anon keys added (if needed)
- [ ] RLS policies configured for security

Once all items are checked, your strategic intelligence platform will have a robust, scalable database foundation ready for development.