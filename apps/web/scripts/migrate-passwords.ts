import { db } from '../src/db';
import { adminUsers } from '../src/db/schema';
import { hashPassword } from '../src/services/auth';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Verbose logging is only enabled in non-production environments
const isVerbose = process.env.NODE_ENV !== 'production';

/**
 * Migration script to hash existing plaintext passwords in the admin_users table.
 * This script should be run if you have existing admin users with plaintext passwords
 * that need to be converted to bcrypt hashes.
 *
 * WARNING: This script will update all admin user passwords. Make sure you have
 * a backup of your database before running this script.
 */
async function migratePasswords(): Promise<void> {
  try {
    console.log('🔐 Starting password migration...');

    // Get all admin users
    const allAdmins = await db.select().from(adminUsers);

    if (allAdmins.length === 0) {
      console.log('✅ No admin users found. Nothing to migrate.');
      return;
    }

    console.log(`📋 Found ${allAdmins.length} admin user(s) to check`);

    let migratedCount = 0;
    let alreadyHashedCount = 0;
    let missingPasswordCount = 0;

    for (const admin of allAdmins) {
      const password = admin.password;

      // Check if password is missing (null or undefined)
      if (password === null || password === undefined) {
        if (isVerbose) {
          console.log(
            `⚠️  Admin ID '${admin.id}' has missing password - skipping`
          );
        } else {
          console.log(`⚠️  Admin record has missing password - skipping`);
        }
        missingPasswordCount++;
        continue;
      }

      // Ensure password is a string before calling string methods
      if (typeof password !== 'string') {
        if (isVerbose) {
          console.log(
            `⚠️  Admin ID '${admin.id}' has non-string password - skipping`
          );
        } else {
          console.log(`⚠️  Admin record has non-string password - skipping`);
        }
        missingPasswordCount++;
        continue;
      }

      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      const isAlreadyHashed =
        password.startsWith('$2a$') ||
        password.startsWith('$2b$') ||
        password.startsWith('$2y$');

      if (isAlreadyHashed) {
        if (isVerbose) {
          console.log(`✅ Admin ID '${admin.id}' already has hashed password`);
        } else {
          console.log(`✅ Admin record already has hashed password`);
        }
        alreadyHashedCount++;
        continue;
      }

      // Hash the plaintext password
      if (isVerbose) {
        console.log(`🔄 Migrating password for admin ID '${admin.id}'`);
      } else {
        console.log(`🔄 Migrating password for admin record`);
      }
      const hashedPassword = await hashPassword(password);

      // Update the admin user with the hashed password
      await db
        .update(adminUsers)
        .set({ password: hashedPassword })
        .where(eq(adminUsers.id, admin.id));

      migratedCount++;
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`   • ${migratedCount} password(s) hashed`);
    console.log(`   • ${alreadyHashedCount} password(s) already hashed`);
    console.log(
      `   • ${missingPasswordCount} user(s) with missing/invalid password(s) - skipped`
    );
    console.log(`   • ${allAdmins.length} total admin user(s) processed`);

    if (migratedCount > 0) {
      console.log('\n⚠️  IMPORTANT:');
      console.log('   • All admin user passwords have been hashed');
      console.log('   • The original plaintext passwords are no longer valid');
      console.log(
        '   • Update your environment variables or seed scripts if needed'
      );
      console.log(
        '   • Make sure to backup your database before running migrations'
      );
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during password migration:', error);
    process.exit(1);
  }
}

migratePasswords();
