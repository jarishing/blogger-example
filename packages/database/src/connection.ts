import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { dbConfig, poolConfig } from './config';
import * as schema from './schema';

// Create connection pool
export const createPool = (): Pool => {
  if (dbConfig.connectionString) {
    return new Pool({
      connectionString: dbConfig.connectionString,
      max: poolConfig.max,
      min: poolConfig.min,
      idleTimeoutMillis: poolConfig.idle,
      connectionTimeoutMillis: poolConfig.acquire,
      ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false
    });
  }

  return new Pool({
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.username,
    password: dbConfig.password,
    max: poolConfig.max,
    min: poolConfig.min,
    idleTimeoutMillis: poolConfig.idle,
    connectionTimeoutMillis: poolConfig.acquire,
    ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false
  });
};

// Global connection pool instance
let pool: Pool | undefined;

export const getPool = (): Pool => {
  if (!pool) {
    pool = createPool();
  }
  return pool;
};

// Create Drizzle database instance
export const createDatabase = (customPool?: Pool) => {
  const dbPool = customPool || getPool();
  return drizzle(dbPool, { schema });
};

// Default database instance
export const db = createDatabase();

// Connection utilities
export const closeConnection = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
};

export const testConnection = async (): Promise<boolean> => {
  try {
    const testPool = getPool();
    const client = await testPool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database connection test failed:', error);
    return false;
  }
};

// Export types for use in other packages
export type Database = ReturnType<typeof createDatabase>;
