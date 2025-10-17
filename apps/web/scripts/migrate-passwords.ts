import { db } from '../src/db';
import { adminUsers } from '../src/db/schema';
import { hashPassword } from '../src/services/auth';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

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

    for (const admin of allAdmins) {
      const password = admin.password;

      // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
      const isAlreadyHashed =
        password.startsWith('$2a$') ||
        password.startsWith('$2b$') ||
        password.startsWith('$2y$');

      if (isAlreadyHashed) {
        console.log(`✅ Admin '${admin.username}' already has hashed password`);
        alreadyHashedCount++;
        continue;
      }

      // Hash the plaintext password
      console.log(`🔄 Migrating password for admin '${admin.username}'`);
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
