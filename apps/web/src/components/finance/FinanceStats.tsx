'use client';

import { FinanceStats } from '@/types/finance';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { NumericFormat } from 'react-number-format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingDown, TrendingUp, CreditCard } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface FinanceStatsProps {
  stats: FinanceStats;
}

const COLORS = [
  '#262626', // Neutral 800
  '#525252', // Neutral 600
  '#737373', // Neutral 500
  '#a3a3a3', // Neutral 400
  '#d4d4d4', // Neutral 300
  '#e5e5e5', // Neutral 200
];

export function FinanceStatsCards({ stats }: FinanceStatsProps) {
  const searchParams = useSearchParams();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-500">
            <NumericFormat
              value={stats.monthlyIncome}
              displayType="text"
              thousandSeparator=","
              prefix={
                searchParams?.get('currency') === 'VND'
                  ? '₫'
                  : searchParams?.get('currency') === 'KRW'
                    ? '₩'
                    : '$'
              }
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Expense</CardTitle>
          <TrendingDown className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-500">
            <NumericFormat
              value={stats.monthlyExpense}
              displayType="text"
              thousandSeparator=","
              prefix={
                searchParams?.get('currency') === 'VND'
                  ? '₫'
                  : searchParams?.get('currency') === 'KRW'
                    ? '₩'
                    : '$'
              }
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Expense</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <NumericFormat
              value={stats.weeklyExpense}
              displayType="text"
              thousandSeparator=","
              prefix={
                searchParams?.get('currency') === 'VND'
                  ? '₫'
                  : searchParams?.get('currency') === 'KRW'
                    ? '₩'
                    : '$'
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FinanceCharts({ stats }: FinanceStatsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const searchParams = useSearchParams();
  const expenseCategories = stats.byCategory.filter(
    (c) => c.type === 'expense'
  );

  // Ensure all priority types are always present
  const allPriorities = ['must_have', 'nice_to_have', 'waste'];
  const priorityData = allPriorities.map((priority) => {
    const existing = stats.byPriority.find((p) => p.name === priority);
    return {
      name: priority,
      value: existing?.value || 0,
    };
  });

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Priority</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <BarChart data={stats.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickMargin={10} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000000)
                    return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                  return value;
                }}
              />
              <Tooltip
                formatter={(value) => {
                  const currency = searchParams?.get('currency');
                  const prefix =
                    currency === 'VND' ? '₫' : currency === 'KRW' ? '₩' : '$';
                  return `${prefix}${Number(value).toLocaleString()}`;
                }}
              />
              <Legend />
              <Bar
                dataKey="income"
                name="Income"
                fill="#10b981" // Emerald 500
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#ef4444" // Rose 500
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {expenseCategories.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No expense data for the selected filters.
              </div>
            ) : (
              <ResponsiveContainer
                key="category-chart"
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={0}
              >
                <BarChart data={expenseCategories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => {
                      const currency = searchParams?.get('currency');
                      const prefix =
                        currency === 'VND'
                          ? '₫'
                          : currency === 'KRW'
                            ? '₩'
                            : '$';
                      return `${prefix}${Number(value).toLocaleString()}`;
                    }}
                  />
                  <Bar dataKey="value" name="Amount" radius={[0, 4, 4, 0]}>
                    {expenseCategories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by Priority</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer
              key="priority-chart"
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={0}
            >
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickFormatter={(val) => val.replace(/_/g, ' ')}
                  className="capitalize"
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => {
                    const currency = searchParams?.get('currency');
                    const prefix =
                      currency === 'VND' ? '₫' : currency === 'KRW' ? '₩' : '$';
                    return `${prefix}${Number(value).toLocaleString()}`;
                  }}
                  labelFormatter={(label) =>
                    label.toString().replace(/_/g, ' ')
                  }
                />
                <Bar
                  dataKey="value"
                  fill="currentColor"
                  className="text-primary/40"
                  name="Amount"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
