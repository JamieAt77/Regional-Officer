# Backend Deployment to Render with Supabase

## Pre-deployment Checklist ✅

- [x] Supabase project created: `regional-officer`
- [x] Supabase database configured
- [x] Backend code updated for Supabase
- [x] All hospital data prepared (14 hospitals, 1,395 members)
- [x] Environment variables configured

## Deploy Backend to Render

### Step 1: Create New Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect to: `JamieAt77/Regional-Officer` repository
4. Configure the service:
   - **Name**: `regional-officer-backend`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`

### Step 2: Add Environment Variables

In the **Environment** section of your service settings, add these variables:

```
DATABASE_URL=postgresql://postgres:xehfi3-fodkod-Cerref@db.wnvypsxbtmypwurqrptu.supabase.co:5432/postgres
SUPABASE_URL=https://wnvypsxbtmypwurqrptu.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indudnlwc3hidG15cHd1cnFycHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NDEwMDcsImV4cCI6MjA4NTQxNzAwN30.mcrDuqozMmHGr2oWFbds9Ok5WExUoGfOzXe1fvsWUa8
JWT_SECRET=nhsro2024-secret-key
PORT=3001
NODE_ENV=production
```

### Step 3: Deploy

Click **"Create Web Service"** to deploy.

The backend will:
1. Install dependencies
2. Start the server
3. Connect to Supabase
4. Initialize database tables automatically
5. Be ready to accept requests

### Step 4: Test Backend

Once deployed, visit: `https://regional-officer-backend.onrender.com`

You should see the server is running.

## Create Default User

After the backend is deployed, you need to create your login user. The backend server will automatically create the tables, but we need to create the user manually.

### Option 1: Use Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Open your `regional-officer` project
3. Go to **Table Editor**
4. Click on `users` table
5. Click **Insert row**
6. Add:
   - `username`: `nhsro`
   - `password_hash`: You'll need to hash the password first

### Option 2: Use the init-user script

After backend deployment, run this command locally (you'll need the backend code):

```bash
cd Regional-Officer/backend
npm install
node init-user.js
```

This will create the default user:
- **Username**: `nhsro`
- **Password**: `nhsro2024`

## Update Frontend

The frontend is already configured to use `https://regional-officer-backend.onrender.com` as the API URL.

No changes needed - it will automatically connect once the backend is deployed!

## Test Cross-Device Sync

After backend deployment:

1. On Desktop:
   - Go to your Regional Officer site
   - Login with: `nhsro` / `nhsro2024`
   - Create a test case

2. On Phone:
   - Go to same site
   - Login with: `nhsro` / `nhsro2024`
   - The case should appear!

## Troubleshooting

### Backend not starting?
- Check Render logs
- Verify environment variables are correct
- Make sure Supabase database is accessible

### Can't login?
- Verify user was created in Supabase `users` table
- Check password is correct
- Check backend logs for errors

### Data not syncing?
- Verify backend is running
- Check API URL in frontend `.env` file
- Check network connectivity

## Cost

- **Render Backend**: FREE (free tier)
- **Supabase Database**: FREE (up to 500MB)
- **Total Cost**: $0/month ✅

## Next Steps

After backend is deployed:
1. Test login functionality
2. Create a test case
3. Verify sync across devices
4. Add your hospital information to the system
5. Improve NHS Hub mobile layout