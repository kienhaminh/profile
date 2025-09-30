import { db } from '../src/db';
import { adminUsers } from '../src/db/schema';
import { hashPassword } from '../src/services/auth';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function seedAdmin(): Promise<void> {
  try {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const email = process.env.ADMIN_EMAIL || 'admin@portfolio.local';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    const hashedPassword = await hashPassword(password);

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

    console.log(`  Username: ${username}`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
