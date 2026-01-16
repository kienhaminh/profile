import {
  getTransactions,
  getCategories,
  getBudgets,
  getExchanges,
  getLoans,
  getInvestments,
  getRecurringTransactions,
  generateRecurringTransactions,
} from '@/app/actions/finance';
import { TransactionList } from '@/components/finance/TransactionList';
import { BudgetManager } from '@/components/finance/BudgetManager';
import { CategoryManager } from '@/components/finance/CategoryManager';
import { ExchangeManager } from '@/components/finance/ExchangeManager';
import { LoanManager } from '@/components/finance/LoanManager';
import { InvestmentManager } from '@/components/finance/InvestmentManager';
import { RecurringManager } from '@/components/finance/RecurringManager';
import { FinanceFilters } from '@/components/finance/FinanceFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  List,
  Repeat,
  Target,
  ArrowRightLeft,
  Banknote,
  TrendingUp,
  Tag,
} from 'lucide-react';
import {
  getCurrentMonth,
  parseFinanceParams,
  FinancePageProps,
} from '@/lib/finance-utils';

export const dynamic = 'force-dynamic';

export default async function FinanceDetailPage({
  searchParams,
}: FinancePageProps) {
  const filter = await parseFinanceParams(searchParams);
  const currentMonth = getCurrentMonth();

  // Auto-generate recurring transactions for current month
  // Pass false to avoid calling revalidatePath during render, which is unsupported
  await generateRecurringTransactions(undefined, false);

  const [
    transactions,
    categories,
    budgets,
    exchanges,
    loans,
    investments,
    recurringTransactions,
  ] = await Promise.all([
    getTransactions(filter),
    getCategories(),
    getBudgets(currentMonth),
    getExchanges(currentMonth),
    getLoans(),
    getInvestments(),
    getRecurringTransactions(),
  ]);

  return (
    <Tabs defaultValue="transactions" className="">
      <TabsList className="h-11 w-full justify-start bg-muted/30 p-1 mb-2 overflow-x-auto border-none">
        <TabsTrigger
          value="transactions"
          className="gap-2 px-4 py-2 font-bold data-[state=active]:bg-background transition-all"
        >
          <List className="h-3.5 w-3.5" />
          Transactions
        </TabsTrigger>
        <TabsTrigger
          value="recurring"
          className="gap-2 px-4 py-2 font-bold data-[state=active]:bg-background transition-all"
        >
          <Repeat className="h-3.5 w-3.5" />
          Recurring
        </TabsTrigger>
        <TabsTrigger
          value="budgets"
          className="gap-2 px-4 py-2 font-bold data-[state=active]:bg-background transition-all"
        >
          <Target className="h-3.5 w-3.5" />
          Budgets
        </TabsTrigger>
        <TabsTrigger
          value="exchange"
          className="gap-2 px-4 py-2 font-bold data-[state=active]:bg-background transition-all"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          Exchange
        </TabsTrigger>
        <TabsTrigger
          value="loans"
          className="gap-2 px-4 py-2 font-bold data-[state=active]:bg-background transition-all"
        >
          <Banknote className="h-3.5 w-3.5" />
          Loans
        </TabsTrigger>
        <TabsTrigger
          value="investments"
          className="gap-2 px-4 py-2 font-bold data-[state=active]:bg-background transition-all"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Investments
        </TabsTrigger>
        <TabsTrigger
          value="categories"
          className="gap-2 px-4 py-2 font-bold data-[state=active]:bg-background transition-all"
        >
          <Tag className="h-3.5 w-3.5" />
          Categories
        </TabsTrigger>
      </TabsList>
      <TabsContent value="transactions" className="mt-0 space-y-4">
        <FinanceFilters categories={categories} />
        <TransactionList transactions={transactions} />
      </TabsContent>
      <TabsContent value="recurring" className="mt-0">
        <RecurringManager
          recurringTransactions={recurringTransactions}
          categories={categories}
        />
      </TabsContent>
      <TabsContent value="budgets" className="mt-0">
        <BudgetManager
          categories={categories}
          budgets={budgets}
          currentMonth={currentMonth}
        />
      </TabsContent>
      <TabsContent value="exchange" className="mt-0">
        <ExchangeManager exchanges={exchanges} />
      </TabsContent>
      <TabsContent value="loans" className="mt-0">
        <LoanManager loans={loans} />
      </TabsContent>
      <TabsContent value="investments" className="mt-0">
        <InvestmentManager investments={investments} />
      </TabsContent>
      <TabsContent value="categories" className="mt-0">
        <CategoryManager categories={categories} />
      </TabsContent>
    </Tabs>
  );
}
