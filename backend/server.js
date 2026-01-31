const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Database connection (still using pg for direct SQL queries)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create cases table
    await pool.query(`
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
      )
    `);

    // Create hospitals table
    await pool.query(`
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
      )
    `);

    // Create meetings table
    await pool.query(`
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
      )
    `);

    // Create documents table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255),
        type VARCHAR(100),
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create team_updates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_updates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'nhsro2024-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'nhsro2024-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Cases endpoints
app.get('/api/cases', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM cases WHERE user_id = $1 ORDER BY created_date DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

app.post('/api/cases', authenticateToken, async (req, res) => {
  try {
    const {
      caseReference,
      memberNumber,
      memberName,
      joinDate,
      employer,
      workplace,
      address,
      postcode,
      jobTitle,
      email,
      phone,
      issue,
      createdDate,
      status,
      priority,
      caseType,
      deadline
    } = req.body;

    const result = await pool.query(
      `INSERT INTO cases (
        user_id, case_reference, member_number, member_name, join_date,
        employer, workplace, address, postcode, job_title, email, phone,
        issue, created_date, status, priority, case_type, deadline
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        req.user.id, caseReference, memberNumber, memberName, joinDate,
        employer, workplace, address, postcode, jobTitle, email, phone,
        issue, createdDate, status, priority, caseType, deadline
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ error: 'Failed to create case' });
  }
});

app.put('/api/cases/:id', authenticateToken, async (req, res) => {
  try {
    const { status, priority, issue } = req.body;
    const result = await pool.query(
      `UPDATE cases SET status = $1, priority = $2, issue = $3
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [status, priority, issue, req.params.id, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating case:', error);
    res.status(500).json({ error: 'Failed to update case' });
  }
});

app.delete('/api/cases/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM cases WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Case deleted' });
  } catch (error) {
    console.error('Error deleting case:', error);
    res.status(500).json({ error: 'Failed to delete case' });
  }
});

// Hospitals endpoints
app.get('/api/hospitals', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM hospitals WHERE user_id = $1 ORDER BY name',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
});

app.post('/api/hospitals', authenticateToken, async (req, res) => {
  try {
    const { name, address, postcode, phone, email } = req.body;
    const result = await pool.query(
      `INSERT INTO hospitals (user_id, name, address, postcode, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, name, address, postcode, phone, email]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create hospital' });
  }
});

app.delete('/api/hospitals/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM hospitals WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Hospital deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete hospital' });
  }
});

// Meetings endpoints
app.get('/api/meetings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM meetings WHERE user_id = $1 ORDER BY date DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

app.post('/api/meetings', authenticateToken, async (req, res) => {
  try {
    const { title, date, location, attendees, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO meetings (user_id, title, date, location, attendees, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, title, date, location, attendees, notes]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

app.delete('/api/meetings/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM meetings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Meeting deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
});

// Documents endpoints
app.get('/api/documents', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

app.post('/api/documents', authenticateToken, async (req, res) => {
  try {
    const { name, type, content } = req.body;
    const result = await pool.query(
      `INSERT INTO documents (user_id, name, type, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, name, type, content]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create document' });
  }
});

app.delete('/api/documents/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM documents WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Team Updates endpoints
app.get('/api/team-updates', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM team_updates WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team updates' });
  }
});

app.post('/api/team-updates', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const result = await pool.query(
      'INSERT INTO team_updates (user_id, message) VALUES ($1, $2) RETURNING *',
      [req.user.id, message]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team update' });
  }
});

// Start server and initialize database
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
  });
});