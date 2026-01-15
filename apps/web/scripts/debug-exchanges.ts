import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { financeExchanges } from '../src/db/schema';
import * as dotenv from 'dotenv';
import { gte, lte, and } from 'drizzle-orm';

// Load environment variables
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function debugExchanges() {
  try {
    const targetMonth = '2026-01-01';
    const monthEnd = '2026-01-31';

    console.log(`Checking exchanges between ${targetMonth} and ${monthEnd}...`);

    const result = await db
      .select()
      .from(financeExchanges)
      .where(
        and(
          gte(financeExchanges.date, targetMonth),
          lte(financeExchanges.date, monthEnd)
        )
      );

    console.log('--- FOUND EXCHANGES ---');
    console.log(JSON.stringify(result, null, 2));

    const all = await db.select().from(financeExchanges).limit(10);
    console.log('--- LATEST 10 EXCHANGES (ANY DATE) ---');
    console.log(JSON.stringify(all, null, 2));
  } catch (error) {
    console.error('Debug failed:', error);
  } finally {
    await pool.end();
  }
}

debugExchanges();
