const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const createDefaultUser = async () => {
  try {
    const password = 'nhsro2024';
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING RETURNING *',
      ['nhsro', hashedPassword]
    );

    if (result.rows.length > 0) {
      console.log('Default user created successfully:');
      console.log('Username: nhsro');
      console.log('Password: nhsro2024');
    } else {
      console.log('Default user already exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating default user:', error);
    process.exit(1);
  }
};

createDefaultUser();