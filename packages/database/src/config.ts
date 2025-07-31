import { config } from 'dotenv';

// Load environment variables
config();

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  connectionString?: string | undefined;
}

// Environment-specific configurations
export const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'conduit_dev',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production',
  connectionString: process.env.DATABASE_URL
};

// Connection pool configuration
export const poolConfig = {
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  min: parseInt(process.env.DB_POOL_MIN || '5', 10),
  idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10),
  acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10)
};

// Drizzle configuration for different environments
export const drizzleConfig = {
  development: {
    schema: './src/schema/index.ts',
    out: './migrations',
    driver: 'pg' as const,
    dbCredentials: dbConfig.connectionString
      ? { connectionString: dbConfig.connectionString }
      : {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.username,
        password: dbConfig.password,
        database: dbConfig.database
      }
  },
  production: {
    schema: './src/schema/index.ts',
    out: './migrations',
    driver: 'pg' as const,
    dbCredentials: {
      connectionString: dbConfig.connectionString!
    }
  }
};
