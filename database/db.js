import dotenv from 'dotenv';
import pkg from 'pg';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const { Pool } = pkg;
const useSsl = process.env.DB_SSL === 'true';
const connectionString = process.env.DB_URL;

if (!connectionString) {
    throw new Error('Database connection string is not defined. Please set DB_URL in .env.');
}

const pool = new Pool({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : false
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const setupSqlPath = new URL('../setup.sql', import.meta.url);
const setupSql = await readFile(setupSqlPath, 'utf8');

try {
    await pool.query(setupSql);
} catch (error) {
    console.error('Database schema initialization failed:', error);
    throw error;
}

export default pool;
