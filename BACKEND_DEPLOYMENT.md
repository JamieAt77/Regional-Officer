# Regional Officer System - Backend Deployment Guide

## Prerequisites
- Supabase account (free)
- Render account (free)
- GitHub account

---

## Step 1: Set Up Supabase Database

### 1.1 Create Database Tables

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `wnvypsxbtmypwurqrptu`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the SQL schema from `backend/init-database.sql`:

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

6. Click **Run** to create all tables

### 1.2 Create Default User

You have two options to create the default user:

#### Option A: Using Supabase Table Editor (Recommended - Easier)

1. In Supabase Dashboard, click **Table Editor** in the left sidebar
2. Click on the **users** table
3. Click **Insert row** (or the + button)
4. Enter the following values:

| Column | Value |
|--------|-------|
| `username` | `nhsro` |
| `password_hash` | `$2a$10$T7QS6dNegfKoid3NeKANKOM6QUUFma9q7zDGgqGLg7R0HGZrt4iM2` |

5. Click **Save**

**Login credentials after setup:**
- Username: `nhsro`
- Password: `nhsro2024`

#### Option B: Using SQL Editor

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Run this SQL command:

```sql
INSERT INTO users (username, password_hash) 
VALUES ('nhsro', '$2a$10$T7QS6dNegfKoid3NeKANKOM6QUUFma9q7zDGgqGLg7R0HGZrt4iM2')
ON CONFLICT (username) DO NOTHING;
```

---

## Step 2: Deploy Backend to Render

### 2.1 Get Supabase Credentials

1. Go to your Supabase project settings: https://supabase.com/dashboard/project/wnvypsxbtmypwurqrptu/settings/api
2. Copy these values (you already have them):
   - **Project URL**: `https://wnvypsxbtmypwurqrptu.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (starts with `eyJhbGci`)
   - **service_role key**: Get from "service_role (secret)" section (for admin operations)

### 2.2 Create Render Service

1. Go to Render Dashboard: https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub repository: `JamieAt77/Regional-Officer`
4. Configure the service:

**Basic Settings:**
- **Name**: `regional-officer-backend`
- **Region**: `Frankfurt` (or closest to you)
- **Branch**: `main`

**Build Settings:**
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Advanced Settings:**
- **Instance Type**: `Free`

5. Click **Advanced** → **Environment Variables**
6. Add these environment variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres:[YOUR-PASSWORD]@db.wnvypsxbtmypwurqrptu.supabase.co:5432/postgres` |
| `SUPABASE_URL` | `https://wnvypsxbtmypwurqrptu.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your anon key) |
| `SUPABASE_SERVICE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your service_role key) |
| `PORT` | `10000` |
| `JWT_SECRET` | Generate a random string (e.g., `nhsro-jwt-secret-2024`) |

**Important**: For `DATABASE_URL`, you need your database password:
1. Go to Supabase Dashboard → Project Settings → Database
2. Scroll to "Connection string" or "Database password"
3. Copy the password and replace `[YOUR-PASSWORD]` in the connection string

**Example DATABASE_URL:**
```
postgresql://postgres:your_actual_password@db.wnvypsxbtmypwurqrptu.supabase.co:5432/postgres
```

7. Click **Create Web Service**
8. Wait for deployment to complete (2-3 minutes)

### 2.3 Verify Backend Deployment

1. Once deployed, Render will provide a URL like: `https://regional-officer-backend.onrender.com`
2. Test the health endpoint: `https://regional-officer-backend.onrender.com/api/health`
3. You should see: `{"status":"ok","message":"Regional Officer API is running"}`

---

## Step 3: Update Frontend Configuration

### 3.1 Update Frontend .env

1. In your GitHub repository, update `src/.env` (or create it):
2. Add the backend URL:

```env
VITE_API_URL=https://regional-officer-backend.onrender.com/api
```

3. Commit and push to GitHub

### 3.2 Trigger Frontend Rebuild

1. Go to Render Dashboard → `regional-officer` service
2. Click **Manual Deploy** → **Clear build cache & deploy**
3. Wait for deployment to complete

---

## Step 4: Test the System

### 4.1 Login Test

1. Go to your frontend: `https://regional-officer.onrender.com`
2. Login with:
   - Username: `nhsro`
   - Password: `nhsro2024`
3. You should see the dashboard with statistics

### 4.2 Create Test Case

1. Click "Add Member Assist"
2. Fill in the form with test data
3. Click "Save Case"
4. Verify the case appears in the dashboard

### 4.3 Test Cross-Device Sync

1. Open the app on a different device (e.g., your phone)
2. Login with the same credentials
3. The case you created should now appear

---

## Troubleshooting

### Issue: Database Connection Error

**Error**: `connection refused` or `password authentication failed`

**Solution**:
- Double-check your `DATABASE_URL` in Render environment variables
- Verify the database password in Supabase Dashboard
- Make sure Supabase project is active

### Issue: User Already Exists Error

**Error**: When running init-user.js, it says user already exists

**Solution**: This is normal - just means the user was already created. You can skip this step.

### Issue: Frontend Can't Connect to Backend

**Error**: CORS error or connection refused

**Solution**:
- Verify `VITE_API_URL` in frontend matches the deployed backend URL
- Check backend server is running (test `/api/health` endpoint)
- Check CORS settings in `backend/server.js` (line 16)

### Issue: 404 on Backend Routes

**Error**: All API endpoints return 404

**Solution**:
- Make sure the build directory in Render is set to `backend`
- Verify `server.js` is in the root of the build directory
- Check the logs in Render for errors

---

## Environment Variables Summary

### Supabase Variables (in backend):

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `DATABASE_URL` | PostgreSQL connection | Supabase Dashboard → Database → Connection String |
| `SUPABASE_URL` | Supabase API URL | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Public API key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_KEY` | Admin API key | Supabase Dashboard → Settings → API (service_role) |
| `JWT_SECRET` | JWT token secret | Create your own random string |
| `PORT` | Server port | `10000` (Render default) |

### Frontend Variables:

| Variable | Purpose | Value |
|----------|---------|-------|
| `VITE_API_URL` | Backend API URL | `https://regional-officer-backend.onrender.com/api` |

---

## Cost Summary

- **Render Backend**: $0/month (Free tier)
- **Supabase Database**: $0/month (500MB free tier)
- **Render Frontend**: $0/month (Static site)
- **Total**: $0/month

---

## Support

If you encounter any issues:

1. Check Render deployment logs
2. Check Supabase logs in Dashboard
3. Verify all environment variables are correct
4. Test backend health endpoint: `https://regional-officer-backend.onrender.com/api/health`