'use client';

import { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { FinanceCategory, FinanceBudget, Currency } from '@/types/finance';
import { createOrUpdateBudget, deleteBudget } from '@/app/actions/finance';
import { CurrencyInput } from './CurrencyInput';

interface BudgetManagerProps {
  categories: FinanceCategory[];
  budgets: FinanceBudget[];
  currentMonth: string;
}

export function BudgetManager({
  categories,
  budgets,
  currentMonth,
}: BudgetManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [budgetValues, setBudgetValues] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      budgets.forEach((b) => {
        initial[b.categoryId] = b.amount;
      });
      return initial;
    }
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<Currency>('KRW');

  const filteredBudgets = budgets.filter((b) => b.currency === currency);

  // Update budget values when currency or budgets change
  useEffect(() => {
    const initial: Record<string, string> = {};
    budgets
      .filter((b) => b.currency === currency)
      .forEach((b) => {
        initial[b.categoryId] = b.amount;
      });
    setBudgetValues(initial);
  }, [currency, budgets]);

  const handleSave = (categoryId: string) => {
    const amount = parseFloat(budgetValues[categoryId] || '0');
    if (amount <= 0) {
      toast.error('Budget amount must be greater than 0');
      return;
    }

    setSavingId(categoryId);
    startTransition(async () => {
      try {
        await createOrUpdateBudget({
          categoryId,
          amount,
          currency,
          month: currentMonth,
        });
        toast.success('Budget saved');
      } catch (error) {
        toast.error('Failed to save budget');
        console.error(error);
      } finally {
        setSavingId(null);
      }
    });
  };

  const handleDelete = (budgetId: string) => {
    setDeletingId(budgetId);
    startTransition(async () => {
      try {
        await deleteBudget(budgetId);
        toast.success('Budget deleted');
      } catch (error) {
        toast.error('Failed to delete budget');
        console.error(error);
      } finally {
        setDeletingId(null);
      }
    });
  };

  const getBudgetForCategory = (categoryId: string) => {
    return budgets.find(
      (b) => b.categoryId === categoryId && b.currency === currency
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Budgets</CardTitle>
        <div className="flex items-center gap-4">
          <Select
            value={currency}
            onValueChange={(v) => setCurrency(v as Currency)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="KRW">KRW (₩)</SelectItem>
              <SelectItem value="VND">VND (₫)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Set spending limits for each category. Budgets automatically carry
          over to future months.
        </p>

        <div className="grid gap-4">
          {categories.map((category) => {
            const existingBudget = getBudgetForCategory(category.id);
            const isLoading =
              savingId === category.id || deletingId === existingBudget?.id;

            return (
              <div
                key={category.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <Label className="font-medium">{category.name}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <CurrencyInput
                    currency={currency}
                    placeholder="0.00"
                    className="w-32"
                    value={budgetValues[category.id] || ''}
                    onValueChange={(values) =>
                      setBudgetValues((prev) => ({
                        ...prev,
                        [category.id]: values.value,
                      }))
                    }
                    disabled={isLoading}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSave(category.id)}
                    disabled={isLoading || !budgetValues[category.id]}
                  >
                    {savingId === category.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                  {existingBudget && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(existingBudget.id)}
                      disabled={isLoading}
                    >
                      {deletingId === existingBudget.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {categories.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No categories available. Add categories first.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
