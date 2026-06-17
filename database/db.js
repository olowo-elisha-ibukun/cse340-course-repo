import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DB_URL || process.env.DATABASE_URL;

// Allow explicit control over SSL via DB_SSL env var (set to 'true' to enable)
const dbSslEnv = (process.env.DB_SSL || '').toLowerCase();
const ssl = dbSslEnv === 'true' ? { rejectUnauthorized: false } : false;

const pool = new Pool({
  connectionString,
  ssl,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

pool.once('connect', () => {
  console.log('PostgreSQL database connected successfully via internal network.');
});

pool.on('error', (err) => {
  console.error('Unexpected database client pool error:', err.message);
});

export default pool;
