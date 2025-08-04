# Supabase Connection Troubleshooting

## 🚨 **Current Issue**
Connection string: `postgresql://postgres:mVbhNdQlbom6iA3n@db.niakeovqfrhwaloglact.supabase.co:5432/postgres`

**Error**: `Could not connect to server` - DNS/Network failure

## 🔍 **Possible Causes**

### 1. **Project Paused/Inactive**
- Free tier projects pause after 1 week of inactivity
- **Solution**: Go to Supabase dashboard and click "Resume Project"

### 2. **Wrong Hostname Format**
- Some regions use different hostname patterns
- Expected format: `db.PROJECT_REF.supabase.co`
- Your format: `db.niakeovqfrhwaloglact.supabase.co` ✅ (looks correct)

### 3. **Project Not Fully Provisioned**
- New projects take 2-3 minutes to become active
- **Solution**: Wait and try again

### 4. **Wrong Connection Port**
- Try pooled connection (port 6543) instead of direct (port 5432)
- **Alternative URL**: `postgresql://postgres:mVbhNdQlbom6iA3n@db.niakeovqfrhwaloglact.supabase.co:6543/postgres`

## ✅ **Immediate Actions to Try**

1. **Check Project Status**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Look for project: should show "Active" status
   - If paused, click "Resume"

2. **Try Pooled Connection**
   - Change port from `:5432` to `:6543`
   - Pooled connections are more reliable

3. **Verify Connection String Source**
   - In Supabase dashboard: Settings → Database
   - Copy fresh connection string from "Connection string" section
   - Make sure you're using the "URI" format, not "psql"

4. **Test Different Connection Methods**
   ```
   Direct: postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres
   Pooled: postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:6543/postgres
   ```

## 🎯 **Next Steps**

### **Option A: Resume Existing Project**
1. Go to Supabase dashboard
2. Find your project (niakeovqfrhwaloglact)
3. Click "Resume" if paused
4. Test connection again

### **Option B: Try Pooled Connection**
Update connection string to use port 6543:
```
postgresql://postgres:mVbhNdQlbom6iA3n@db.niakeovqfrhwaloglact.supabase.co:6543/postgres
```

### **Option C: Create New Project**
If the project is corrupted:
1. Create new Supabase project
2. Get fresh connection string
3. Update DATABASE_URL in Replit

## 📝 **Current Workaround**
The app is working perfectly with memory storage while we resolve the database connection. All features are functional except data doesn't persist between restarts.

Once the Supabase connection is working, we'll switch back to persistent storage with a single code change.