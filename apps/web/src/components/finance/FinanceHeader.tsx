'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TransactionDialog } from './TransactionDialog';

export function FinanceHeader() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Personal Finance</h1>
        <p className="text-muted-foreground">
          Manage your expenses and incomes.
        </p>
      </div>
      <Button onClick={() => setIsDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Transaction
      </Button>

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
