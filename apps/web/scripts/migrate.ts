import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { logger } from '../src/lib/logger';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

async function runMigration(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    logger.info('Running migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    logger.info('Migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed', { error });
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Migration script failed', { error });
    process.exit(1);
  });
