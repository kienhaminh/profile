import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Only load .env.local in development; rely on system env vars in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
  migrations: {
    table: '__drizzle_migrations',
    schema: 'public',
  },
} satisfies Config;
