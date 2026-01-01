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
import { FinanceLoan } from '@/types/finance';
import { NumericFormat } from 'react-number-format';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { LoanDialog } from './LoanDialog';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { deleteLoan, updateLoan } from '@/app/actions/finance';
import { toast } from 'sonner';

interface LoanManagerProps {
  loans: FinanceLoan[];
}

export function LoanManager({ loans }: LoanManagerProps) {
  const [selectedLoan, setSelectedLoan] = useState<FinanceLoan | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState<string | null>(null);

  async function handleDelete(id: string) {
    try {
      await deleteLoan(id);
      toast.success('Loan deleted');
      setLoanToDelete(null);
    } catch (error) {
      toast.error('Failed to delete loan');
      console.error(error);
    }
  }

  async function handleSettle(loan: FinanceLoan) {
    try {
      await updateLoan({
        id: loan.id,
        status: 'settled',
        settledDate: new Date(),
      });
      toast.success('Loan settled');
    } catch (error) {
      toast.error('Failed to settle loan');
      console.error(error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Loans</h2>
        <Button
          onClick={() => {
            setSelectedLoan(undefined);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Loan
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Who</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No loans found.
                </TableCell>
              </TableRow>
            ) : (
              loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>
                    <Badge
                      variant={
                        loan.type === 'borrow' ? 'destructive' : 'default'
                      }
                    >
                      {loan.type === 'borrow' ? 'Borrow' : 'Lend'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {loan.counterparty}
                  </TableCell>
                  <TableCell>
                    <NumericFormat
                      value={loan.amount}
                      displayType="text"
                      thousandSeparator=","
                      prefix={loan.currency === 'KRW' ? '₩' : '₫'}
                      className={
                        loan.type === 'borrow'
                          ? 'text-red-500'
                          : 'text-green-500'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(loan.date), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell>
                    {loan.dueDate
                      ? format(new Date(loan.dueDate), 'yyyy-MM-dd')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        loan.status === 'active' ? 'outline' : 'secondary'
                      }
                    >
                      {loan.status === 'active' ? 'Active' : 'Settled'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {loan.status === 'active' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSettle(loan)}
                          title="Settle"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedLoan(loan);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLoanToDelete(loan.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <LoanDialog
        loan={selectedLoan}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {}}
      />

      <ConfirmDeleteDialog
        isOpen={!!loanToDelete}
        onOpenChange={(open) => !open && setLoanToDelete(null)}
        onConfirm={() => loanToDelete && handleDelete(loanToDelete)}
        title="Delete Loan"
        description="Are you sure you want to delete this loan? This action cannot be undone."
      />
    </div>
  );
}
