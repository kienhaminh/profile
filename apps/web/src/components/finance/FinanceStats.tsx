'use client';

import { FinanceStats } from '@/types/finance';
import { useSearchParams } from 'next/navigation';
import { NumericFormat } from 'react-number-format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
];

export function FinanceStatsCards({ stats }: FinanceStatsProps) {
  const searchParams = useSearchParams();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
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
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
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
  const searchParams = useSearchParams();
  const expenseCategories = stats.byCategory.filter(
    (c) => c.type === 'expense'
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }: any) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {expenseCategories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => {
                    const currency = searchParams?.get('currency');
                    const prefix =
                      currency === 'VND' ? '₫' : currency === 'KRW' ? '₩' : '$';
                    return `${prefix}${Number(value).toLocaleString()}`;
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses by Priority</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {stats.byPriority.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No priority data for the selected filters.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickFormatter={(val) => val.replace(/_/g, ' ')}
                  className="capitalize"
                />
                <YAxis />
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
                <Bar dataKey="value" fill="#8884d8" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
