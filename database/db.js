import dotenv from 'dotenv';
import pkg from 'pg';

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

export default pool;
