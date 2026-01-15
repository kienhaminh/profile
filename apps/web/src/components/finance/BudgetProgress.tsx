'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetProgress as BudgetProgressType } from '@/types/finance';
import { NumericFormat } from 'react-number-format';

interface BudgetProgressProps {
  progress: BudgetProgressType[];
  noCard?: boolean;
}

function getProgressColor(percentage: number): string {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 75) return 'bg-yellow-500';
  return 'bg-green-500';
}

export function BudgetProgress({ progress, noCard }: BudgetProgressProps) {
  if (progress.length === 0) {
    const emptyContent = (
      <div className="h-[200px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm text-center">
          No budgets set for this month.
        </p>
      </div>
    );
    if (noCard) return emptyContent;
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Budget Progress
          </CardTitle>
        </CardHeader>
        <CardContent>{emptyContent}</CardContent>
      </Card>
    );
  }

  const content = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {progress.map((item) => {
        const isOverBudget = item.remaining < 0;
        const statusColor = isOverBudget
          ? 'rose'
          : item.percentage > 80
            ? 'amber'
            : 'emerald';
        const bgClassName = `bg-${statusColor}-500/5`;
        const borderClassName = `border-${statusColor}-500/20`;

        return (
          <div
            key={item.categoryId}
            className={`p-2 rounded-lg border ${bgClassName} ${borderClassName} transition-all hover:bg-${statusColor}-500/10`}
          >
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[11px] font-bold tracking-tight">
                {item.categoryName}
              </span>
              <span
                className={`text-[10px] font-bold ${isOverBudget ? 'text-rose-500' : 'text-muted-foreground'}`}
              >
                <NumericFormat
                  value={item.spentAmount}
                  displayType="text"
                  thousandSeparator=","
                  prefix={item.currency === 'KRW' ? '₩' : '₫'}
                />
                <span className="mx-0.5 text-[9px] opacity-50">/</span>
                <NumericFormat
                  value={item.budgetAmount}
                  displayType="text"
                  thousandSeparator=","
                />
              </span>
            </div>

            <div className="relative mb-1.5">
              <Progress
                value={Math.min(item.percentage, 100)}
                className="h-1 bg-muted"
                indicatorClassName={getProgressColor(item.percentage)}
              />
            </div>

            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground font-medium">
                {item.percentage.toFixed(0)}% used
              </span>
              <span
                className={`font-bold ${isOverBudget ? 'text-rose-500' : 'text-emerald-500'}`}
              >
                {item.remaining >= 0 ? (
                  <NumericFormat
                    value={item.remaining}
                    displayType="text"
                    thousandSeparator=","
                    suffix=" left"
                  />
                ) : (
                  <NumericFormat
                    value={Math.abs(item.remaining)}
                    displayType="text"
                    thousandSeparator=","
                    suffix=" over"
                  />
                )}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (noCard) return content;

  return (
    <Card className="bg-card/50">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Budget Status
        </CardTitle>
        <div className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-medium text-muted-foreground">
          {progress.length} Categories
        </div>
      </CardHeader>
      <CardContent className="pt-0">{content}</CardContent>
    </Card>
  );
}
