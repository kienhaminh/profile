import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolConfig } from 'pg';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local if not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

// Define types for database connection configuration
interface DatabaseConnectionConfig {
  host: string;
  port: number | undefined;
  database: string | undefined;
  user: string | undefined;
  password: string;
}

// Custom error types for better error handling
class DatabaseConnectionError extends Error {
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options);
    this.name = 'DatabaseConnectionError';
  }
}

class DatabaseURLParseError extends DatabaseConnectionError {
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options);
    this.name = 'DatabaseURLParseError';
  }
}
// Parse and validate database connection string
function parseConnectionString(url: string): DatabaseConnectionConfig {
  // Validate input
  if (typeof url !== 'string' || url.trim().length === 0) {
    throw new DatabaseURLParseError('Database URL must be a non-empty string');
  }

  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch (error) {
    throw new DatabaseURLParseError(
      `Failed to parse database URL: ${error instanceof Error ? error.message : 'Invalid URL format'}`,
      error instanceof Error ? { cause: error } : undefined
    );
  }

  // Validate hostname
  if (!parsed.hostname) {
    throw new DatabaseURLParseError(
      'Database URL must include a valid hostname'
    );
  }

  // Validate port
  let port: number;
  const parsedPort = parsed.port ? parseInt(parsed.port, 10) : 5432;
  if (parsedPort >= 1 && parsedPort <= 65535) {
    port = parsedPort;
  } else {
    throw new DatabaseURLParseError(
      `Invalid port number: ${parsed.port}. Port must be between 1 and 65535`
    );
  }

  // Normalize and validate pathname (database name)
  let database: string | null = null;
  if (parsed.pathname) {
    // Remove leading slash and check if database name is not empty
    const dbName = parsed.pathname.startsWith('/')
      ? parsed.pathname.slice(1)
      : parsed.pathname;
    if (dbName.length > 0) {
      database = dbName;
    } else {
      throw new DatabaseURLParseError(
        'Database URL must include a valid database name'
      );
    }
  } else {
    throw new DatabaseURLParseError(
      'Database URL must include a database name in the pathname'
    );
  }

  // Decode password with proper error handling
  let password: string;
  try {
    password = parsed.password ? decodeURIComponent(parsed.password) : '';
  } catch (error) {
    throw new DatabaseURLParseError(
      `Failed to decode password in database URL: ${error instanceof Error ? error.message : 'Invalid password encoding'}`,
      error instanceof Error ? { cause: error } : undefined
    );
  }

  return {
    host: parsed.hostname,
    port,
    database: database || undefined,
    user: parsed.username || undefined,
    password,
  };
}

const connectionConfig = process.env.DATABASE_URL
  ? parseConnectionString(process.env.DATABASE_URL)
  : ({
      host: 'localhost',
      port: 5432,
      database: 'portfolio',
      user: 'postgres',
      password: 'postgres',
    } as DatabaseConnectionConfig);

// Detect if we're connecting to Supabase (production/staging) or Neon
const isSupabase = process.env.DATABASE_URL?.includes('supabase.co');
const isNeon = process.env.DATABASE_URL?.includes('neon.tech');
const isProduction = process.env.NODE_ENV === 'production';

const poolConfig: PoolConfig = {
  ...connectionConfig,
  // SSL configuration (required for Supabase and Neon in production, optional for dev)
  ssl:
    isSupabase || isNeon || isProduction
      ? { rejectUnauthorized: true }
      : undefined,
  // Connection pool configuration
  max: 10, // Maximum number of clients in the pool
  min: 2, // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
};

console.log('[db/index.ts] Database connection initialized');
console.log('[db/index.ts] Connection config:', {
  host: poolConfig.host,
  port: poolConfig.port,
  database: poolConfig.database,
  user: poolConfig.user,
  ssl: !!poolConfig.ssl,
});

const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('[db/index.ts] Unexpected error on idle client', err);
  // Note: process.exit() removed for Edge Runtime compatibility
});

export const db = drizzle(pool, { schema });
export { pool };
