# Supabase Environment Setup Instructions

## Add Database Connection to Replit Secrets

1. **Open Replit Secrets Panel**
   - Look for the "Secrets" tab in your Replit sidebar (lock icon)
   - Click on "Secrets" to open the environment variables panel

2. **Add SUPABASE_DATABASE_URL**
   - Click "New Secret" 
   - Set Key: `SUPABASE_DATABASE_URL`
   - Set Value: `postgresql://postgres:Dvsi6c45qzuxAgDe@db.niakeovqfrhwaloglact.supabase.co:5432/postgres`
   - Click "Add Secret"

3. **Restart the Application**
   - After adding the secret, the server will automatically restart
   - You should see "Database URL source: Supabase" in the logs instead of "Neon"

## What This Enables

✅ **Clean Database**: No more schema conflicts or legacy table issues
✅ **Truth Analysis Framework**: Proper JSONB structure for 4-layer analysis  
✅ **Chrome Extension**: Capture functionality with all required fields
✅ **Strategic Intelligence**: Content radar trending analysis
✅ **Brief Generation**: Complete workflow from capture to strategic brief

## Test After Setup

Once the secret is added, test:
1. Login with admin@strategist.com / password
2. Create captures via Chrome Extension
3. View Truth Analysis results
4. Generate strategic briefs

The application will automatically switch to the Supabase database and all functionality should work seamlessly.