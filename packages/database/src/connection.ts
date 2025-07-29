import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connection string - in production this should come from environment variables
const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/realworld";

// Create the postgres connection
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create the drizzle database instance
export const db = drizzle(client, { 
  schema,
  logger: process.env.NODE_ENV === "development",
});

// Export the client for direct access if needed
export { client };

// Type for the database instance
export type Database = typeof db;