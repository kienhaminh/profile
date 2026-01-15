'use client';

import { useState, useTransition, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Save,
  Trash2,
  ShieldCheck,
  Target,
  Calculator,
} from 'lucide-react';
import { toast } from 'sonner';
import { FinanceCategory, FinanceBudget, Currency } from '@/types/finance';
import { createOrUpdateBudget, deleteBudget } from '@/app/actions/finance';
import { CurrencyInput } from './CurrencyInput';
import { cn } from '@/lib/utils';

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
    const amountStr = budgetValues[categoryId] || '0';
    const amount = parseFloat(amountStr);

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
        toast.success('Budget saved successfully');
      } catch (error) {
        toast.error('Failed to save budget');
        console.error(error);
      } finally {
        setSavingId(null);
      }
    });
  };

  const handleDelete = (budgetId: string, categoryId: string) => {
    setDeletingId(budgetId);
    startTransition(async () => {
      try {
        await deleteBudget(budgetId);
        setBudgetValues((prev) => {
          const updated = { ...prev };
          delete updated[categoryId];
          return updated;
        });
        toast.success('Budget removed');
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
    <div className="space-y-6">
      {/* Header & Currency Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Category Budgets
          </h3>
          <p className="text-xs text-muted-foreground">
            Set and manage your monthly spending limits for each category.
          </p>
        </div>

        <div className="flex bg-muted p-1 rounded-xl w-fit">
          <Button
            size="sm"
            variant={currency === 'KRW' ? 'secondary' : 'ghost'}
            className={cn(
              'rounded-lg h-8 px-4 text-xs font-bold',
              currency === 'KRW' && 'bg-background shadow-sm'
            )}
            onClick={() => setCurrency('KRW')}
          >
            KRW (₩)
          </Button>
          <Button
            size="sm"
            variant={currency === 'VND' ? 'secondary' : 'ghost'}
            className={cn(
              'rounded-lg h-8 px-4 text-xs font-bold',
              currency === 'VND' && 'bg-background shadow-sm'
            )}
            onClick={() => setCurrency('VND')}
          >
            VND (₫)
          </Button>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories
          .filter((c) => c.type === 'expense' || !c.type) // Only expense categories get budgets
          .map((category) => {
            const existingBudget = getBudgetForCategory(category.id);
            const isLoading =
              savingId === category.id ||
              (existingBudget && deletingId === existingBudget.id);
            const isModified = existingBudget
              ? parseFloat(budgetValues[category.id] || '0') !==
                parseFloat(existingBudget.amount)
              : !!budgetValues[category.id];

            return (
              <Card
                key={category.id}
                className={cn(
                  'bg-card/40 border-border/50 hover:border-border/80 transition-all',
                  existingBudget && 'bg-primary/[0.02] border-primary/20'
                )}
              >
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'p-1.5 rounded-lg',
                          existingBudget
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <Calculator className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-bold tracking-tight truncate max-w-[140px]">
                        {category.name}
                      </span>
                    </div>
                    {existingBudget && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                        <ShieldCheck className="h-3 w-3" />
                        ACTIVE
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-end gap-3 mt-2">
                    <div className="relative">
                      <CurrencyInput
                        currency={currency}
                        placeholder="0.00"
                        className="h-10 text-lg font-bold pr-12 focus-visible:ring-primary/30"
                        value={budgetValues[category.id] || ''}
                        onValueChange={(values) =>
                          setBudgetValues((prev) => ({
                            ...prev,
                            [category.id]: values.value,
                          }))
                        }
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                        {currency}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 h-9 font-bold text-xs"
                        onClick={() => handleSave(category.id)}
                        disabled={
                          isLoading || !budgetValues[category.id] || !isModified
                        }
                        variant={isModified ? 'default' : 'secondary'}
                      >
                        {savingId === category.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Save className="h-3.5 w-3.5 mr-2" />
                        )}
                        {existingBudget ? 'Update Limit' : 'Set Budget'}
                      </Button>
                      {existingBudget && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                          onClick={() =>
                            handleDelete(existingBudget.id, category.id)
                          }
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
                </CardContent>
              </Card>
            );
          })}
      </div>

      {categories.length === 0 && (
        <div className="bg-card/50 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground font-medium">
            No categories available. Please add categories in the Categories tab
            first.
          </p>
        </div>
      )}
    </div>
  );
}
