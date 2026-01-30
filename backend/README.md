# Regional Officer Backend API

## Overview
This is the backend API for the Regional Officer Case Management System. It provides RESTful endpoints for managing cases, hospitals, meetings, documents, and team updates with PostgreSQL database storage.

## Features
- JWT Authentication
- RESTful API endpoints
- PostgreSQL database
- User-specific data isolation
- Secure password hashing

## Setup Instructions

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env` with your database credentials:
```
DATABASE_URL=postgresql://user:password@localhost:5432/regional_officer
JWT_SECRET=your-secret-key-here
PORT=3001
```

4. Start PostgreSQL database (if not running)

5. Initialize default user:
```bash
node init-user.js
```

6. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/login` - Login with username and password

### Cases
- `GET /api/cases` - Get all cases
- `POST /api/cases` - Create new case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `POST /api/hospitals` - Create new hospital
- `DELETE /api/hospitals/:id` - Delete hospital

### Meetings
- `GET /api/meetings` - Get all meetings
- `POST /api/meetings` - Create new meeting
- `DELETE /api/meetings/:id` - Delete meeting

### Documents
- `GET /api/documents` - Get all documents
- `POST /api/documents` - Create new document
- `DELETE /api/documents/:id` - Delete document

### Team Updates
- `GET /api/team-updates` - Get all team updates
- `POST /api/team-updates` - Create new team update

## Default User
- Username: `nhsro`
- Password: `nhsro2024`

## Deployment

### Render Deployment

1. Push this code to GitHub
2. Create a new web service on Render
3. Select "Node.js" as the runtime
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && node server.js`
6. Add PostgreSQL database
7. Set environment variables:
   - `DATABASE_URL` (auto-populated from database)
   - `JWT_SECRET` (use a strong secret)
   - `PORT` (default: 3001)
8. Deploy

After deployment, run the init-user script via Render shell to create the default user.