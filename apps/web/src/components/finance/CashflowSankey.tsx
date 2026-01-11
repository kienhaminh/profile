'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FinanceStats, FinanceExchange, WalletStats } from '@/types/finance';

interface CashflowSankeyProps {
  stats: FinanceStats;
  exchanges?: FinanceExchange[];
  wallets?: WalletStats[];
}

// Adjusted interface to allow custom display name
interface SankeyNode {
  name: string;
  displayName?: string;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: { source: number; target: number; value: number }[];
}

// Colors for nodes
const INCOME_COLOR = '#10b981'; // Emerald 500
const KRW_WALLET_COLOR = '#3b82f6'; // Blue 500
const VND_WALLET_COLOR = '#f59e0b'; // Amber 500
const EXCHANGE_LINK_COLOR = '#8b5cf6'; // Violet 500 (for links)
const EXPENSE_COLORS = [
  '#ef4444', // Red 500
  '#f97316', // Orange 500
  '#eab308', // Yellow 500
  '#84cc16', // Lime 500
  '#22c55e', // Green 500
  '#14b8a6', // Teal 500
  '#06b6d4', // Cyan 500
  '#0ea5e9', // Sky 500
  '#6366f1', // Indigo 500
  '#a855f7', // Purple 500
  '#ec4899', // Pink 500
];

const SURPLUS_COLOR = '#10b981'; // Green for surplus
const DEFICIT_COLOR = '#ef4444'; // Red for deficit

interface TransformOptions {
  stats: FinanceStats;
  exchanges?: FinanceExchange[];
  wallets?: WalletStats[];
}

function transformToSankeyData({
  stats,
  exchanges,
  wallets,
}: TransformOptions): SankeyData {
  const nodes: SankeyNode[] = [];
  const links: { source: number; target: number; value: number }[] = [];

  // Get wallet data
  const krwWallet = wallets?.find((w) => w.currency === 'KRW');
  const vndWallet = wallets?.find((w) => w.currency === 'VND');

  // If no wallet data, fall back to empty
  if (!krwWallet && !vndWallet) {
    return { nodes: [], links: [] };
  }

  // Separate income and expense categories from stats
  // Force 'Uncategorized' to be treated as income
  const incomeCategories = stats.byCategory.filter(
    (c) => c.type === 'income' || c.name === 'Uncategorized'
  );
  const expenseCategories = stats.byCategory.filter(
    (c) => c.type === 'expense' && c.name !== 'Uncategorized'
  );

  // ============ BUILD NODES ============
  const nodeMap = new Map<string, number>(); // Track node indices

  // Helper to add node
  // Use uniqueKey for tracking, but allow custom displayName
  const addNode = (uniqueKey: string, displayName: string): number => {
    if (nodeMap.has(uniqueKey)) {
      return nodeMap.get(uniqueKey)!;
    }
    const index = nodes.length;
    nodes.push({ name: uniqueKey, displayName });
    nodeMap.set(uniqueKey, index);
    return index;
  };

  // 1. Determine Income/Expense amounts based on currency context
  // Use stats for the active currency to ensure consistency with filters
  // Fallback to wallet data for non-active currency
  const isKRW =
    (!wallets && !exchanges) ||
    (stats.monthlyIncome > 0 &&
      (!wallets?.find((w) => w.currency === 'KRW')?.monthlyIncome ||
        stats.monthlyIncome !==
          wallets?.find((w) => w.currency === 'KRW')?.monthlyIncome));

  // Calculate totals from categories to reflect any re-categorization (e.g. Uncategorized -> Income)
  const activeIncome =
    incomeCategories.length > 0
      ? incomeCategories.reduce((sum, c) => sum + c.value, 0)
      : stats.monthlyIncome;

  const activeExpense =
    expenseCategories.length > 0
      ? expenseCategories.reduce((sum, c) => sum + c.value, 0)
      : stats.monthlyExpense;

  const krwIncome =
    isKRW || !wallets ? activeIncome : krwWallet?.monthlyIncome || 0;
  const krwExpense =
    isKRW || !wallets ? activeExpense : krwWallet?.monthlyExpense || 0;

  // For VND, separate income and expense
  const vndIncome = !isKRW
    ? activeIncome || vndWallet?.monthlyIncome || 0
    : vndWallet?.monthlyIncome || 0;
  // VND Expense from stats if active, otherwise from wallet
  const vndExpense = !isKRW ? activeExpense : vndWallet?.monthlyExpense || 0;

  // -- Track Indices --
  let krwIncomeIndex = -1;
  let krwExpensesIndex = -1;
  let vndIncomeIndex = -1;
  let vndExpensesIndex = -1;
  let vndSurplusIndex = -1;
  let krwSurplusIndex = -1;
  let krwDeficitIndex = -1;
  const krwIncomeCatIndices = new Map<string, number>();
  const krwExpenseCatIndices = new Map<string, number>();

  if (krwIncome > 0) {
    // Use category breakdown if available and income > 0
    if (
      incomeCategories.length > 0 &&
      incomeCategories.some((c) => c.value > 0)
    ) {
      incomeCategories.forEach((cat) => {
        if (cat.value > 0) {
          // Prefix to ensure Income categories are distinct from Expense categories
          krwIncomeCatIndices.set(
            cat.name,
            addNode(`inc-${cat.name}`, cat.name)
          );
        }
      });
    } else {
      krwIncomeIndex = addNode('KRW Income', 'KRW Income');
    }
  }

  // 2. KRW Wallet (central hub)
  const krwWalletIndex = addNode('KRW Wallet', 'KRW Wallet');

  // 3. KRW Expense nodes
  if (krwExpense > 0) {
    // Use category breakdown if available
    if (
      expenseCategories.length > 0 &&
      expenseCategories.some((c) => c.value > 0)
    ) {
      // Filter expense categories that are NOT VND if we can distinguish?
      // For now assume all 'expense' type categories in stats are KRW if isKRW is true
      expenseCategories.forEach((cat) => {
        if (cat.value > 0) {
          // Prefix for expenses
          krwExpenseCatIndices.set(
            cat.name,
            addNode(`exp-${cat.name}`, cat.name)
          );
        }
      });
    } else {
      krwExpensesIndex = addNode('KRW Expenses', 'KRW Expenses');
    }
  }

  // Pre-calculate exchange totals
  const totalExchangeFromKRW =
    krwWallet?.exchangeOut ||
    exchanges?.reduce(
      (sum, ex) =>
        ex.fromCurrency === 'KRW' ? sum + Number(ex.fromAmount) : sum,
      0
    ) ||
    0;

  const totalExchangeToVND =
    krwWallet?.exchangeIn || // Assuming wallet has this, or we calculate
    exchanges?.reduce(
      (sum, ex) =>
        ex.fromCurrency === 'KRW' ? sum + Number(ex.toAmount) : sum,
      0
    ) ||
    0;

  // 4. VND Wallet (if there are exchanges or VND income)
  let vndWalletIndex = -1;
  const vndTotal = totalExchangeToVND + vndIncome;
  const vndRemaining = vndTotal - vndExpense;

  if (totalExchangeFromKRW > 0 || vndIncome > 0 || vndExpense > 0) {
    vndWalletIndex = addNode('VND Wallet', 'VND Wallet');

    // VND Income
    if (vndIncome > 0) {
      vndIncomeIndex = addNode('VND Income', 'VND Income');
    }

    // VND Expenses node (aggregated)
    if (vndExpense > 0) {
      const label = `VND Expenses (₫${vndExpense.toLocaleString()})`;
      vndExpensesIndex = addNode(label, label);
    }

    if (vndRemaining > 0) {
      const label = `VND Surplus (₫${vndRemaining.toLocaleString()})`;
      vndSurplusIndex = addNode(label, label);
    }
  }

  // 5. KRW Surplus/Deficit
  const krwNetFlow = krwIncome - krwExpense - totalExchangeFromKRW;
  if (krwNetFlow > 0) {
    const label = `KRW Surplus (₩${krwNetFlow.toLocaleString()})`;
    krwSurplusIndex = addNode(label, label);
  } else if (krwNetFlow < 0) {
    const label = `KRW Deficit (₩${Math.abs(krwNetFlow).toLocaleString()})`;
    krwDeficitIndex = addNode(label, label);
  }

  // ============ BUILD LINKS ============

  // Links: KRW Income → KRW Wallet
  if (krwIncome > 0) {
    if (krwIncomeCatIndices.size > 0) {
      krwIncomeCatIndices.forEach((index, name) => {
        const value = incomeCategories.find((c) => c.name === name)?.value || 0;
        if (value > 0) {
          links.push({
            source: index,
            target: krwWalletIndex,
            value: value,
          });
        }
      });
    } else if (krwIncomeIndex !== -1) {
      links.push({
        source: krwIncomeIndex,
        target: krwWalletIndex,
        value: krwIncome,
      });
    }
  }

  // Links: KRW Wallet → KRW Expenses
  if (krwExpense > 0) {
    if (krwExpenseCatIndices.size > 0) {
      krwExpenseCatIndices.forEach((index, name) => {
        const value =
          expenseCategories.find((c) => c.name === name)?.value || 0;
        if (value > 0) {
          links.push({
            source: krwWalletIndex,
            target: index,
            value: value,
          });
        }
      });
    } else if (krwExpensesIndex !== -1) {
      links.push({
        source: krwWalletIndex,
        target: krwExpensesIndex,
        value: krwExpense,
      });
    }
  }

  // Links: KRW Wallet → VND Wallet (exchange)
  if (
    totalExchangeFromKRW > 0 &&
    vndWalletIndex !== -1 &&
    totalExchangeToVND > 0
  ) {
    links.push({
      source: krwWalletIndex,
      target: vndWalletIndex,
      value: totalExchangeToVND, // Visualizes the FLOW into VND
    });
  }

  // Links: VND Income → VND Wallet
  if (vndIncome > 0 && vndIncomeIndex !== -1 && vndWalletIndex !== -1) {
    links.push({
      source: vndIncomeIndex,
      target: vndWalletIndex,
      value: vndIncome,
    });
  }

  // Links: VND Wallet → VND Expenses
  if (vndExpense > 0 && vndExpensesIndex !== -1 && vndWalletIndex !== -1) {
    links.push({
      source: vndWalletIndex,
      target: vndExpensesIndex,
      value: vndExpense,
    });
  }

  // Links: VND Wallet → VND Surplus
  if (vndRemaining > 0 && vndSurplusIndex !== -1 && vndWalletIndex !== -1) {
    links.push({
      source: vndWalletIndex,
      target: vndSurplusIndex,
      value: vndRemaining,
    });
  }

  // Links: KRW Wallet → KRW Surplus/Deficit
  if (krwNetFlow > 0 && krwSurplusIndex !== -1) {
    links.push({
      source: krwWalletIndex,
      target: krwSurplusIndex,
      value: krwNetFlow,
    });
  } else if (krwNetFlow < 0 && krwDeficitIndex !== -1) {
    links.push({
      source: krwWalletIndex,
      target: krwDeficitIndex,
      value: Math.abs(krwNetFlow),
    });
  }

  return { nodes, links };
}

export function CashflowSankey({
  stats,
  exchanges,
  wallets,
}: CashflowSankeyProps) {
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sankeyData = useMemo(
    () => transformToSankeyData({ stats, exchanges, wallets }),
    [stats, exchanges, wallets]
  );

  const currency = searchParams?.get('currency') || 'KRW';
  const currencyPrefix =
    currency === 'VND' ? '₫' : currency === 'KRW' ? '₩' : '$';

  // Calculate totals for display
  const incomeCategories = stats.byCategory.filter(
    (c) => c.type === 'income' || c.name === 'Uncategorized'
  );
  const expenseCategories = stats.byCategory.filter(
    (c) => c.type === 'expense' && c.name !== 'Uncategorized'
  );
  const totalIncome =
    incomeCategories.reduce((sum, c) => sum + c.value, 0) ||
    stats.monthlyIncome;
  const totalExpense = expenseCategories.reduce((sum, c) => sum + c.value, 0);

  const exchangeToVND =
    exchanges?.reduce((sum, ex) => {
      if (ex.toCurrency === 'VND') {
        return sum + Number(ex.fromAmount); // Show KRW flowing out
      }
      return sum;
    }, 0) || 0;

  const netFlow = totalIncome - totalExpense - exchangeToVND;

  // Determine node colors
  const getNodeColor = (nodeName: string, index: number) => {
    // Wallet nodes
    if (nodeName.includes('KRW Wallet')) return KRW_WALLET_COLOR;
    if (nodeName.includes('VND Wallet')) return VND_WALLET_COLOR;

    // Surplus/Deficit nodes
    if (nodeName.includes('Surplus')) return SURPLUS_COLOR;
    if (nodeName.includes('Deficit')) return DEFICIT_COLOR;

    // Income nodes
    if (nodeName.includes('Income') || nodeName.startsWith('inc-'))
      return INCOME_COLOR;

    // Aggregated expense nodes
    if (nodeName.includes('Expenses')) return EXPENSE_COLORS[0];

    // Check if it's an income category (fallback/legacy check)
    if (incomeCategories.some((c) => nodeName.includes(c.name)))
      return INCOME_COLOR;

    // Expense category - try to match name
    // Cleanup prefix "exp-" if present
    const cleanName = nodeName.replace('exp-', '');
    const expenseIndex = expenseCategories.findIndex(
      (c) => c.name === cleanName
    );
    if (expenseIndex >= 0) {
      return EXPENSE_COLORS[expenseIndex % EXPENSE_COLORS.length];
    }

    return EXPENSE_COLORS[index % EXPENSE_COLORS.length];
  };

  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cashflow</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  if (sankeyData.nodes.length === 0 || sankeyData.links.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cashflow</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">
            No transaction data available for the selected period.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle>Cashflow</CardTitle>
        <div className="flex gap-4 text-sm flex-wrap">
          <span className="text-emerald-500 font-medium">
            Income: {currencyPrefix}
            {totalIncome.toLocaleString()}
          </span>
          <span className="text-rose-500 font-medium">
            Expense: {currencyPrefix}
            {totalExpense.toLocaleString()}
          </span>
          {exchangeToVND > 0 && (
            <span className="text-violet-500 font-medium">
              Exchange: {currencyPrefix}
              {exchangeToVND.toLocaleString()}
            </span>
          )}
          <span
            className={`font-medium ${netFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
          >
            {netFlow >= 0 ? 'Surplus' : 'Deficit'}: {currencyPrefix}
            {Math.abs(netFlow).toLocaleString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={sankeyData}
            nodeWidth={15}
            nodePadding={40}
            linkCurvature={0.5}
            iterations={64}
            node={(props) => {
              // Cast payload to our custom interface
              const payload = props.payload as SankeyNode;
              const { x, y, width, height, index } = props;
              const name = payload.name;
              const displayName = payload.displayName || name;
              const color = getNodeColor(name, index);
              const isWalletNode =
                name === 'KRW Wallet' || name === 'VND Wallet';

              return (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={color}
                    fillOpacity={isWalletNode ? 1 : 0.9}
                    rx={4}
                    ry={4}
                    stroke={isWalletNode ? color : 'none'}
                    strokeWidth={isWalletNode ? 2 : 0}
                  />
                  <text
                    x={
                      isWalletNode
                        ? x + width / 2
                        : x > 200
                          ? x - 6
                          : x + width + 6
                    }
                    y={y + height / 2}
                    textAnchor={
                      isWalletNode ? 'middle' : x > 200 ? 'end' : 'start'
                    }
                    dominantBaseline="middle"
                    fontSize={isWalletNode ? 12 : 11}
                    fill={isWalletNode ? '#fff' : 'currentColor'}
                    className={isWalletNode ? 'font-bold' : 'font-medium'}
                  >
                    {displayName}
                  </text>
                </g>
              );
            }}
            link={(props) => {
              const {
                sourceX,
                targetX,
                sourceY,
                targetY,
                sourceControlX,
                targetControlX,
                linkWidth,
                payload,
              } = props;

              // Recharts passes initialized objects for source/target in payload
              const sourceNode = payload.source as any;
              const targetNode = payload.target as any;

              const sourceName =
                sourceNode?.name ||
                (typeof sourceNode === 'number'
                  ? sankeyData.nodes[sourceNode]?.name
                  : '');
              const targetName =
                targetNode?.name ||
                (typeof targetNode === 'number'
                  ? sankeyData.nodes[targetNode]?.name
                  : '');

              const isExchangeLink =
                sourceName === 'KRW Wallet' && targetName === 'VND Wallet';

              return (
                <path
                  d={`
                    M${sourceX},${sourceY}
                    C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
                  `}
                  fill="none"
                  stroke={isExchangeLink ? EXCHANGE_LINK_COLOR : '#888'}
                  strokeOpacity={isExchangeLink ? 0.6 : 0.3}
                  strokeWidth={Math.max(linkWidth, 1)}
                />
              );
            }}
          >
            <Tooltip
              formatter={(value: number) => [
                `${currencyPrefix}${value.toLocaleString()}`,
                'Amount',
              ]}
            />
          </Sankey>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
