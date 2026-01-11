import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users } from '../src/db/schema';
import { logger } from '../src/lib/logger';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

async function updatePassword() {
  const username = process.argv[2] || process.env.ADMIN_USERNAME || 'admin';
  const newPassword = process.argv[3] || process.env.ADMIN_PASSWORD;

  if (!newPassword) {
    console.error('\nError: New password is required.\n');
    console.error(
      'Usage: tsx scripts/update-admin-password.ts [username] [newPassword]'
    );
    console.error(
      'Example: pnpm run admin:update-password admin mynewpassword\n'
    );
    console.error(
      'Alternatively, set ADMIN_PASSWORD in your .env.local file.\n'
    );
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    logger.info(`Checking for user: ${username}`);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length === 0) {
      logger.error(`User "${username}" not found in database.`);
      process.exit(1);
    }

    logger.info(`Hashing new password for ${username}...`);
    const passwordHash = await bcrypt.hash(newPassword, 10);

    logger.info(`Updating database...`);
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.username, username));

    logger.info(`Successfully updated password for admin user: ${username}`);
  } catch (error) {
    logger.error('Failed to update password', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updatePassword();
