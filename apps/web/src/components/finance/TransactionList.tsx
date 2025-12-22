'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { FinanceTransaction } from '@/types/finance';
import { NumericFormat } from 'react-number-format';
import { deleteTransaction } from '@/app/actions/finance';
import { TransactionDialog } from './TransactionDialog';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';

interface TransactionListProps {
  transactions: FinanceTransaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<
    FinanceTransaction | undefined
  >(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (transaction: FinanceTransaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(deleteId);
      toast.success('Transaction deleted');
    } catch (error) {
      toast.error('Failed to delete transaction');
      console.error(error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                  <TableCell className="capitalize">{t.type}</TableCell>
                  <TableCell>{t.category?.name || 'Uncategorized'}</TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell className="capitalize">
                    {t.priority?.replace(/_/g, ' ') || '-'}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    <NumericFormat
                      value={t.amount}
                      displayType="text"
                      thousandSeparator=","
                      prefix={`${t.type === 'income' ? '+' : '-'}${t.currency === 'KRW' ? '₩' : '₫'}`}
                      allowNegative={false}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(t)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(t.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TransactionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        transaction={editingTransaction}
        onSuccess={() => {}}
      />

      <ConfirmDeleteDialog
        isOpen={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </div>
  );
}
