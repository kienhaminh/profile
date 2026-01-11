import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

async function fixMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Create __drizzle_migrations table if not exists
    console.log('Creating __drizzle_migrations table if not exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS __drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT NOT NULL
      );
    `);

    // Check current migration state
    console.log('Current migrations in __drizzle_migrations:');
    const { rows: currentMigrations } = await pool.query(
      'SELECT * FROM __drizzle_migrations ORDER BY id;'
    );
    console.table(currentMigrations);

    // List of ALL migrations that need to be marked as applied (since tables already exist)
    const migrationsToAdd = [
      '0000_brave_red_ghost',
      '0001_clammy_quasar',
      '0002_fair_wraith',
      '0002_wise_gabe_jones',
      '0003_quick_ronan',
      '0004_eager_vanisher',
      '0005_fantastic_shen',
      '0006_blue_the_phantom',
      '0007_smooth_kate_bishop',
      '0008_wild_kid_colt',
      '0009_moaning_strong_guy',
      '0010_high_silvermane',
      '0011_new_white_tiger',
      '0012_plain_galactus',
      '0012_mysterious_toad',
      '0013_fancy_sabretooth',
      '0014_safe_madrox',
    ];

    // Check which migrations are already in the table
    const existingHashes = new Set(currentMigrations.map((m: any) => m.hash));

    for (const hash of migrationsToAdd) {
      if (!existingHashes.has(hash)) {
        console.log(`Adding migration: ${hash}`);
        await pool.query(
          'INSERT INTO __drizzle_migrations (hash, created_at) VALUES ($1, $2)',
          [hash, Date.now()]
        );
      } else {
        console.log(`Migration already exists: ${hash}`);
      }
    }

    // Now apply the actual schema change for finance_categories type column
    console.log('\nApplying finance_categories type column...');
    await pool.query(`
      ALTER TABLE finance_categories 
      ADD COLUMN IF NOT EXISTS type finance_transaction_type DEFAULT 'expense';
    `);
    console.log('Done applying schema change!');

    // Verify
    console.log('\nFinal migrations state:');
    const { rows: finalMigrations } = await pool.query(
      'SELECT * FROM __drizzle_migrations ORDER BY id;'
    );
    console.table(finalMigrations);

    // Verify column exists
    console.log('\nVerifying finance_categories table:');
    const { rows: columns } = await pool.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'finance_categories';
    `);
    console.table(columns);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

fixMigrations();
