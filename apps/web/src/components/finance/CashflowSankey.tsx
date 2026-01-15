'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FinanceStats, FinanceExchange, WalletStats } from '@/types/finance';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

const EXCHANGE_COLOR = '#8b5cf6'; // Violet 500
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

const PRIORITY_COLORS: Record<string, string> = {
  must_have: '#10b981', // Emerald 500 for Must Have (Good)
  nice_to_have: '#f59e0b', // Amber 500 for Nice to Have (Medium)
  waste: '#ef4444', // Red 500 for Waste (Bad)
  uncategorized: '#94a3b8', // Gray for uncategorized
};

interface TransformOptions {
  stats: FinanceStats;
  exchanges?: FinanceExchange[];
  wallets?: WalletStats[];
  breakdown: 'category' | 'priority';
}

function transformToSankeyData({
  stats,
  exchanges,
  wallets,
  breakdown,
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

  // Prepare Expense Data based on breakdown
  const expenseData =
    breakdown === 'category'
      ? stats.byCategory.filter(
          (c) => c.type === 'expense' && c.name !== 'Uncategorized'
        )
      : stats.byPriority.filter((p) => p.value > 0);

  const activeIncome =
    incomeCategories.length > 0
      ? incomeCategories.reduce((sum, c) => sum + c.value, 0)
      : stats.monthlyIncome;

  const activeExpense =
    expenseData.length > 0
      ? expenseData.reduce((sum, c) => sum + c.value, 0)
      : stats.monthlyExpense;

  // Use wallet data for monthly figures (correct monthly scope)
  // Fall back to stats only when wallets are not available
  const krwIncome = krwWallet?.monthlyIncome ?? activeIncome;
  const krwExpense = krwWallet?.monthlyExpense ?? activeExpense;

  const vndIncome = vndWallet?.monthlyIncome ?? 0;
  const vndExpense = vndWallet?.monthlyExpense ?? 0;

  // ============ BUILD NODES ============
  const nodeMap = new Map<string, number>(); // Track node indices

  // Helper to add node
  const addNode = (uniqueKey: string, displayName: string): number => {
    if (nodeMap.has(uniqueKey)) {
      return nodeMap.get(uniqueKey)!;
    }
    const index = nodes.length;
    nodes.push({ name: uniqueKey, displayName });
    nodeMap.set(uniqueKey, index);
    return index;
  };

  // -- Track Indices --
  let krwIncomeIndex = -1;
  let krwExpensesIndex = -1;
  let vndIncomeIndex = -1;

  let vndSurplusIndex = -1;
  let krwSurplusIndex = -1;
  let krwDeficitIndex = -1;
  const krwIncomeCatIndices = new Map<string, number>();
  const krwExpenseIndices = new Map<string, number>(); // Can be category or priority

  if (krwIncome > 0) {
    if (
      incomeCategories.length > 0 &&
      incomeCategories.some((c) => c.value > 0)
    ) {
      incomeCategories.forEach((cat) => {
        if (cat.value > 0) {
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
    if (expenseData.length > 0) {
      expenseData.forEach((item) => {
        if (item.value > 0) {
          const displayName =
            breakdown === 'priority'
              ? item.name
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())
              : item.name;

          krwExpenseIndices.set(
            item.name,
            addNode(`exp-${item.name}`, displayName)
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

  console.log(totalExchangeFromKRW);

  const totalExchangeToVND =
    krwWallet?.exchangeIn ||
    exchanges?.reduce(
      (sum, ex) =>
        ex.fromCurrency === 'KRW' ? sum + Number(ex.toAmount) : sum,
      0
    ) ||
    0;

  // 4. VND Wallet
  let vndWalletIndex = -1;
  const vndTotal = totalExchangeToVND + vndIncome;
  const vndRemaining = vndTotal - vndExpense;

  let exchangeNodeIndex = -1;
  const hasVndFlow = totalExchangeFromKRW > 0 || vndIncome > 0;

  if (hasVndFlow) {
    if (totalExchangeFromKRW > 0 && totalExchangeToVND > 0) {
      // User specifically requested the name 'exchange'
      exchangeNodeIndex = addNode('exchange', 'exchange');
    }

    vndWalletIndex = addNode('VND Wallet', 'VND Wallet');

    if (vndIncome > 0) {
      vndIncomeIndex = addNode('VND Income', 'VND Income');
    }

    if (vndRemaining > 0) {
      const label = `VND Surplus (₫${vndRemaining.toLocaleString()})`;
      vndSurplusIndex = addNode(label, label);
    }
  }

  // 5. KRW Available calculation (Income - Expense - Exchange)
  const krwNetFlow = krwIncome - krwExpense - totalExchangeFromKRW;

  if (krwNetFlow > 0) {
    // User specifically requested the name 'Available'
    const label = `Available (₩${krwNetFlow.toLocaleString()})`;
    krwSurplusIndex = addNode('Available', label);
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
    if (krwExpenseIndices.size > 0) {
      krwExpenseIndices.forEach((index, name) => {
        const value = expenseData.find((c) => c.name === name)?.value || 0;
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

  // Links: KRW Wallet → Exchange → VND Wallet
  if (
    totalExchangeFromKRW > 0 &&
    vndWalletIndex !== -1 &&
    totalExchangeToVND > 0 &&
    exchangeNodeIndex !== -1
  ) {
    links.push({
      source: krwWalletIndex,
      target: exchangeNodeIndex,
      value: totalExchangeFromKRW, // KRW Outflow
    });

    links.push({
      source: exchangeNodeIndex,
      target: vndWalletIndex,
      value: totalExchangeToVND, // VND Inflow
    });
  }

  // Links: KRW Wallet → Available (or Deficit)
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
  const [breakdown, setBreakdown] = useState<'category' | 'priority'>(
    'category'
  );
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sankeyData = useMemo(
    () => transformToSankeyData({ stats, exchanges, wallets, breakdown }),
    [stats, exchanges, wallets, breakdown]
  );

  const currency = searchParams?.get('currency') || 'KRW';
  const currencyPrefix =
    currency === 'VND' ? '₫' : currency === 'KRW' ? '₩' : '$';

  // Calculate totals for display using WALLET data (monthly scope)
  const krwWallet = wallets?.find((w) => w.currency === 'KRW');
  const vndWallet = wallets?.find((w) => w.currency === 'VND');

  // Use wallet monthly figures for correct monthly display
  const totalIncome = krwWallet?.monthlyIncome ?? stats.monthlyIncome;
  const totalExpense = krwWallet?.monthlyExpense ?? stats.monthlyExpense;

  const exchangeFromKRW = krwWallet?.exchangeOut ?? 0;
  const exchangeToVND = vndWallet?.exchangeIn ?? 0;

  // Adjust display totals based on currency
  const isVND = currency === 'VND';
  const displayIncome = isVND ? (vndWallet?.monthlyIncome ?? 0) : totalIncome;
  const displayExpense = isVND
    ? (vndWallet?.monthlyExpense ?? 0)
    : totalExpense;
  const netFlow =
    displayIncome - displayExpense - (isVND ? 0 : exchangeFromKRW);

  // Determine node colors
  const getNodeColor = (nodeName: string, index: number) => {
    // Wallet nodes
    if (nodeName.includes('KRW Wallet')) return KRW_WALLET_COLOR;
    if (nodeName.includes('VND Wallet')) return VND_WALLET_COLOR;
    if (nodeName === 'exchange') return EXCHANGE_COLOR;

    // Surplus/Deficit nodes
    if (nodeName === 'Available' || nodeName.includes('Surplus'))
      return SURPLUS_COLOR;
    if (nodeName.includes('Deficit')) return DEFICIT_COLOR;

    // Income nodes
    if (nodeName.includes('Income') || nodeName.startsWith('inc-'))
      return INCOME_COLOR;

    // Aggregated expense nodes
    if (nodeName.includes('Expenses')) return EXPENSE_COLORS[0];

    // Check if it's an income category
    const incomeCategories = stats.byCategory.filter(
      (c) => c.type === 'income' || c.name === 'Uncategorized'
    );
    if (incomeCategories.some((c) => nodeName.includes(c.name)))
      return INCOME_COLOR;

    // Handle Priority Colors
    if (breakdown === 'priority') {
      // Clean prefix "exp-"
      const cleanName = nodeName.replace('exp-', '');
      // Try to find if cleanName matches any priority key
      // The keys in stats.byPriority (and thus nodeName) are 'must_have', 'nice_to_have', 'waste'
      if (PRIORITY_COLORS[cleanName]) {
        return PRIORITY_COLORS[cleanName];
      }
    }

    // Expense category - try to match name
    const cleanName = nodeName.replace('exp-', '');
    const expenseIndex = stats.byCategory
      .filter((c) => c.type === 'expense')
      .findIndex((c) => c.name === cleanName);
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
    <Card className="h-full bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
        <div className="flex items-center gap-4">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Flow
          </CardTitle>
          <Select
            value={breakdown}
            onValueChange={(v: 'category' | 'priority') => setBreakdown(v)}
          >
            <SelectTrigger className="w-[130px] h-7 text-[10px] font-bold uppercase tracking-tight">
              <SelectValue placeholder="Breakdown By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">Categories</SelectItem>
              <SelectItem value="priority">Priorities</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 flex-wrap justify-end">
          <div className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-[8px] text-emerald-500 font-bold uppercase leading-none mb-0.5">
              Income
            </div>
            <div className="text-[10px] font-bold text-emerald-500">
              {currencyPrefix}
              {displayIncome.toLocaleString()}
            </div>
          </div>
          <div className="px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/20">
            <div className="text-[8px] text-rose-500 font-bold uppercase leading-none mb-0.5">
              Expense
            </div>
            <div className="text-[10px] font-bold text-rose-500">
              {currencyPrefix}
              {displayExpense.toLocaleString()}
            </div>
          </div>
          {!isVND && exchangeFromKRW > 0 && (
            <div className="px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/20">
              <div className="text-[8px] text-violet-500 font-bold uppercase leading-none mb-0.5">
                Exchange
              </div>
              <div className="text-[10px] font-bold text-violet-500">
                {currencyPrefix}
                {exchangeFromKRW.toLocaleString()}
              </div>
            </div>
          )}
          <div
            className={`px-2 py-1 rounded-md ${netFlow >= 0 ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-rose-500/20 border-rose-500/30'} border`}
          >
            <div
              className={`text-[8px] ${netFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'} font-bold uppercase leading-none mb-0.5`}
            >
              {netFlow >= 0 ? 'Available' : 'Deficit'}
            </div>
            <div
              className={`text-[10px] font-bold ${netFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}
            >
              {currencyPrefix}
              {Math.abs(netFlow).toLocaleString()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={sankeyData}
            nodeWidth={20}
            nodePadding={20}
            linkCurvature={0.5}
            iterations={64}
            node={(props) => {
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
                (sourceName === 'KRW Wallet' && targetName === 'exchange') ||
                (sourceName === 'exchange' && targetName === 'VND Wallet');

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
