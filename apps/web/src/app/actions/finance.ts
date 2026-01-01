'use server';

import { db } from '@/db/client';
import {
  financeCategories,
  financeTransactions,
  financeLoans,
  financeInvestments,
} from '@/db/schema';
import { revalidatePath } from 'next/cache';
import {
  CreateTransactionDTO,
  UpdateTransactionDTO,
  FinanceStats,
  FinanceFilter,
  FinanceLoan,
  CreateLoanDTO,
  UpdateLoanDTO,
  LoanStatus,
  FinanceInvestment,
  CreateInvestmentDTO,
  UpdateInvestmentDTO,
  InvestmentStatus,
} from '@/types/finance';
import { eq, desc, sql, and, gte, lte, SQL } from 'drizzle-orm';
import { requireAdminAuth } from '@/lib/server-auth';

// Helper functions for dates
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  d.setDate(diff);
  return d;
}

export async function getCategories() {
  return await db.query.financeCategories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });
}

export async function createCategory(name: string) {
  await requireAdminAuth();
  const [category] = await db
    .insert(financeCategories)
    .values({ name })
    .returning();

  revalidatePath('/admin/finance');
  return category;
}

export async function updateCategory(id: string, name: string) {
  const [category] = await db
    .update(financeCategories)
    .set({ name })
    .where(eq(financeCategories.id, id))
    .returning();

  revalidatePath('/admin/finance');
  return category;
}

export async function deleteCategory(id: string) {
  await db.delete(financeCategories).where(eq(financeCategories.id, id));
  revalidatePath('/admin/finance');
}

export async function getTransactions(filter?: FinanceFilter) {
  const conditions: SQL[] = [];
  if (filter?.categoryId)
    conditions.push(eq(financeTransactions.categoryId, filter.categoryId));
  if (filter?.priority)
    conditions.push(eq(financeTransactions.priority, filter.priority));
  if (filter?.currency)
    conditions.push(eq(financeTransactions.currency, filter.currency));
  if (filter?.startDate)
    conditions.push(gte(financeTransactions.date, filter.startDate));
  if (filter?.endDate)
    conditions.push(lte(financeTransactions.date, filter.endDate));

  return await db.query.financeTransactions.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      category: true,
    },
    orderBy: (transactions, { desc }) => [desc(transactions.date)],
  });
}

export async function createTransaction(transaction: CreateTransactionDTO) {
  await requireAdminAuth();
  // Convert date to YYYY-MM-DD for storage
  const formattedDate = formatDate(transaction.date);

  const [newTransaction] = await db
    .insert(financeTransactions)
    .values({
      ...transaction,
      date: formattedDate,
      amount: String(transaction.amount), // Drizzle decimal is string
    })
    .returning();

  revalidatePath('/admin/finance');
  return newTransaction;
}

export async function updateTransaction(transaction: UpdateTransactionDTO) {
  await requireAdminAuth();
  const formattedDate = transaction.date
    ? formatDate(transaction.date)
    : undefined;

  const [updatedTransaction] = await db
    .update(financeTransactions)
    .set({
      ...transaction,
      date: formattedDate,
      amount: transaction.amount ? String(transaction.amount) : undefined,
    })
    .where(eq(financeTransactions.id, transaction.id))
    .returning();

  revalidatePath('/admin/finance');
  return updatedTransaction;
}

export async function deleteTransaction(id: string) {
  await requireAdminAuth();
  await db.delete(financeTransactions).where(eq(financeTransactions.id, id));
  revalidatePath('/admin/finance');
}

export async function getFinanceStats(
  filter?: FinanceFilter
): Promise<FinanceStats> {
  const now = new Date();

  const monthStart = filter?.startDate || formatDate(getStartOfMonth(now));
  const monthEnd = filter?.endDate || formatDate(getEndOfMonth(now));
  const weekStart = formatDate(getStartOfWeek(now));

  async function getSum(
    type: 'income' | 'expense',
    startDate?: string,
    endDate?: string
  ) {
    const conditions: SQL[] = [eq(financeTransactions.type, type)];
    if (startDate) conditions.push(gte(financeTransactions.date, startDate));
    if (endDate) conditions.push(lte(financeTransactions.date, endDate));

    if (filter?.categoryId)
      conditions.push(eq(financeTransactions.categoryId, filter.categoryId));
    if (filter?.priority)
      conditions.push(eq(financeTransactions.priority, filter.priority));
    if (filter?.currency)
      conditions.push(eq(financeTransactions.currency, filter.currency));

    const [result] = await db
      .select({ value: sql<number>`sum(${financeTransactions.amount})` })
      .from(financeTransactions)
      .where(and(...conditions));

    return Number(result?.value || 0);
  }

  const [monthlyIncome, monthlyExpense, weeklyExpense] = await Promise.all([
    getSum('income', monthStart, monthEnd),
    getSum('expense', monthStart, monthEnd),
    getSum('expense', weekStart),
  ]);

  // By Category (Period)
  const categoryConditions: SQL[] = [
    gte(financeTransactions.date, monthStart),
    lte(financeTransactions.date, monthEnd),
  ];
  if (filter?.categoryId)
    categoryConditions.push(
      eq(financeTransactions.categoryId, filter.categoryId)
    );
  if (filter?.priority)
    categoryConditions.push(eq(financeTransactions.priority, filter.priority));
  if (filter?.currency)
    categoryConditions.push(eq(financeTransactions.currency, filter.currency));

  const categoryData = await db.query.financeTransactions.findMany({
    where: and(...categoryConditions),
    with: {
      category: true,
    },
  });

  const byCategoryMap = new Map<string, { value: number; type: string }>();
  categoryData.forEach((t) => {
    const name = t.category?.name || 'Uncategorized';
    const current = byCategoryMap.get(name) || { value: 0, type: t.type };
    current.value += Number(t.amount);
    byCategoryMap.set(name, current);
  });

  const byCategory = Array.from(byCategoryMap.entries()).map(
    ([name, { value, type }]) => ({
      name,
      value,
      type: type as any,
    })
  );

  // By Priority (Period Expenses)
  const priorityConditions: SQL[] = [
    eq(financeTransactions.type, 'expense'),
    gte(financeTransactions.date, monthStart),
    lte(financeTransactions.date, monthEnd),
  ];
  if (filter?.categoryId)
    priorityConditions.push(
      eq(financeTransactions.categoryId, filter.categoryId)
    );
  if (filter?.priority)
    priorityConditions.push(eq(financeTransactions.priority, filter.priority));
  if (filter?.currency)
    priorityConditions.push(eq(financeTransactions.currency, filter.currency));

  const priorityData = await db.query.financeTransactions.findMany({
    where: and(...priorityConditions),
  });

  const byPriorityMap = new Map<string, number>();
  priorityData.forEach((t) => {
    if (t.priority) {
      const name = t.priority;
      const current = byPriorityMap.get(name) || 0;
      byPriorityMap.set(name, current + Number(t.amount));
    }
  });

  const byPriority = Array.from(byPriorityMap.entries()).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  return {
    monthlyIncome,
    monthlyExpense,
    weeklyExpense,
    byCategory,
    byPriority,
  };
}

// ==================== BUDGET ACTIONS ====================

import { financeBudgets } from '@/db/schema';
import { CreateBudgetDTO, BudgetProgress } from '@/types/finance';

export async function getBudgets(month?: string) {
  const targetMonth = month || formatDate(getStartOfMonth(new Date()));

  return await db.query.financeBudgets.findMany({
    where: eq(financeBudgets.month, targetMonth),
    with: {
      category: true,
    },
    orderBy: (budgets, { asc }) => [asc(budgets.categoryId)],
  });
}

export async function createOrUpdateBudget(dto: CreateBudgetDTO) {
  await requireAdminAuth();
  // Check if budget exists for this category/month
  const existing = await db.query.financeBudgets.findFirst({
    where: and(
      eq(financeBudgets.categoryId, dto.categoryId),
      eq(financeBudgets.month, dto.month)
    ),
  });

  if (existing) {
    // Update existing budget
    const [updated] = await db
      .update(financeBudgets)
      .set({
        amount: String(dto.amount),
        updatedAt: new Date(),
      })
      .where(eq(financeBudgets.id, existing.id))
      .returning();

    revalidatePath('/admin/finance');
    return updated;
  } else {
    // Create new budget
    const [created] = await db
      .insert(financeBudgets)
      .values({
        categoryId: dto.categoryId,
        amount: String(dto.amount),
        month: dto.month,
      })
      .returning();

    revalidatePath('/admin/finance');
    return created;
  }
}

export async function deleteBudget(id: string) {
  await requireAdminAuth();
  await db.delete(financeBudgets).where(eq(financeBudgets.id, id));
  revalidatePath('/admin/finance');
}

export async function getBudgetProgress(
  month?: string
): Promise<BudgetProgress[]> {
  const targetMonth = month || formatDate(getStartOfMonth(new Date()));
  const monthStart = targetMonth;
  const monthEnd = formatDate(getEndOfMonth(new Date(targetMonth)));

  // Get all budgets for the month (or carry over from previous months)
  let budgets = await db.query.financeBudgets.findMany({
    where: eq(financeBudgets.month, targetMonth),
    with: {
      category: true,
    },
  });

  // If no budgets for current month, try to carry over from previous month
  if (budgets.length === 0) {
    const prevMonth = new Date(targetMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthStr = formatDate(getStartOfMonth(prevMonth));

    const prevBudgets = await db.query.financeBudgets.findMany({
      where: eq(financeBudgets.month, prevMonthStr),
      with: {
        category: true,
      },
    });

    // Auto-create budgets for current month based on previous month
    for (const prevBudget of prevBudgets) {
      await db.insert(financeBudgets).values({
        categoryId: prevBudget.categoryId,
        amount: prevBudget.amount,
        month: targetMonth,
      });
    }

    // Re-fetch budgets
    budgets = await db.query.financeBudgets.findMany({
      where: eq(financeBudgets.month, targetMonth),
      with: {
        category: true,
      },
    });
  }

  // Get expenses for each category in this month
  const progress: BudgetProgress[] = [];

  for (const budget of budgets) {
    const [spentResult] = await db
      .select({ total: sql<number>`sum(${financeTransactions.amount})` })
      .from(financeTransactions)
      .where(
        and(
          eq(financeTransactions.type, 'expense'),
          eq(financeTransactions.categoryId, budget.categoryId),
          eq(financeTransactions.currency, budget.currency),
          gte(financeTransactions.date, monthStart),
          lte(financeTransactions.date, monthEnd)
        )
      );

    const spentAmount = Number(spentResult?.total || 0);
    const budgetAmount = Number(budget.amount);
    const percentage =
      budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

    progress.push({
      categoryId: budget.categoryId,
      categoryName: budget.category?.name || 'Unknown',
      budgetAmount,
      spentAmount,
      percentage: Math.min(percentage, 100),
      remaining: budgetAmount - spentAmount,
      currency: budget.currency as any,
    });
  }

  return progress;
}

// ==================== EXCHANGE ACTIONS ====================

import { financeExchanges } from '@/db/schema';
import { CreateExchangeDTO } from '@/types/finance';

export async function getExchanges(month?: string) {
  const targetMonth = month || formatDate(getStartOfMonth(new Date()));
  const monthEnd = formatDate(getEndOfMonth(new Date(targetMonth)));

  return await db.query.financeExchanges.findMany({
    where: and(
      gte(financeExchanges.date, targetMonth),
      lte(financeExchanges.date, monthEnd)
    ),
    orderBy: (exchanges, { desc }) => [desc(exchanges.date)],
  });
}

export async function createExchange(dto: CreateExchangeDTO) {
  await requireAdminAuth();
  const rate = dto.toAmount / dto.fromAmount;

  const [exchange] = await db
    .insert(financeExchanges)
    .values({
      fromCurrency: dto.fromCurrency,
      toCurrency: dto.toCurrency,
      fromAmount: String(dto.fromAmount),
      toAmount: String(dto.toAmount),
      rate: String(rate),
      date: formatDate(dto.date),
      description: dto.description,
    })
    .returning();

  revalidatePath('/admin/finance');
  return exchange;
}

export async function deleteExchange(id: string) {
  await requireAdminAuth();
  await db.delete(financeExchanges).where(eq(financeExchanges.id, id));
  revalidatePath('/admin/finance');
}

export async function getWalletBalances(month?: string) {
  const targetMonth = month || formatDate(getStartOfMonth(new Date()));
  const monthEnd = formatDate(getEndOfMonth(new Date(targetMonth)));

  const currencies = ['KRW', 'VND'] as const;
  const wallets = [];

  for (const currency of currencies) {
    // Get income for this currency
    const [incomeResult] = await db
      .select({ total: sql<number>`sum(${financeTransactions.amount})` })
      .from(financeTransactions)
      .where(
        and(
          eq(financeTransactions.type, 'income'),
          eq(financeTransactions.currency, currency),
          gte(financeTransactions.date, targetMonth),
          lte(financeTransactions.date, monthEnd)
        )
      );

    // Get expenses for this currency
    const [expenseResult] = await db
      .select({ total: sql<number>`sum(${financeTransactions.amount})` })
      .from(financeTransactions)
      .where(
        and(
          eq(financeTransactions.type, 'expense'),
          eq(financeTransactions.currency, currency),
          gte(financeTransactions.date, targetMonth),
          lte(financeTransactions.date, monthEnd)
        )
      );

    const monthlyIncome = Number(incomeResult?.total || 0);
    const monthlyExpense = Number(expenseResult?.total || 0);

    // Get MONTHLY exchanges for this currency (Flow)
    const [monthlyOutflowResult] = await db
      .select({ total: sql<number>`sum(${financeExchanges.fromAmount})` })
      .from(financeExchanges)
      .where(
        and(
          eq(financeExchanges.fromCurrency, currency),
          gte(financeExchanges.date, targetMonth),
          lte(financeExchanges.date, monthEnd)
        )
      );

    const [monthlyInflowResult] = await db
      .select({ total: sql<number>`sum(${financeExchanges.toAmount})` })
      .from(financeExchanges)
      .where(
        and(
          eq(financeExchanges.toCurrency, currency),
          gte(financeExchanges.date, targetMonth),
          lte(financeExchanges.date, monthEnd)
        )
      );

    const monthlyOutflow = Number(monthlyOutflowResult?.total || 0);
    const monthlyInflow = Number(monthlyInflowResult?.total || 0);

    // Get CUMULATIVE balance (All time up to monthEnd)
    const [totalIncomeResult] = await db
      .select({ total: sql<number>`sum(${financeTransactions.amount})` })
      .from(financeTransactions)
      .where(
        and(
          eq(financeTransactions.type, 'income'),
          eq(financeTransactions.currency, currency),
          lte(financeTransactions.date, monthEnd)
        )
      );

    const [totalExpenseResult] = await db
      .select({ total: sql<number>`sum(${financeTransactions.amount})` })
      .from(financeTransactions)
      .where(
        and(
          eq(financeTransactions.type, 'expense'),
          eq(financeTransactions.currency, currency),
          lte(financeTransactions.date, monthEnd)
        )
      );

    const [totalInflowResult] = await db
      .select({ total: sql<number>`sum(${financeExchanges.toAmount})` })
      .from(financeExchanges)
      .where(
        and(
          eq(financeExchanges.toCurrency, currency),
          lte(financeExchanges.date, monthEnd)
        )
      );

    const [totalOutflowResult] = await db
      .select({ total: sql<number>`sum(${financeExchanges.fromAmount})` })
      .from(financeExchanges)
      .where(
        and(
          eq(financeExchanges.fromCurrency, currency),
          lte(financeExchanges.date, monthEnd)
        )
      );

    const totalIncome = Number(totalIncomeResult?.total || 0);
    const totalExpense = Number(totalExpenseResult?.total || 0);
    const totalInflow = Number(totalInflowResult?.total || 0);
    const totalOutflow = Number(totalOutflowResult?.total || 0);

    wallets.push({
      currency,
      monthlyIncome,
      monthlyExpense,
      exchangeIn: monthlyInflow,
      exchangeOut: monthlyOutflow,
      balance: totalIncome - totalExpense + totalInflow - totalOutflow,
    });
  }

  return wallets;
}

// ==================== LOAN ACTIONS ====================

export async function getLoans(status?: LoanStatus): Promise<FinanceLoan[]> {
  await requireAdminAuth();

  let query = db.select().from(financeLoans);

  if (status) {
    query = query.where(eq(financeLoans.status, status)) as any;
  }

  const loans = await (query.orderBy(desc(financeLoans.date)) as any);

  return loans.map((l: any) => ({
    ...l,
    amount: l.amount.toString(),
  }));
}

export async function createLoan(dto: CreateLoanDTO) {
  await requireAdminAuth();

  await db.insert(financeLoans).values({
    type: dto.type,
    counterparty: dto.counterparty,
    amount: dto.amount.toString(),
    currency: dto.currency,
    date: formatDate(dto.date),
    dueDate: dto.dueDate ? formatDate(dto.dueDate) : null,
    description: dto.description || null,
  });

  revalidatePath('/admin/finance');
}

export async function updateLoan(dto: UpdateLoanDTO) {
  await requireAdminAuth();

  const { id, ...rest } = dto;
  const updateData: any = {};

  if (rest.type) updateData.type = rest.type;
  if (rest.counterparty) updateData.counterparty = rest.counterparty;
  if (rest.amount) updateData.amount = rest.amount.toString();
  if (rest.currency) updateData.currency = rest.currency;
  if (rest.date) updateData.date = formatDate(rest.date);
  if (rest.dueDate) updateData.dueDate = formatDate(rest.dueDate);
  if (rest.description !== undefined)
    updateData.description = rest.description || null;
  if (rest.status) updateData.status = rest.status;
  if (rest.settledDate) updateData.settledDate = formatDate(rest.settledDate);

  await db.update(financeLoans).set(updateData).where(eq(financeLoans.id, id));

  revalidatePath('/admin/finance');
}

export async function deleteLoan(id: string) {
  await requireAdminAuth();
  await db.delete(financeLoans).where(eq(financeLoans.id, id));
  revalidatePath('/admin/finance');
}

// ==================== INVESTMENT ACTIONS ====================

export async function getInvestments(
  status?: InvestmentStatus
): Promise<FinanceInvestment[]> {
  await requireAdminAuth();

  let query = db.select().from(financeInvestments);

  if (status) {
    query = query.where(eq(financeInvestments.status, status)) as any;
  }

  const investments = await (query.orderBy(
    desc(financeInvestments.date)
  ) as any);

  return investments.map((i: any) => ({
    ...i,
    amount: i.amount.toString(),
    currentValue: i.currentValue?.toString() || null,
    soldAmount: i.soldAmount?.toString() || null,
  }));
}

export async function createInvestment(dto: CreateInvestmentDTO) {
  await requireAdminAuth();

  await db.insert(financeInvestments).values({
    name: dto.name,
    type: dto.type || null,
    amount: dto.amount.toString(),
    currentValue: dto.currentValue?.toString() || dto.amount.toString(),
    currency: dto.currency,
    date: formatDate(dto.date),
    description: dto.description || null,
  });

  revalidatePath('/admin/finance');
}

export async function updateInvestment(dto: UpdateInvestmentDTO) {
  await requireAdminAuth();

  const { id, ...rest } = dto;
  const updateData: any = {};

  if (rest.name) updateData.name = rest.name;
  if (rest.type !== undefined) updateData.type = rest.type || null;
  if (rest.amount) updateData.amount = rest.amount.toString();
  if (rest.currentValue) updateData.currentValue = rest.currentValue.toString();
  if (rest.currency) updateData.currency = rest.currency;
  if (rest.date) updateData.date = formatDate(rest.date);
  if (rest.description !== undefined)
    updateData.description = rest.description || null;
  if (rest.status) updateData.status = rest.status;
  if (rest.soldDate) updateData.soldDate = formatDate(rest.soldDate);
  if (rest.soldAmount) updateData.soldAmount = rest.soldAmount.toString();

  await db
    .update(financeInvestments)
    .set(updateData)
    .where(eq(financeInvestments.id, id));

  revalidatePath('/admin/finance');
}

export async function deleteInvestment(id: string) {
  await requireAdminAuth();
  await db.delete(financeInvestments).where(eq(financeInvestments.id, id));
  revalidatePath('/admin/finance');
}
