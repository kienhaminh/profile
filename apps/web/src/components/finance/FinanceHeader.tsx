'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TransactionDialog } from './TransactionDialog';
import { NLTransactionInput } from './NLTransactionInput';

export function FinanceHeader() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 relative">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-medium text-foreground tracking-tight">
            Personal Finance
          </h1>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span className="text-[10px] font-medium text-green-500 uppercase tracking-wide">
              Money
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your expenses and incomes.
        </p>
      </div>
      <div className="flex gap-2">
        <NLTransactionInput />
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <TransactionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          // The page will revalidate via server actions,
          // but we might want a router.refresh() if needed.
          // Since createTransaction calls revalidatePath, it should work.
        }}
      />
    </div>
  );
}
