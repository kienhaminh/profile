import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { financeTransactions, financeAggregates } from '../src/db/schema';
import { eq } from 'drizzle-orm';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function debugTrigger() {
  try {
    const currency = 'KRW';

    // 1. Get initial
    const initial = await db
      .select()
      .from(financeAggregates)
      .where(eq(financeAggregates.currency, currency));
    console.log('Initial:', initial[0]);

    // 2. Insert Expense
    console.log('Inserting Expense 500...');
    const [tx] = await db
      .insert(financeTransactions)
      .values({
        type: 'expense',
        amount: '500',
        currency: currency,
        date: '2026-01-01',
        description: 'Debug Trigger',
      })
      .returning();

    // 3. Get After
    const after = await db
      .select()
      .from(financeAggregates)
      .where(eq(financeAggregates.currency, currency));
    console.log('After Insert:', after[0]);

    // Verify
    const diff =
      Number(after[0].totalExpense) - Number(initial[0].totalExpense);
    console.log('Diff:', diff);

    if (diff !== 500) {
      throw new Error(
        `Assertion Failed: Expected totalExpense to increase by 500, but got ${diff}`
      );
    }

    // 4. Delete
    console.log('Deleting...');
    await db
      .delete(financeTransactions)
      .where(eq(financeTransactions.id, tx.id));

    // 5. Get Final
    const final = await db
      .select()
      .from(financeAggregates)
      .where(eq(financeAggregates.currency, currency));
    console.log('Final:', final[0]);

    if (Number(final[0].totalExpense) !== Number(initial[0].totalExpense)) {
      throw new Error(
        `Assertion Failed: Expected totalExpense to revert to ${initial[0].totalExpense}, but got ${final[0].totalExpense}`
      );
    }

    console.log('✅ ALL CHECKS PASSED');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

debugTrigger();
