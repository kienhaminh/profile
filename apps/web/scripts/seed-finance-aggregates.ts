import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  financeTransactions,
  financeExchanges,
  financeAggregates,
} from '../src/db/schema';
import { logger } from '../src/lib/logger';
import * as dotenv from 'dotenv';
import { eq, sql, and } from 'drizzle-orm';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seedAggregates(): Promise<void> {
  try {
    logger.info('Starting finance aggregates seed...');

    const currencies = ['KRW', 'VND'] as const;

    for (const currency of currencies) {
      logger.info(`Processing currency: ${currency}`);

      // 1. Calculate Income
      const [incomeResult] = await db
        .select({ total: sql<number>`sum(${financeTransactions.amount})` })
        .from(financeTransactions)
        .where(
          and(
            eq(financeTransactions.type, 'income'),
            eq(financeTransactions.currency, currency)
          )
        );
      const totalIncome = Number(incomeResult?.total || 0);

      // 2. Calculate Expense
      const [expenseResult] = await db
        .select({ total: sql<number>`sum(${financeTransactions.amount})` })
        .from(financeTransactions)
        .where(
          and(
            eq(financeTransactions.type, 'expense'),
            eq(financeTransactions.currency, currency)
          )
        );
      const totalExpense = Number(expenseResult?.total || 0);

      // 3. Calculate Exchange Inflow (toCurrency)
      const [inflowResult] = await db
        .select({ total: sql<number>`sum(${financeExchanges.toAmount})` })
        .from(financeExchanges)
        .where(eq(financeExchanges.toCurrency, currency));
      const totalExchangeIn = Number(inflowResult?.total || 0);

      // 4. Calculate Exchange Outflow (fromCurrency)
      const [outflowResult] = await db
        .select({ total: sql<number>`sum(${financeExchanges.fromAmount})` })
        .from(financeExchanges)
        .where(eq(financeExchanges.fromCurrency, currency));
      const totalExchangeOut = Number(outflowResult?.total || 0);

      logger.info(`Calculated totals for ${currency}:`, {
        totalIncome,
        totalExpense,
        totalExchangeIn,
        totalExchangeOut,
      });

      // 5. Update Aggregates Table
      // We check if it exists first (it should from migration)
      const existing = await db
        .select()
        .from(financeAggregates)
        .where(eq(financeAggregates.currency, currency))
        .limit(1);

      if (existing.length === 0) {
        // Should have been inserted by migration, but just in case
        await db.insert(financeAggregates).values({
          currency,
          totalIncome: String(totalIncome),
          totalExpense: String(totalExpense),
          totalExchangeIn: String(totalExchangeIn),
          totalExchangeOut: String(totalExchangeOut),
        });
      } else {
        await db
          .update(financeAggregates)
          .set({
            totalIncome: String(totalIncome),
            totalExpense: String(totalExpense),
            totalExchangeIn: String(totalExchangeIn),
            totalExchangeOut: String(totalExchangeOut),
            updatedAt: new Date(),
          })
          .where(eq(financeAggregates.currency, currency));
      }

      logger.info(`Updated aggregates for ${currency}`);
    }

    logger.info('Finance aggregates seed completed successfully');
  } catch (error) {
    logger.error('Seed aggregates failed', { error });
    throw error;
  }
}

seedAggregates()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error('Seed aggregates script failed', { error });
    await pool.end();
    process.exit(1);
  });
