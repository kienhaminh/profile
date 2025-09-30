import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { hashPassword } from '../src/services/auth';

dotenv.config({ path: '.env.local' });

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

// Detect if we're connecting to Supabase
const isSupabase = process.env.DATABASE_URL?.includes('supabase.co');
const isProduction = process.env.NODE_ENV === 'production';

async function seedSupabase(): Promise<void> {
  const pool = new Pool({
    ...connectionConfig,
    ssl: isSupabase || isProduction ? { rejectUnauthorized: false } : undefined,
  });

  console.log('🚀 Starting Supabase database seed...\n');

  try {
    // Create post_status enum if not exists
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE post_status AS ENUM ('DRAFT', 'PUBLISHED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✓ Created post_status enum');

    // Create author_profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS author_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        bio TEXT,
        avatar TEXT,
        social_links JSONB,
        email TEXT
      );
    `);
    console.log('✓ Created author_profiles table');

    // Create admin_users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_login TIMESTAMP
      );
    `);
    console.log('✓ Created admin_users table');

    // Create posts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        status post_status NOT NULL DEFAULT 'DRAFT',
        publish_date TIMESTAMP,
        content TEXT NOT NULL,
        excerpt TEXT,
        read_time INTEGER,
        cover_image TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        author_id TEXT NOT NULL REFERENCES author_profiles(id)
      );
    `);
    console.log('✓ Created posts table');

    // Create index on posts.slug
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
    `);
    console.log('✓ Created index on posts.slug');

    // Create index on posts.status
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
    `);
    console.log('✓ Created index on posts.status');

    // Create topics table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS topics (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT
      );
    `);
    console.log('✓ Created topics table');

    // Create index on topics.slug
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug);
    `);
    console.log('✓ Created index on topics.slug');

    // Create post_topics junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_topics (
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, topic_id)
      );
    `);
    console.log('✓ Created post_topics junction table');

    // Seed default author profile
    const authorId = crypto.randomUUID();
    await pool.query(
      `
      INSERT INTO author_profiles (id, name, bio, email)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
    `,
      [
        authorId,
        'Portfolio Admin',
        'Software developer and writer',
        'admin@portfolio.local',
      ]
    );
    console.log('✓ Seeded default author profile');

    // Seed admin user
    const username = process.env.ADMIN_USERNAME || 'admin';
    const email = process.env.ADMIN_EMAIL || 'admin@portfolio.local';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await hashPassword(password);

    const adminResult = await pool.query(
      `
      INSERT INTO admin_users (id, username, email, password, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (username) DO UPDATE
      SET email = EXCLUDED.email, password = EXCLUDED.password
      RETURNING id
    `,
      [crypto.randomUUID(), username, email, hashedPassword, 'admin']
    );
    console.log('✓ Seeded admin user');
    console.log(`  Username: ${username}`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);

    // Seed sample topics
    const topicIds = [
      { id: crypto.randomUUID(), name: 'JavaScript', slug: 'javascript' },
      { id: crypto.randomUUID(), name: 'TypeScript', slug: 'typescript' },
      { id: crypto.randomUUID(), name: 'React', slug: 'react' },
      { id: crypto.randomUUID(), name: 'Next.js', slug: 'nextjs' },
    ];

    for (const topic of topicIds) {
      await pool.query(
        `
        INSERT INTO topics (id, name, slug, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug) DO NOTHING
      `,
        [topic.id, topic.name, topic.slug, `Articles about ${topic.name}`]
      );
    }
    console.log('✓ Seeded sample topics');

    console.log('\n✅ Supabase seed completed successfully!');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedSupabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed Supabase:', error);
    process.exit(1);
  });
