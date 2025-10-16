import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolConfig } from 'pg';
import * as schema from './schema';

// Parse DATABASE_URL manually to ensure proper typing
const parseConnectionString = (url: string) => {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port, 10),
    database: parsed.pathname.slice(1),
    user: parsed.username,
    password: decodeURIComponent(parsed.password),
  };
};

const connectionConfig = process.env.DATABASE_URL
  ? parseConnectionString(process.env.DATABASE_URL)
  : {
      host: 'localhost',
      port: 5432,
      database: 'portfolio',
      user: 'postgres',
      password: 'postgres',
    };

// Detect if we're connecting to Supabase (production/staging)
const isSupabase = process.env.DATABASE_URL?.includes('supabase.co');
const isProduction = process.env.NODE_ENV === 'production';

const poolConfig: PoolConfig = {
  ...connectionConfig,
  // SSL configuration (required for Supabase in production, optional for dev)
  ssl: isSupabase || isProduction ? { rejectUnauthorized: false } : undefined,
  // Connection pool configuration
  max: 10, // Maximum number of clients in the pool
  min: 2, // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
};

const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('[db/index.ts] Unexpected error on idle client', err);
  // Note: process.exit() removed for Edge Runtime compatibility
});

console.log('[db/index.ts] Database connection initialized');
console.log('[db/index.ts] Connection config:', {
  host: poolConfig.host,
  port: poolConfig.port,
  database: poolConfig.database,
  user: poolConfig.user,
  ssl: !!poolConfig.ssl,
});

export const db = drizzle(pool, { schema });
export { pool };
