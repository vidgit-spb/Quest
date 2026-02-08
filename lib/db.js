import { Pool } from 'pg';

let pool;

const getPool = () => {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error('Missing DATABASE_URL or POSTGRES_URL environment variable');
  }

  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });

  return pool;
};

export const query = (text, params) => getPool().query(text, params);
