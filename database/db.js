import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DB_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('FATAL: No database connection string configured. Set DB_URL or DATABASE_URL.');
  process.exit(1);
}

let ssl = false;
try {
  const parsedUrl = new URL(connectionString);
  const hostname = parsedUrl.hostname;
  if (process.env.NODE_ENV === 'production' || (hostname !== '127.0.0.1' && hostname !== 'localhost')) {
    ssl = { rejectUnauthorized: false };
  }
} catch (error) {
  console.warn('Warning: Failed to parse DB connection string for SSL detection.', error.message);
  ssl = process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false;
}

const pool = new Pool({
  connectionString,
  ssl,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 60000,
  max: 20
});

pool.once('connect', () => {
  console.log('PostgreSQL database connected successfully.');
});

pool.on('error', (err) => {
  console.error('Unexpected database client pool error:', err.message);
});

export default pool;
