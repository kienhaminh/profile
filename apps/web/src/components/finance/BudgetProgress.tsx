'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetProgress as BudgetProgressType } from '@/types/finance';
import { NumericFormat } from 'react-number-format';

interface BudgetProgressProps {
  progress: BudgetProgressType[];
}

function getProgressColor(percentage: number): string {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 75) return 'bg-yellow-500';
  return 'bg-green-500';
}

export function BudgetProgress({ progress }: BudgetProgressProps) {
  if (progress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No budgets set for this month. Go to the Budgets tab to set up your
            spending limits.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {progress.map((item) => (
          <div key={item.categoryId} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{item.categoryName}</span>
              <span className="text-sm text-muted-foreground flex gap-1">
                <NumericFormat
                  value={item.spentAmount}
                  displayType="text"
                  thousandSeparator=","
                  prefix={item.currency === 'KRW' ? '₩' : '₫'}
                />
                <span>/</span>
                <NumericFormat
                  value={item.budgetAmount}
                  displayType="text"
                  thousandSeparator=","
                  prefix={item.currency === 'KRW' ? '₩' : '₫'}
                />
              </span>
            </div>
            <div className="relative">
              <Progress
                value={item.percentage}
                className="h-3"
                indicatorClassName={getProgressColor(item.percentage)}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{item.percentage.toFixed(0)}% used</span>
              <span
                className={item.remaining < 0 ? 'text-red-500 font-medium' : ''}
              >
                {item.remaining >= 0 ? (
                  <NumericFormat
                    value={item.remaining}
                    displayType="text"
                    thousandSeparator=","
                    prefix={item.currency === 'KRW' ? '₩' : '₫'}
                    suffix=" remaining"
                  />
                ) : (
                  <NumericFormat
                    value={Math.abs(item.remaining)}
                    displayType="text"
                    thousandSeparator=","
                    prefix={item.currency === 'KRW' ? '₩' : '₫'}
                    suffix=" over budget"
                  />
                )}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
