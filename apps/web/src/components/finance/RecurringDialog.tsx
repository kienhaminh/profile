'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CurrencyInput } from './CurrencyInput';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import {
  createRecurringTransaction,
  updateRecurringTransaction,
} from '@/app/actions/finance';
import {
  FinanceRecurringTransaction,
  FinanceCategory,
  FinanceTransactionType,
} from '@/types/finance';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.enum(['KRW', 'VND']),
  categoryId: z.string().optional(),
  priority: z.enum(['must_have', 'nice_to_have', 'waste']).optional(),
  frequency: z.enum(['monthly', 'yearly']),
  dayOfMonth: z.coerce.number().min(1).max(31),
  monthOfYear: z.coerce.number().min(1).max(12).optional(),
  description: z.string().optional(),
});

type RecurringFormValues = z.infer<typeof formSchema>;

interface RecurringDialogProps {
  recurring?: FinanceRecurringTransaction;
  categories: FinanceCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RecurringDialog({
  recurring,
  categories,
  open,
  onOpenChange,
  onSuccess,
}: RecurringDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RecurringFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: recurring?.name || '',
      type: recurring?.type || 'expense',
      amount: recurring ? Number(recurring.amount) : 0,
      currency: recurring?.currency || 'KRW',
      categoryId: recurring?.categoryId || undefined,
      priority: recurring?.priority || undefined,
      frequency: recurring?.frequency || 'monthly',
      dayOfMonth: recurring?.dayOfMonth || 1,
      monthOfYear: recurring?.monthOfYear || undefined,
      description: recurring?.description || '',
    },
  });

  // Reset form when dialog opens with different data
  useEffect(() => {
    if (open) {
      form.reset({
        name: recurring?.name || '',
        type: recurring?.type || 'expense',
        amount: recurring ? Number(recurring.amount) : 0,
        currency: recurring?.currency || 'KRW',
        categoryId: recurring?.categoryId || undefined,
        priority: recurring?.priority || undefined,
        frequency: recurring?.frequency || 'monthly',
        dayOfMonth: recurring?.dayOfMonth || 1,
        monthOfYear: recurring?.monthOfYear || undefined,
        description: recurring?.description || '',
      });
    }
  }, [open, recurring, form]);

  const selectedType = form.watch('type');

  // Filter categories by selected type
  const filteredCategories = categories.filter(
    (c) => c.type === selectedType || !c.type
  );

  async function onSubmit(values: RecurringFormValues) {
    setIsLoading(true);
    try {
      if (recurring) {
        await updateRecurringTransaction({
          id: recurring.id,
          ...values,
        });
        toast.success('Recurring transaction updated');
      } else {
        await createRecurringTransaction(values as any);
        toast.success('Recurring transaction added');
      }
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error('Failed to save recurring transaction');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-primary/5 via-background to-background p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              {recurring
                ? 'Edit Recurring Transaction'
                : 'Add Recurring Transaction'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Set up or modify a recurring financial event in your budget.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-muted/30">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Transaction Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Monthly Salary, Rent, Netflix"
                          className="bg-background border-muted/50 focus:ring-primary/20 transition-all uppercase placeholder:normal-case font-semibold text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background border-muted/50 text-sm font-medium">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="income">
                              <span className="flex items-center gap-2 text-emerald-500 font-bold">
                                <TrendingUp className="h-3.5 w-3.5" />
                                Income
                              </span>
                            </SelectItem>
                            <SelectItem value="expense">
                              <span className="flex items-center gap-2 text-rose-500 font-bold">
                                <TrendingDown className="h-3.5 w-3.5" />
                                Expense
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Category
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background border-muted/50 text-sm font-medium">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-muted/30">
                <div className="grid grid-cols-[1fr_auto_80px] gap-4 items-end">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Amount
                        </FormLabel>
                        <FormControl>
                          <CurrencyInput
                            value={field.value}
                            onValueChange={(values) => {
                              field.onChange(values.floatValue ?? 0);
                            }}
                            currency={form.watch('currency')}
                            className="bg-background border-muted/50 text-lg font-bold tabular-nums"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background border-muted/50 font-bold h-11">
                              <SelectValue placeholder="Cur" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="KRW">KRW</SelectItem>
                            <SelectItem value="VND">VND</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Frequency
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background border-muted/50 text-sm font-medium">
                              <SelectValue placeholder="Frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dayOfMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          {form.watch('frequency') === 'monthly'
                            ? 'Day of Month'
                            : 'Day'}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background border-muted/50 text-sm font-bold">
                              <SelectValue placeholder="Day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              (day) => (
                                <SelectItem key={day} value={String(day)}>
                                  {day}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch('frequency') === 'yearly' && (
                  <FormField
                    control={form.control}
                    name="monthOfYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Month of Year
                        </FormLabel>
                        <Select
                          onValueChange={(val) => field.onChange(Number(val))}
                          value={field.value ? String(field.value) : undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background border-muted/50 text-sm font-medium">
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                              (month) => (
                                <SelectItem key={month} value={String(month)}>
                                  {new Date(2000, month - 1, 1).toLocaleString(
                                    'en-US',
                                    { month: 'long' }
                                  )}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  className="w-full h-11 text-sm font-bold shadow-lg hover:shadow-primary/20 transition-all duration-300"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {recurring ? 'Save Changes' : 'Add Recurring Transaction'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
