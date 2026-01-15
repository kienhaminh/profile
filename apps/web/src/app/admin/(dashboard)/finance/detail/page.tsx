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

  // Auto-generate recurring transactions for current month
  await generateRecurringTransactions();

  return (
    <Tabs defaultValue="transactions" className="space-y-4">
      <TabsList className="h-12 w-full justify-start bg-muted/50 p-1 mb-6 overflow-x-auto">
        <TabsTrigger
          value="transactions"
          className="gap-2 px-4 font-bold data-[state=active]:bg-background"
        >
          <List className="h-3.5 w-3.5" />
          Transactions
        </TabsTrigger>
        <TabsTrigger
          value="recurring"
          className="gap-2 px-4 font-bold data-[state=active]:bg-background"
        >
          <Repeat className="h-3.5 w-3.5" />
          Recurring
        </TabsTrigger>
        <TabsTrigger
          value="budgets"
          className="gap-2 px-4 font-bold data-[state=active]:bg-background"
        >
          <Target className="h-3.5 w-3.5" />
          Budgets
        </TabsTrigger>
        <TabsTrigger
          value="exchange"
          className="gap-2 px-4 font-bold data-[state=active]:bg-background"
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          Exchange
        </TabsTrigger>
        <TabsTrigger
          value="loans"
          className="gap-2 px-4 font-bold data-[state=active]:bg-background"
        >
          <Banknote className="h-3.5 w-3.5" />
          Loans
        </TabsTrigger>
        <TabsTrigger
          value="investments"
          className="gap-2 px-4 font-bold data-[state=active]:bg-background"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Investments
        </TabsTrigger>
        <TabsTrigger
          value="categories"
          className="gap-2 px-4 font-bold data-[state=active]:bg-background"
        >
          <Tag className="h-3.5 w-3.5" />
          Categories
        </TabsTrigger>
      </TabsList>
      <TabsContent value="transactions">
        <TransactionList transactions={transactions} />
      </TabsContent>
      <TabsContent value="recurring" className="space-y-6">
        <RecurringManager
          recurringTransactions={recurringTransactions}
          categories={categories}
        />
      </TabsContent>
      <TabsContent value="budgets" className="space-y-6">
        <BudgetManager
          categories={categories}
          budgets={budgets}
          currentMonth={currentMonth}
        />
      </TabsContent>
      <TabsContent value="exchange" className="space-y-6">
        <ExchangeManager exchanges={exchanges} />
      </TabsContent>
      <TabsContent value="loans" className="space-y-6">
        <LoanManager loans={loans} />
      </TabsContent>
      <TabsContent value="investments" className="space-y-6">
        <InvestmentManager investments={investments} />
      </TabsContent>
      <TabsContent value="categories" className="space-y-6">
        <CategoryManager categories={categories} />
      </TabsContent>
    </Tabs>
  );
}
