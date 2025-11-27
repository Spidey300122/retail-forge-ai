import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Make sure process.env.DATABASE_URL is defined!
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is missing in .env file');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Ensure this line is exactly as follows to avoid type errors
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on PostgreSQL client', err);
  process.exit(-1);
});

export default pool;