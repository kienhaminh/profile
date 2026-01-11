import {
  getFinanceStats,
  getTransactions,
  getCategories,
  getBudgets,
  getBudgetProgress,
  getExchanges,
  getWalletBalances,
  getLoans,
  getInvestments,
} from '@/app/actions/finance';
import { FinanceHeader } from '@/components/finance/FinanceHeader';
import {
  FinanceStatsCards,
  FinanceCharts,
} from '@/components/finance/FinanceStats';
import { CashflowSankey } from '@/components/finance/CashflowSankey';
import { TransactionList } from '@/components/finance/TransactionList';
import { FinanceFilters } from '@/components/finance/FinanceFilters';
import { BudgetProgress } from '@/components/finance/BudgetProgress';
import { BudgetManager } from '@/components/finance/BudgetManager';
import { CategoryManager } from '@/components/finance/CategoryManager';
import { WalletCards } from '@/components/finance/WalletCards';
import { ExchangeManager } from '@/components/finance/ExchangeManager';
import { LoanManager } from '@/components/finance/LoanManager';
import { InvestmentManager } from '@/components/finance/InvestmentManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FinanceFilter } from '@/types/finance';

export const dynamic = 'force-dynamic';

// Helper to get current month as YYYY-MM-01
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

interface PageProps {
  searchParams: Promise<{
    categoryId?: string;
    priority?: string;
    currency?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function FinancePage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Set default to last 30 days if no dates specified
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const defaultStartDate = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`;
  const defaultEndDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const filter: FinanceFilter = {
    categoryId: params.categoryId,
    priority: params.priority as any,
    currency: (params.currency as any) || 'KRW',
    startDate: params.startDate || defaultStartDate,
    endDate: params.endDate || defaultEndDate,
  };

  const currentMonth = getCurrentMonth();

  const [
    stats,
    transactions,
    categories,
    budgets,
    budgetProgress,
    exchanges,
    wallets,
    loans,
    investments,
  ] = await Promise.all([
    getFinanceStats(filter),
    getTransactions(filter),
    getCategories(),
    getBudgets(currentMonth),
    getBudgetProgress(currentMonth),
    getExchanges(currentMonth),
    getWalletBalances(currentMonth),
    getLoans(),
    getInvestments(),
  ]);

  return (
    <div className="space-y-6">
      <FinanceHeader />

      <FinanceFilters categories={categories} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="exchange">Exchange</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <WalletCards wallets={wallets} />
          <CashflowSankey
            stats={stats}
            exchanges={exchanges}
            wallets={wallets}
          />
          <BudgetProgress progress={budgetProgress} />
          <FinanceCharts stats={stats} />
        </TabsContent>
        <TabsContent value="transactions">
          <TransactionList transactions={transactions} />
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
    </div>
  );
}
