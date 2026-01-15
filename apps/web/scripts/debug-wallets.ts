import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { financeTransactions } from '../src/db/schema';
import * as dotenv from 'dotenv';
import { gte, lte, and, eq, sql } from 'drizzle-orm';

// Load environment variables
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function debugWallets() {
  try {
    const targetMonth = '2026-01-01';
    const monthEnd = '2026-01-31';

    console.log(
      `Checking transactions between ${targetMonth} and ${monthEnd}...`
    );

    // KRW Income this month
    const [krwIncome] = await db
      .select({ total: sql<number>`sum(amount)` })
      .from(financeTransactions)
      .where(
        and(
          eq(financeTransactions.type, 'income'),
          eq(financeTransactions.currency, 'KRW'),
          gte(financeTransactions.date, targetMonth),
          lte(financeTransactions.date, monthEnd)
        )
      );

    // KRW Expense this month
    const [krwExpense] = await db
      .select({ total: sql<number>`sum(amount)` })
      .from(financeTransactions)
      .where(
        and(
          eq(financeTransactions.type, 'expense'),
          eq(financeTransactions.currency, 'KRW'),
          gte(financeTransactions.date, targetMonth),
          lte(financeTransactions.date, monthEnd)
        )
      );

    // All-time totals (no date filter)
    const [krwIncomeAll] = await db
      .select({ total: sql<number>`sum(amount)` })
      .from(financeTransactions)
      .where(
        and(
          eq(financeTransactions.type, 'income'),
          eq(financeTransactions.currency, 'KRW')
        )
      );

    const [krwExpenseAll] = await db
      .select({ total: sql<number>`sum(amount)` })
      .from(financeTransactions)
      .where(
        and(
          eq(financeTransactions.type, 'expense'),
          eq(financeTransactions.currency, 'KRW')
        )
      );

    console.log('--- JANUARY 2026 DATA (KRW) ---');
    console.log('Income:', krwIncome?.total || 0);
    console.log('Expense:', krwExpense?.total || 0);

    console.log('--- ALL-TIME DATA (KRW) ---');
    console.log('Income:', krwIncomeAll?.total || 0);
    console.log('Expense:', krwExpenseAll?.total || 0);
  } catch (error) {
    console.error('Debug failed:', error);
  } finally {
    await pool.end();
  }
}

debugWallets();
