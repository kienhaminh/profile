'use client';

import { FinanceStats } from '@/types/finance';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { NumericFormat } from 'react-number-format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingDown, TrendingUp, CreditCard } from 'lucide-react';
import {
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts';

interface FinanceStatsProps {
  stats: FinanceStats;
}

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
  if (!isMounted) {
    return (
      <div className="space-y-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
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
        <CardContent className="h-[350px] overflow-x-auto">
          <ResponsiveContainer width="100%" height="100%" minWidth={500}>
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
    </div>
  );
}
