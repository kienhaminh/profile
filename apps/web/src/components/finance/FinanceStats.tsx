'use client';

import { FinanceStats } from '@/types/finance';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingDown, TrendingUp, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import {
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

export function FinanceStatsCards({ stats }: FinanceStatsProps) {
  const searchParams = useSearchParams();
  const currency = searchParams?.get('currency') || 'USD';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-background/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Income
          </CardTitle>
          <div className="p-2 bg-emerald-500/10 rounded-full">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {formatCurrency(stats.monthlyIncome, currency)}
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-background/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Expense
          </CardTitle>
          <div className="p-2 bg-rose-500/10 rounded-full">
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {formatCurrency(stats.monthlyExpense, currency)}
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-background/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Weekly Expense
          </CardTitle>
          <div className="p-2 bg-primary/10 rounded-full">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {formatCurrency(stats.weeklyExpense, currency)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function FinanceCharts({ stats }: FinanceStatsProps) {
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const currency = searchParams?.get('currency') || 'USD';

  return (
    <div className="space-y-6 mb-8">
      <Card className="bg-background/80 backdrop-blur-sm border-border/60">
        <CardHeader>
          <CardTitle>Monthly Overview (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] overflow-x-auto">
          <ResponsiveContainer width="100%" height="100%" minWidth={500}>
            <BarChart data={stats.monthlyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                opacity={0.5}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                tickMargin={10}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                tickFormatter={(value) => {
                  if (value >= 1000000)
                    return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                  return value;
                }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--popover-foreground)',
                }}
                itemStyle={{ color: 'var(--popover-foreground)' }}
                formatter={(value) => formatCurrency(Number(value), currency)}
                cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar
                dataKey="income"
                name="Income"
                fill="var(--chart-1)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="var(--chart-2)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
