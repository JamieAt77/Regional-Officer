# Regional Officer System - Railway Deployment Guide

## Why Railway?

✅ **Built-in PostgreSQL** - No need for external database providers  
✅ **Easy deployment** - One-click deployment from GitHub  
✅ **Environment variables** - Easy to manage secrets  
✅ **Logs & metrics** - Built-in monitoring  
✅ **Your hobby subscription** - You already have access!

---

## Prerequisites

- Railway account with hobby subscription
- GitHub account
- GitHub repository: `JamieAt77/Regional-Officer`

---

## Overview

We'll deploy to Railway as **two separate services**:

1. **Frontend** (Regional Officer React App) - Static site
2. **Backend** (Express.js API + PostgreSQL) - With built-in Railway database

---

## Step 1: Deploy Backend with Database

### 1.1 Create Railway Project

1. Go to [Railway.app](https://railway.app) and login
2. Click **New Project** → **Deploy from GitHub repo**
3. Select repository: `JamieAt77/Regional-Officer`
4. Configure:

**Basic Settings:**
- **Name**: `regional-officer-backend`
- **Branch**: `main`

**Root Directory**: 
- Click "Settings" → "General"
- Set **Root Directory** to: `backend`

**Build Settings:**
- Click "Settings" → "Build"
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Environment Variables**:
- Click "Settings" → "Variables"
- Add these variables:

| Key | Value |
|-----|-------|
| `PORT` | `10000` |
| `JWT_SECRET` | `nhsro-jwt-secret-2024` (or any random string) |

**Note**: We don't need to set DATABASE_URL yet - Railway will create this automatically when we add the database.

5. Click **Deploy**

### 1.2 Add PostgreSQL Database

1. After deployment starts, click **+ New Service** in your project
2. Select **Database** → **PostgreSQL**
3. Railway will create a PostgreSQL database
4. Give it a few seconds to initialize

### 1.3 Connect Database to Backend

1. Click on the **Backend Service** in Railway
2. Click **Variables** tab
3. Click **+ New Variable**
4. Add the database connection:

**Option A: Automatic (Recommended)**
- Railway provides the `DATABASE_URL` variable automatically
- It will look like: `postgresql://postgres:[password]@[host]/[database]`
- The backend will use this automatically

**Option B: Manual**
If you need to set it manually:
- Click on the **Database Service**
- Copy the **Connection String**
- Add it as `DATABASE_URL` in Backend Variables

### 1.4 Initialize Database

Now we need to create the tables and default user. You have two options:

#### Option A: Use Railway Console (Easiest)

1. Click on the **Database Service** in Railway
2. Click **Console** tab
3. Click **Open Console**
4. Copy and paste this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  case_reference VARCHAR(50),
  member_number VARCHAR(50),
  member_name VARCHAR(255),
  join_date VARCHAR(50),
  employer VARCHAR(255),
  workplace VARCHAR(255),
  address TEXT,
  postcode VARCHAR(20),
  job_title VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  issue TEXT,
  created_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'new',
  priority VARCHAR(50) DEFAULT 'high',
  case_type VARCHAR(50) DEFAULT 'Member Assist',
  deadline TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255),
  address TEXT,
  postcode VARCHAR(20),
  phone VARCHAR(50),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255),
  date TIMESTAMP,
  location VARCHAR(255),
  attendees TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255),
  type VARCHAR(100),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create team_updates table
CREATE TABLE IF NOT EXISTS team_updates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

5. Click **Execute** (or press Enter)
6. You should see: "Success. No rows returned"

7. Now create the default user:

```sql
INSERT INTO users (username, password_hash) 
VALUES ('nhsro', '$2a$10$T7QS6dNegfKoid3NeKANKOM6QUUFma9q7zDGgqGLg7R0HGZrt4iM2')
ON CONFLICT (username) DO NOTHING;
```

8. Click **Execute**

#### Option B: Use Railway CLI (Advanced)

If you have Railway CLI installed:

```bash
railway run node setup-database.js
```

### 1.5 Get Backend URL

1. Click on the **Backend Service**
2. Click **Settings** → **General**
3. Copy the **Domain** URL
   - Example: `https://regional-officer-backend-production.up.railway.app`
4. Test the health endpoint:
   - Visit: `https://[your-backend-url]/api/health`
   - You should see: `{"status":"ok","message":"Regional Officer API is running"}`

---

## Step 2: Deploy Frontend

### 2.1 Create Frontend Service

1. Click **+ New Service** in your Railway project
2. Select **Deploy from GitHub repo**
3. Select repository: `JamieAt77/Regional-Officer`
4. Configure:

**Basic Settings:**
- **Name**: `regional-officer-frontend`
- **Branch**: `main`

**Build Settings:**
- Click "Settings" → "Build"
- **Build Command**: `npm install && npm run build`
- **Start Command**: Leave empty (static site)

**Environment Variables**:
- Click "Settings" → "Variables"
- Add these variables:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://[your-backend-url]/api` (replace with your backend URL from Step 1.5) |

5. Click **Deploy**

### 2.2 Get Frontend URL

1. Click on the **Frontend Service**
2. Click **Settings** → "General"
3. Copy the **Domain** URL
   - Example: `https://regional-officer-frontend-production.up.railway.app`

---

## Step 3: Test the System

### 3.1 Access the Application

1. Go to your frontend URL
   - Example: `https://regional-officer-frontend-production.up.railway.app`
2. Login with:
   - **Username**: `nhsro`
   - **Password**: `nhsro2024`
3. You should see the dashboard with statistics

### 3.2 Create Test Case

1. Click **Add Member Assist**
2. Fill in the form with test data
3. Click **Save Case**
4. Verify the case appears in the dashboard

### 3.3 Test Cross-Device Sync

1. Open the app on a different device (e.g., your phone)
2. Login with the same credentials
3. The case you created should now appear

---

## Step 4: Environment Variables Reference

### Backend Environment Variables

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Auto-generated by Railway | ✅ |
| `PORT` | `10000` | ✅ |
| `JWT_SECRET` | `nhsro-jwt-secret-2024` (or your own) | ✅ |

### Frontend Environment Variables

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_API_URL` | Backend API URL | ✅ |

---

## Step 5: Railway Features

### View Logs

1. Click on any service
2. Click **Logs** tab
3. View real-time logs for debugging

### Database Management

1. Click on the **Database Service**
2. **Console** - Run SQL queries
3. **Metrics** - View database performance
4. **Backups** - Automatic backups included

### Update Code

1. Push changes to GitHub
2. Railway auto-detects and redeploys
3. Click **Deploy** tab to see build progress

### Custom Domains

1. Click on any service
2. Click **Settings** → "Networking"
3. Add your custom domain

---

## Step 6: Cost (Hobby Subscription)

With Railway Hobby subscription:

| Service | Cost |
|---------|------|
| Frontend (Static) | $0/month |
| Backend (Node.js) | $5/month (512MB RAM) |
| PostgreSQL Database | $5/month (256MB storage) |
| **Total** | **$10/month** |

---

## Troubleshooting

### Issue: Database Connection Error

**Error**: `connection refused` or `password authentication failed`

**Solution**:
1. Check that `DATABASE_URL` is set in backend variables
2. Verify the database service is running
3. Check Railway logs for detailed error messages

### Issue: Frontend Can't Connect to Backend

**Error**: CORS error or connection refused

**Solution**:
1. Verify `VITE_API_URL` matches the backend URL exactly
2. Check backend is running (test `/api/health` endpoint)
3. Check CORS settings in `backend/server.js` (line 16)

### Issue: Build Failures

**Error**: Build fails during deployment

**Solution**:
1. Check **Logs** tab for detailed error
2. Verify root directory is set correctly
3. Ensure `package.json` has correct scripts

### Issue: Database Not Initializing

**Error**: Tables not created after running SQL

**Solution**:
1. Make sure you're in the correct database console
2. Check Railway logs for SQL errors
3. Verify SQL syntax is correct

---

## Migration from Render

If you already have data on Render:

1. **Export data from Render PostgreSQL**:
   - Use `pg_dump` or Railway CLI
2. **Import to Railway**:
   ```bash
   railway run psql [connection-string] < dump.sql
   ```
3. **Update frontend**:
   - Change `VITE_API_URL` to Railway backend URL

---

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway Pricing](https://railway.app/pricing)
- [PostgreSQL on Railway](https://docs.railway.app/guides/postgresql)

---

## Support

If you encounter any issues:

1. Check Railway service logs
2. Check database console for SQL errors
3. Verify all environment variables are set
4. Test backend health endpoint: `https://[backend-url]/api/health`
5. Check Railway status: https://status.railway.app

---

## Quick Reference

### URLs (Replace with your actual URLs)

- **Frontend**: `https://regional-officer-frontend-production.up.railway.app`
- **Backend**: `https://regional-officer-backend-production.up.railway.app`
- **Backend API**: `https://regional-officer-backend-production.up.railway.app/api`

### Login Credentials

- **Username**: `nhsro`
- **Password**: `nhsro2024`

### Key Commands

```bash
# Build locally
npm run build

# Start backend locally
cd backend && node server.js

# Test health endpoint
curl https://[backend-url]/api/health
```