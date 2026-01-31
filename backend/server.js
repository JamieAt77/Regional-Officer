const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection (Railway built-in database)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway.app') ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'nhsro-jwt-secret-2024';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Regional Officer API is running' });
});

// ===== AUTHENTICATION =====

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Get user from database
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ===== CASES =====

// Get all cases for a user
app.get('/api/cases', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM cases WHERE user_id = $1 ORDER BY created_date DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// Get a single case
app.get('/api/cases/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM cases WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching case:', error);
    res.status(500).json({ error: 'Failed to fetch case' });
  }
});

// Create a new case
app.post('/api/cases', authenticateToken, async (req, res) => {
  try {
    const {
      case_reference,
      member_number,
      member_name,
      join_date,
      employer,
      workplace,
      address,
      postcode,
      job_title,
      email,
      phone,
      issue,
      status,
      priority,
      case_type,
      deadline
    } = req.body;

    const result = await pool.query(
      `INSERT INTO cases (
        user_id, case_reference, member_number, member_name, join_date,
        employer, workplace, address, postcode, job_title, email, phone,
        issue, status, priority, case_type, deadline, created_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
      RETURNING *`,
      [
        req.user.userId, case_reference, member_number, member_name, join_date,
        employer, workplace, address, postcode, job_title, email, phone,
        issue, status || 'new', priority || 'high', case_type || 'Member Assist', deadline
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ error: 'Failed to create case' });
  }
});

// Update a case
app.put('/api/cases/:id', authenticateToken, async (req, res) => {
  try {
    const {
      case_reference,
      member_number,
      member_name,
      join_date,
      employer,
      workplace,
      address,
      postcode,
      job_title,
      email,
      phone,
      issue,
      status,
      priority,
      case_type,
      deadline
    } = req.body;

    const result = await pool.query(
      `UPDATE cases SET
        case_reference = $2,
        member_number = $3,
        member_name = $4,
        join_date = $5,
        employer = $6,
        workplace = $7,
        address = $8,
        postcode = $9,
        job_title = $10,
        email = $11,
        phone = $12,
        issue = $13,
        status = $14,
        priority = $15,
        case_type = $16,
        deadline = $17
      WHERE id = $1 AND user_id = $18
      RETURNING *`,
      [
        req.params.id, case_reference, member_number, member_name, join_date,
        employer, workplace, address, postcode, job_title, email, phone,
        issue, status, priority, case_type, deadline, req.user.userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating case:', error);
    res.status(500).json({ error: 'Failed to update case' });
  }
});

// Delete a case
app.delete('/api/cases/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM cases WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Error deleting case:', error);
    res.status(500).json({ error: 'Failed to delete case' });
  }
});

// ===== HOSPITALS =====

// Get all hospitals
app.get('/api/hospitals', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM hospitals WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
});

// Create a hospital
app.post('/api/hospitals', authenticateToken, async (req, res) => {
  try {
    const { name, address, postcode, phone, email } = req.body;

    const result = await pool.query(
      'INSERT INTO hospitals (user_id, name, address, postcode, phone, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.userId, name, address, postcode, phone, email]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating hospital:', error);
    res.status(500).json({ error: 'Failed to create hospital' });
  }
});

// Update a hospital
app.put('/api/hospitals/:id', authenticateToken, async (req, res) => {
  try {
    const { name, address, postcode, phone, email } = req.body;

    const result = await pool.query(
      'UPDATE hospitals SET name = $2, address = $3, postcode = $4, phone = $5, email = $6 WHERE id = $1 AND user_id = $7 RETURNING *',
      [req.params.id, name, address, postcode, phone, email, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating hospital:', error);
    res.status(500).json({ error: 'Failed to update hospital' });
  }
});

// Delete a hospital
app.delete('/api/hospitals/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM hospitals WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json({ message: 'Hospital deleted successfully' });
  } catch (error) {
    console.error('Error deleting hospital:', error);
    res.status(500).json({ error: 'Failed to delete hospital' });
  }
});

// ===== MEETINGS =====

// Get all meetings
app.get('/api/meetings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM meetings WHERE user_id = $1 ORDER BY date DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

// Create a meeting
app.post('/api/meetings', authenticateToken, async (req, res) => {
  try {
    const { title, date, location, attendees, notes } = req.body;

    const result = await pool.query(
      'INSERT INTO meetings (user_id, title, date, location, attendees, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.userId, title, date, location, attendees, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

// Update a meeting
app.put('/api/meetings/:id', authenticateToken, async (req, res) => {
  try {
    const { title, date, location, attendees, notes } = req.body;

    const result = await pool.query(
      'UPDATE meetings SET title = $2, date = $3, location = $4, attendees = $5, notes = $6 WHERE id = $1 AND user_id = $7 RETURNING *',
      [req.params.id, title, date, location, attendees, notes, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
});

// Delete a meeting
app.delete('/api/meetings/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM meetings WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
});

// ===== DOCUMENTS =====

// Get all documents
app.get('/api/documents', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Create a document
app.post('/api/documents', authenticateToken, async (req, res) => {
  try {
    const { name, type, content } = req.body;

    const result = await pool.query(
      'INSERT INTO documents (user_id, name, type, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.userId, name, type, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// Delete a document
app.delete('/api/documents/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// ===== TEAM UPDATES =====

// Get all team updates
app.get('/api/team-updates', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM team_updates WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching team updates:', error);
    res.status(500).json({ error: 'Failed to fetch team updates' });
  }
});

// Create a team update
app.post('/api/team-updates', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;

    const result = await pool.query(
      'INSERT INTO team_updates (user_id, message) VALUES ($1, $2) RETURNING *',
      [req.user.userId, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating team update:', error);
    res.status(500).json({ error: 'Failed to create team update' });
  }
});

// Delete a team update
app.delete('/api/team-updates/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM team_updates WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team update not found' });
    }

    res.json({ message: 'Team update deleted successfully' });
  } catch (error) {
    console.error('Error deleting team update:', error);
    res.status(500).json({ error: 'Failed to delete team update' });
  }
});

// ===== STATISTICS =====

// Get dashboard statistics
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const totalCasesResult = await pool.query(
      'SELECT COUNT(*) as count FROM cases WHERE user_id = $1',
      [req.user.userId]
    );

    const activeCasesResult = await pool.query(
      "SELECT COUNT(*) as count FROM cases WHERE user_id = $1 AND status IN ('new', 'in-progress')",
      [req.user.userId]
    );

    const urgentCasesResult = await pool.query(
      "SELECT COUNT(*) as count FROM cases WHERE user_id = $1 AND deadline < NOW() + INTERVAL '48 hours'",
      [req.user.userId]
    );

    const hospitalsResult = await pool.query(
      'SELECT COUNT(*) as count FROM hospitals WHERE user_id = $1',
      [req.user.userId]
    );

    const meetingsResult = await pool.query(
      'SELECT COUNT(*) as count FROM meetings WHERE user_id = $1',
      [req.user.userId]
    );

    res.json({
      totalCases: parseInt(totalCasesResult.rows[0].count),
      activeCases: parseInt(activeCasesResult.rows[0].count),
      urgentCases: parseInt(urgentCasesResult.rows[0].count),
      totalHospitals: parseInt(hospitalsResult.rows[0].count),
      totalMeetings: parseInt(meetingsResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Regional Officer API running on port ${port}`);
});