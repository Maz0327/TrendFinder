# Strategic Intelligence Platform - Pre-Project Setup Checklist

## 🎯 **Overview**
This checklist ensures we have all required services, API keys, and infrastructure ready before building the strategic content analysis platform. Complete these steps to avoid development roadblocks.

---

## 📊 **Database Setup**

### ✅ **Supabase Database (CRITICAL - Primary Data Store)**
**Status**: ⏳ PENDING USER ACTION
**Required for**: User accounts, content storage, strategic analysis data, project management

**Setup Steps:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose project name: `strategic-intelligence-platform`
4. Set strong database password (save this!)
5. Select region closest to your location
6. Wait for provisioning (~2-3 minutes)
7. Copy connection string from Project Settings → Database → Connection string (URI format)
8. Add to Replit Secrets as `DATABASE_URL`

**Connection String Format:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

---

## 🤖 **AI Services**

### ✅ **OpenAI API (ALREADY CONFIGURED)**
**Status**: ✅ READY - Already in environment
**Used for**: Truth Analysis, strategic insights, content analysis
**Models**: GPT-4o (primary), GPT-4o-mini (quick analysis)
**Current Key**: `OPENAI_API_KEY` ✅

### ⏳ **Google Gemini API (NEEDED)**
**Status**: ⏳ PENDING USER ACTION  
**Used for**: Visual analysis, brand elements, cultural insights, brief generation
**Required for**: Image analysis, competitive intelligence, visual content processing

**Setup Steps:**
1. Go to [ai.google.dev](https://ai.google.dev/)
2. Click "Get API key in Google AI Studio"
3. Create new project or select existing
4. Enable Generative AI API
5. Create API key
6. Add to Replit Secrets as `GEMINI_API_KEY`

**Required Models:** 
- Gemini 2.0 Flash (primary)
- Gemini 1.5 Pro (backup)

---

## 🌐 **Web Scraping & Data Collection**

### ✅ **Bright Data (ALREADY CONFIGURED)**
**Status**: ✅ READY - Already working
**Used for**: Social media scraping, trending content, platform monitoring
**Current Setup**: Browser automation + API endpoints
**Working Platforms**: Reddit, Instagram, YouTube, TikTok, Twitter/X

**Current Credentials:**
- `BRIGHT_DATA_API_TOKEN` ✅
- `BRIGHT_DATA_BROWSER_USER` ✅  
- `BRIGHT_DATA_BROWSER_PASS` ✅

### ⏳ **Additional Platform APIs (OPTIONAL - Enhanced Data)**
**Status**: ⏳ OPTIONAL ENHANCEMENT
**Purpose**: Backup data sources, enhanced metrics, official API access

**Reddit API (Official Backup):**
1. Go to [reddit.com/prefs/apps](https://reddit.com/prefs/apps)
2. Create app → "web app"
3. Get Client ID and Secret
4. Add as `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET`

**YouTube Data API (Enhanced Video Analysis):**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Enable YouTube Data API v3
3. Create credentials (API key)
4. Add as `YOUTUBE_API_KEY`

**Twitter API v2 (Enhanced Tweet Analysis):**
1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Apply for developer account
3. Create app and get Bearer Token
4. Add as `TWITTER_BEARER_TOKEN`

---

## 🔐 **Authentication & Security**

### ⏳ **Session Secret (NEEDED)**
**Status**: ⏳ PENDING USER ACTION
**Used for**: User session management, secure authentication
**Setup**: Generate strong random string (32+ characters)

**Quick Generation Options:**
```bash
# Option 1: Generate in terminal
openssl rand -hex 32

# Option 2: Use password generator
# Generate 32-character random string online
```

Add to Replit Secrets as `SESSION_SECRET`

### ⏳ **JWT Secret (OPTIONAL)**
**Status**: ⏳ OPTIONAL (for token-based auth)
**Used for**: Chrome extension authentication, API tokens
**Setup**: Generate another strong random string
Add as `JWT_SECRET` if implementing token auth

---

## 📧 **Email Services (OPTIONAL)**

### ⏳ **SendGrid or Resend (OPTIONAL)**
**Status**: ⏳ OPTIONAL - For user notifications
**Used for**: Account verification, daily briefings, system alerts

**SendGrid Setup:**
1. Go to [sendgrid.com](https://sendgrid.com)
2. Create account and verify
3. Create API key with Mail Send permissions
4. Add as `SENDGRID_API_KEY`

**Resend Setup (Alternative):**
1. Go to [resend.com](https://resend.com)
2. Create account
3. Add and verify domain
4. Create API key
5. Add as `RESEND_API_KEY`

---

## 🗂️ **File Storage (OPTIONAL)**

### ⏳ **Supabase Storage (RECOMMENDED)**
**Status**: ⏳ AUTOMATIC WITH DATABASE
**Used for**: Screenshots, visual assets, exported briefs
**Setup**: Automatically available with Supabase database

### ⏳ **Alternative: Cloudinary (OPTIONAL)**
**Used for**: Image processing, optimization, CDN delivery
**Setup:**
1. Go to [cloudinary.com](https://cloudinary.com)
2. Create free account
3. Get Cloud Name, API Key, API Secret
4. Add as `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## 🔧 **Development Tools**

### ✅ **Environment Already Configured**
**Status**: ✅ READY
- Node.js 20 ✅
- TypeScript ✅
- React 18 ✅
- Tailwind CSS ✅
- Drizzle ORM ✅

### ⏳ **Chrome Extension Development**
**Status**: ⏳ FUTURE PHASE
**Required for**: Web store publishing ($5 one-time fee)
**Setup**: Chrome Web Store Developer account (later phases)

---

## 📋 **Final Environment Variables Summary**

### **CRITICAL (Must Have):**
```env
DATABASE_URL=postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres
OPENAI_API_KEY=sk-... (✅ Already set)
GEMINI_API_KEY=AIzaSy... (⏳ Needed)
SESSION_SECRET=... (⏳ Needed)
BRIGHT_DATA_API_TOKEN=... (✅ Already set)
BRIGHT_DATA_BROWSER_USER=... (✅ Already set)
BRIGHT_DATA_BROWSER_PASS=... (✅ Already set)
```

### **OPTIONAL (Enhanced Features):**
```env
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
YOUTUBE_API_KEY=...
TWITTER_BEARER_TOKEN=...
SENDGRID_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## ⏱️ **Estimated Setup Time**

**Critical Path (Must Complete):** ~20 minutes
- Supabase Database: 10 minutes
- Gemini API: 5 minutes  
- Session Secret: 2 minutes
- Environment setup: 3 minutes

**Optional Enhancements:** ~45 minutes
- Platform APIs: 30 minutes
- Email service: 10 minutes
- File storage: 5 minutes

---

## 🚀 **Ready to Start Indicator**

**✅ MINIMUM VIABLE SETUP:**
- [ ] Supabase database created and connected
- [ ] Gemini API key obtained and added
- [ ] Session secret generated and added
- [ ] All critical environment variables set

**✅ FULL FEATURE SETUP:**
- [ ] All minimum viable setup complete
- [ ] Additional platform APIs configured
- [ ] Email service ready
- [ ] File storage configured

Once you complete the **MINIMUM VIABLE SETUP** checkboxes, we can start building immediately with full functionality!