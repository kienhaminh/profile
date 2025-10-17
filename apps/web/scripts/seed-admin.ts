import { db } from '../src/db';
import { adminUsers } from '../src/db/schema';
import { hashPassword } from '../src/services/auth';
import {
  enforceSingleAdminPolicy,
  SingleAdminViolationError,
} from '../src/lib/admin-auth';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ADMIN_PASSWORD environment variable is mandatory for seeding admin user
const password = process.env.ADMIN_PASSWORD;
if (!password) {
  throw new Error('ADMIN_PASSWORD environment variable is required');
}

async function seedAdmin(): Promise<void> {
  try {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const email = process.env.ADMIN_EMAIL || 'admin@portfolio.local';
    // Use the validated password variable (ADMIN_PASSWORD is required)

    const hashedPassword = await hashPassword(password!);

    // Enforce single-admin policy before creating/updating admin
    await enforceSingleAdminPolicy();

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);

    if (existingAdmin.length > 0) {
      // Update existing admin
      await db
        .update(adminUsers)
        .set({
          email,
          password: hashedPassword,
        })
        .where(eq(adminUsers.username, username));

      console.log(`✓ Admin user '${username}' updated successfully`);
    } else {
      // Create new admin
      await db.insert(adminUsers).values({
        username,
        email,
        password: hashedPassword,
        role: 'admin',
      });

      console.log(`✓ Admin user '${username}' created successfully`);
    }

    process.exit(0);
  } catch (error) {
    if (error instanceof SingleAdminViolationError) {
      console.error('❌ Single admin policy violation:', error.message);
      console.error('This system is configured to allow only one admin user.');
      console.error(
        'Please remove existing admin users before creating a new one.'
      );
      process.exit(1);
    }

    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
