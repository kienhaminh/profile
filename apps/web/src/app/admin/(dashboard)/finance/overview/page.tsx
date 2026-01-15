import {
  getFinanceStats,
  getBudgetProgress,
  getExchanges,
  getWalletBalances,
  getRecurringTransactions,
} from '@/app/actions/finance';
import { FinanceCharts } from '@/components/finance/FinanceStats';
import { CashflowSankey } from '@/components/finance/CashflowSankey';
import { BudgetProgress } from '@/components/finance/BudgetProgress';
import { WalletCards } from '@/components/finance/WalletCards';
import {
  getCurrentMonth,
  parseFinanceParams,
  FinancePageProps,
} from '@/lib/finance-utils';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function FinanceOverviewPage({
  searchParams,
}: FinancePageProps) {
  const filter = await parseFinanceParams(searchParams);
  const currentMonth = getCurrentMonth();

  const [stats, budgetProgress, exchanges, wallets, recurringTransactions] =
    await Promise.all([
      getFinanceStats(filter),
      getBudgetProgress(currentMonth),
      getExchanges(currentMonth),
      getWalletBalances(currentMonth),
      getRecurringTransactions(),
    ]);

  // Filter wallet to match current currency
  const currentCurrency = filter.currency || 'KRW';
  const filteredWallets = wallets.filter((w) => w.currency === currentCurrency);

  return (
    <div className="space-y-6">
      {/* Row 1: Unified Wallet + Budget Status */}
      <Card className="bg-card/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:border-r lg:pr-6 flex flex-col h-full">
              <WalletCards
                wallets={filteredWallets}
                projected={recurringTransactions as any}
                noCard
              />
            </div>
            <div className="lg:col-span-2">
              <BudgetProgress progress={budgetProgress} noCard />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 2: Cashflow Sankey + Finance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashflowSankey stats={stats} exchanges={exchanges} wallets={wallets} />
        <FinanceCharts stats={stats} />
      </div>
    </div>
  );
}
