'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { NumericFormat } from 'react-number-format';
import { FinanceRecurringTransaction, FinanceCategory } from '@/types/finance';
import {
  updateRecurringTransaction,
  deleteRecurringTransaction,
  generateRecurringTransactions,
} from '@/app/actions/finance';
import { RecurringDialog } from './RecurringDialog';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';

interface RecurringManagerProps {
  recurringTransactions: FinanceRecurringTransaction[];
  categories: FinanceCategory[];
}

export function RecurringManager({
  recurringTransactions,
  categories,
}: RecurringManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<
    FinanceRecurringTransaction | undefined
  >();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Group by type
  const incomeRecurring = recurringTransactions.filter(
    (r) => r.type === 'income'
  );
  const expenseRecurring = recurringTransactions.filter(
    (r) => r.type === 'expense'
  );

  const handleToggleActive = (recurring: FinanceRecurringTransaction) => {
    startTransition(async () => {
      try {
        await updateRecurringTransaction({
          id: recurring.id,
          isActive: !recurring.isActive,
        });
        toast.success(
          recurring.isActive
            ? 'Recurring transaction paused'
            : 'Recurring transaction activated'
        );
      } catch (error) {
        toast.error('Failed to update status');
        console.error(error);
      }
    });
  };

  const handleEdit = (recurring: FinanceRecurringTransaction) => {
    setEditingRecurring(recurring);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteRecurringTransaction(deleteId);
      toast.success('Recurring transaction deleted');
    } catch (error) {
      toast.error('Failed to delete');
      console.error(error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateRecurringTransactions();
      if (result.generated > 0) {
        toast.success(`Generated ${result.generated} transaction(s)`);
      } else {
        toast.info(
          'All recurring transactions already generated for this month'
        );
      }
    } catch (error) {
      toast.error('Failed to generate transactions');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingRecurring(undefined);
  };

  const formatCurrency = (amount: string | number, currency: string) => {
    const value = typeof amount === 'string' ? Number(amount) : amount;
    return (
      <NumericFormat
        value={value}
        displayType="text"
        thousandSeparator={true}
        prefix={currency === 'KRW' ? '₩' : '₫'}
      />
    );
  };

  const getDaySuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  const renderRecurringCard = (recurring: FinanceRecurringTransaction) => {
    const isIncome = recurring.type === 'income';
    const category = categories.find((c) => c.id === recurring.categoryId);

    return (
      <div
        key={recurring.id}
        className={`p-4 border rounded-lg transition-opacity ${
          !recurring.isActive ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isIncome ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-rose-500" />
              )}
              <h3 className="font-semibold truncate">{recurring.name}</h3>
            </div>

            <div
              className={`text-lg font-bold ${
                isIncome ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {isIncome ? '+' : '-'}
              {formatCurrency(recurring.amount, recurring.currency)}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {recurring.frequency === 'monthly'
                    ? `${recurring.dayOfMonth}${getDaySuffix(
                        recurring.dayOfMonth
                      )} of month`
                    : `Yearly on ${recurring.monthOfYear}/${recurring.dayOfMonth}`}
                </span>
                {recurring.frequency === 'yearly' && (
                  <Badge variant="outline" className="text-xs ml-1">
                    Yearly
                  </Badge>
                )}
              </div>

              {category && (
                <Badge variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              )}

              {recurring.priority && (
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    recurring.priority === 'must_have'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : recurring.priority === 'nice_to_have'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {recurring.priority.replace('_', ' ')}
                </Badge>
              )}
            </div>

            {recurring.description && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {recurring.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={recurring.isActive}
              onCheckedChange={() => handleToggleActive(recurring)}
              disabled={isPending}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEdit(recurring)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeleteId(recurring.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recurring Transactions</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Generate Now
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingRecurring(undefined);
                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Recurring
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Set up recurring income and expenses that generate automatically
            each month on the specified day.
          </p>

          {/* Income Section */}
          {incomeRecurring.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Recurring Income ({incomeRecurring.length})
              </h3>
              <div className="grid gap-3">
                {incomeRecurring.map(renderRecurringCard)}
              </div>
            </div>
          )}

          {/* Expense Section */}
          {expenseRecurring.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Recurring Expenses ({expenseRecurring.length})
              </h3>
              <div className="grid gap-3">
                {expenseRecurring.map(renderRecurringCard)}
              </div>
            </div>
          )}

          {recurringTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recurring transactions yet.</p>
              <p className="text-sm">
                Add your first recurring income or expense above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <RecurringDialog
        recurring={editingRecurring}
        categories={categories}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={() => {}}
      />

      <ConfirmDeleteDialog
        isOpen={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Recurring Transaction"
        description="Are you sure you want to delete this recurring transaction? This will not affect any transactions that have already been generated."
      />
    </>
  );
}
