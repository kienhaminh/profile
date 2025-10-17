import { db } from '../src/db';
import { adminUsers } from '../src/db/schema';
import { hashPassword } from '../src/services/auth';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ADMIN_PASSWORD environment variable is mandatory for password migration
const password = process.env.ADMIN_PASSWORD;
if (!password) {
  throw new Error('ADMIN_PASSWORD environment variable is required');
}

// Verbose logging is only enabled in non-production environments
const isVerbose = process.env.NODE_ENV !== 'production';

/**
 * Migration script to update all admin user passwords to the password from ADMIN_PASSWORD env var.
 * This script reads the password from the ADMIN_PASSWORD environment variable, hashes it,
 * and updates all admin users in the database to use this new hashed password.
 *
 * WARNING: This script will update ALL admin user passwords to the same password.
 * Make sure you have a backup of your database before running this script.
 */
async function migratePasswords(): Promise<void> {
  try {
    console.log(
      '🔐 Starting password migration from ADMIN_PASSWORD env var...'
    );

    // Get all admin users
    const allAdmins = await db.select().from(adminUsers);

    if (allAdmins.length === 0) {
      console.log('✅ No admin users found. Nothing to migrate.');
      return;
    }

    console.log(`📋 Found ${allAdmins.length} admin user(s) to update`);

    // Hash the password from environment variable
    console.log('🔒 Hashing password from ADMIN_PASSWORD...');
    const hashedPassword = await hashPassword(password!);

    let migratedCount = 0;

    for (const admin of allAdmins) {
      if (isVerbose) {
        console.log(
          `🔄 Updating password for admin: ${admin.username} (ID: ${admin.id})`
        );
      } else {
        console.log(`🔄 Updating password for admin: ${admin.username}`);
      }

      // Update the admin user with the hashed password from env
      await db
        .update(adminUsers)
        .set({ password: hashedPassword })
        .where(eq(adminUsers.id, admin.id));

      migratedCount++;
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`   • ${migratedCount} admin user(s) updated`);
    console.log(
      `   • All admin users now use the password from ADMIN_PASSWORD env var`
    );

    if (migratedCount > 0) {
      console.log('\n⚠️  IMPORTANT:');
      console.log('   • All admin user passwords have been updated');
      console.log(
        '   • They now use the hashed password from ADMIN_PASSWORD environment variable'
      );
      console.log(
        '   • Make sure to keep ADMIN_PASSWORD secure and consistent across environments'
      );
      console.log('   • Backup your database before running any migrations');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during password migration:', error);
    process.exit(1);
  }
}

migratePasswords();
