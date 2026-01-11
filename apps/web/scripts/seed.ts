import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users, configs, tags, financeCategories } from '../src/db/schema';
import { logger } from '../src/lib/logger';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seed(): Promise<void> {
  try {
    logger.info('Starting seed...');

    // 1. Create admin user
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, adminUsername))
      .limit(1);

    if (existingUser.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await db.insert(users).values({
        username: adminUsername,
        passwordHash,
      });
      logger.info('Admin user created', { username: adminUsername });
    } else {
      logger.info('Admin user already exists', { username: adminUsername });
    }

    // 2. Seed config values
    const configValues = [
      { key: 'NAME', value: 'Your Name' },
      { key: 'EMAIL', value: 'your.email@example.com' },
      { key: 'PHONE', value: '+1234567890' },
      { key: 'LINKEDIN', value: 'https://linkedin.com/in/yourprofile' },
      { key: 'GITHUB', value: 'https://github.com/yourusername' },
      { key: 'TWITTER', value: 'https://twitter.com/yourusername' },
      { key: 'WEBSITE', value: 'https://yourwebsite.com' },
      { key: 'BIO', value: 'A short bio about yourself' },
      { key: 'LOCATION', value: 'Your City, Country' },
    ];

    for (const config of configValues) {
      const existing = await db
        .select()
        .from(configs)
        .where(eq(configs.key, config.key))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(configs).values(config);
        logger.info('Config created', { key: config.key });
      } else {
        logger.info('Config already exists', { key: config.key });
      }
    }

    // 3. Optionally seed some starter tags
    const starterTags = [
      {
        slug: 'typescript',
        label: 'TypeScript',
        description: 'TypeScript programming language',
      },
      {
        slug: 'react',
        label: 'React',
        description: 'React JavaScript library',
      },
      {
        slug: 'nextjs',
        label: 'Next.js',
        description: 'Next.js React framework',
      },
      { slug: 'nodejs', label: 'Node.js', description: 'Node.js runtime' },
      {
        slug: 'postgresql',
        label: 'PostgreSQL',
        description: 'PostgreSQL database',
      },
    ];

    for (const tag of starterTags) {
      const existing = await db
        .select()
        .from(tags)
        .where(eq(tags.slug, tag.slug))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(tags).values(tag);
        logger.info('Tag created', { slug: tag.slug });
      } else {
        logger.info('Tag already exists', { slug: tag.slug });
      }
    }

    // 4. Seed finance categories
    const starterFinanceCategories = [
      { name: 'Food & Drink' },
      { name: 'Transport' },
      { name: 'Shopping' },
      { name: 'Housing' },
      { name: 'Utilities' },
      { name: 'Entertainment' },
      { name: 'Income' },
      { name: 'Salary' },
      { name: 'Freelance' },
      { name: 'Business' },
      { name: 'Investment' },
      { name: 'Bonus' },
      { name: 'Other' },
    ];

    for (const category of starterFinanceCategories) {
      const existing = await db
        .select()
        .from(financeCategories)
        .where(eq(financeCategories.name, category.name))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(financeCategories).values(category);
        logger.info('Finance category created', { name: category.name });
      } else {
        logger.info('Finance category already exists', { name: category.name });
      }
    }

    logger.info('Seed completed successfully');
  } catch (error) {
    logger.error('Seed failed', { error });
    throw error;
  }
}

seed()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error('Seed script failed', { error });
    await pool.end();
    process.exit(1);
  });
