import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error('Missing DATABASE_URL or POSTGRES_URL environment variable');
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

export const query = (text, params) => pool.query(text, params);
