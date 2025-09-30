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

const poolConfig: PoolConfig = {
  ...connectionConfig,
  // Connection pool configuration
  max: 10, // Maximum number of clients in the pool
  min: 2, // Minimum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const db = drizzle(pool, { schema });
export { pool };
