# Supabase Setup Guide - Content Radar Platform Migration

## Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new account if needed
2. Click "New Project"
3. Choose your organization
4. Set project name: "Content Radar Platform"
5. Set database password (save this securely)
6. Choose region closest to your users
7. Click "Create new project"

## Step 2: Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor" in the left sidebar
3. Copy the entire contents of `supabase-schema.sql` 
4. Paste into the SQL Editor
5. Click "Run" to execute the schema creation
6. Verify tables were created in the "Table Editor"

## Step 3: Get Database Connection Details

1. In your Supabase project, go to "Settings" → "Database"
2. Find the "Connection string" section
3. Copy the "URI" connection string
4. It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
5. Replace `[YOUR-PASSWORD]` with your actual database password

## Step 4: Update Environment Variables

Add to your Replit Secrets:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

You can find SUPABASE_URL and SUPABASE_ANON_KEY in:
- Settings → API → Project URL
- Settings → API → Project API keys → anon/public

## Step 5: Test Connection

Once environment variables are set, the application will automatically connect to Supabase instead of Neon.

## Benefits of This Migration

✅ **Clean Schema**: No legacy conflicts or mixed ID types
✅ **Better Performance**: Optimized indexes and relationships  
✅ **Enhanced Tooling**: Supabase dashboard for database management
✅ **Real-time Features**: Built-in subscriptions for live updates
✅ **Authentication Ready**: Supabase Auth integration available
✅ **Truth Analysis Framework**: Properly structured JSONB fields for AI analysis
✅ **Scalability**: UUID primary keys and proper foreign key relationships

## Next Steps After Migration

1. Test Truth Analysis Framework with clean database
2. Verify Chrome Extension capture functionality  
3. Test content radar trending analysis
4. Validate strategic brief generation
5. Update documentation with new architecture