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

  // Sort by date then type
  const sortedRecurring = [...recurringTransactions].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'income' ? -1 : 1;
    return a.dayOfMonth - b.dayOfMonth;
  });

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

  return (
    <>
      <Card className="overflow-hidden border-none bg-background/40 backdrop-blur-md shadow-2xl border border-white/5">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-muted/20">
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Recurring Transactions
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Automated income and expenses for your budget.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="h-8 text-xs font-semibold hover:bg-primary/10 transition-all duration-300"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
              )}
              Generate
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingRecurring(undefined);
                setDialogOpen(true);
              }}
              className="h-8 text-xs font-semibold shadow-lg hover:shadow-primary/20 transition-all duration-300"
            >
              <Plus className="mr-2 h-3.5 w-3.5" />
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-[48px_1fr_120px_100px_140px_80px_80px] gap-4 px-6 py-3 bg-muted/20 text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground/60 border-b border-muted/20">
                <div className="flex justify-center">Type</div>
                <div>Plan Name</div>
                <div>Category</div>
                <div>Schedule</div>
                <div className="text-right">Amount</div>
                <div className="text-center">Active</div>
                <div className="text-right">Actions</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-muted/10">
                {sortedRecurring.length > 0 ? (
                  sortedRecurring.map((recurring) => {
                    const isIncome = recurring.type === 'income';
                    const category = categories.find(
                      (c) => c.id === recurring.categoryId
                    );

                    return (
                      <div
                        key={recurring.id}
                        className={`grid grid-cols-[48px_1fr_120px_100px_140px_80px_80px] gap-4 px-6 py-3 items-center hover:bg-muted/30 transition-all group ${
                          !recurring.isActive ? 'opacity-60 bg-muted/5' : ''
                        }`}
                      >
                        {/* Type Icon */}
                        <div className="flex justify-center">
                          <div
                            className={`p-1.5 rounded-full ${
                              isIncome
                                ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                : 'bg-rose-500/10 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                            }`}
                          >
                            {isIncome ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5" />
                            )}
                          </div>
                        </div>

                        {/* Name & Description */}
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {recurring.name}
                          </div>
                          {recurring.description && (
                            <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                              {recurring.description}
                            </div>
                          )}
                        </div>

                        {/* Category */}
                        <div className="min-w-0">
                          {category ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-2 h-5 font-bold bg-background/50 border-muted/50 text-muted-foreground group-hover:text-foreground transition-colors"
                            >
                              {category.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">
                              —
                            </span>
                          )}
                        </div>

                        {/* Schedule */}
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                          <Calendar className="h-3 w-3 opacity-50" />
                          <span>
                            {recurring.frequency === 'monthly'
                              ? `${recurring.dayOfMonth}${getDaySuffix(
                                  recurring.dayOfMonth
                                )}`
                              : `${recurring.monthOfYear}/${recurring.dayOfMonth}`}
                          </span>
                          {recurring.frequency === 'yearly' && (
                            <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1 rounded uppercase font-bold border border-blue-500/20">
                              Yearly
                            </span>
                          )}
                        </div>

                        {/* Amount */}
                        <div
                          className={`text-right font-bold tabular-nums text-sm ${
                            isIncome ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(recurring.amount, recurring.currency)}
                        </div>

                        {/* Active Switch */}
                        <div className="flex justify-center">
                          <Switch
                            checked={recurring.isActive}
                            onCheckedChange={() =>
                              handleToggleActive(recurring)
                            }
                            className="scale-75 data-[state=checked]:bg-emerald-500"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-full hover:bg-muted"
                            onClick={() => handleEdit(recurring)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 rounded-full hover:bg-rose-500/10 hover:text-rose-500"
                            onClick={() => setDeleteId(recurring.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="flex justify-center mb-3">
                      <RefreshCw className="h-10 w-10 opacity-10 animate-spin-slow" />
                    </div>
                    <p className="text-sm font-medium">
                      No recurring transactions found
                    </p>
                    <p className="text-[11px]">
                      Add recurring income or expenses to automate your budget.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
