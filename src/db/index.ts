import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "./schema.ts";

export const isSqlConfigured = !!(process.env.DATABASE_URL || (process.env.SQL_HOST && process.env.SQL_USER && process.env.SQL_DB_NAME));

export const createPool = () => {
  if (!isSqlConfigured) {
    return new Pool({ connectionString: 'postgres://localhost:5432/mock' }); // Placeholder to avoid crash
  }
  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
      ssl: process.env.DATABASE_URL.includes('sslmode=') || process.env.DATABASE_URL.includes('localhost') ? undefined : { rejectUnauthorized: false }
    });
  }
  return new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 5000,
  });
};

const pool = createPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

export const db = drizzle(pool, { schema });
