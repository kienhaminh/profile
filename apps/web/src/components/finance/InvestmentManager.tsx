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
import { FinanceInvestment } from '@/types/finance';
import { NumericFormat } from 'react-number-format';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react';
import { format } from 'date-fns';
import { InvestmentDialog } from './InvestmentDialog';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { deleteInvestment, updateInvestment } from '@/app/actions/finance';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InvestmentManagerProps {
  investments: FinanceInvestment[];
}

export function InvestmentManager({ investments }: InvestmentManagerProps) {
  const [selectedInvestment, setSelectedInvestment] = useState<
    FinanceInvestment | undefined
  >();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState<string | null>(
    null
  );

  async function handleDelete(id: string) {
    try {
      await deleteInvestment(id);
      toast.success('Investment deleted');
      setInvestmentToDelete(null);
    } catch (error) {
      toast.error('Failed to delete investment');
      console.error(error);
    }
  }

  const activeInvestments = investments.filter((i) => i.status === 'active');

  const totalInvested = activeInvestments.reduce((acc, curr) => {
    // Basic summation, might need currency conversion for true total
    return acc + Number(curr.amount);
  }, 0);

  const totalCurrentValue = activeInvestments.reduce((acc, curr) => {
    return acc + Number(curr.currentValue || curr.amount);
  }, 0);

  const profitLoss = totalCurrentValue - totalInvested;
  const profitPercentage =
    totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invested
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumericFormat
                value={totalInvested}
                displayType="text"
                thousandSeparator=","
                prefix="₫" // VND for Vietnamese investments
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumericFormat
                value={totalCurrentValue}
                displayType="text"
                thousandSeparator=","
                prefix="₫"
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Net Profit / Loss
            </CardTitle>
            {profitLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'text-2xl font-bold',
                profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
              )}
            >
              <NumericFormat
                value={profitLoss}
                displayType="text"
                thousandSeparator=","
                prefix={profitLoss >= 0 ? '+₫' : '-₫'}
              />
              <span className="text-sm ml-2 font-normal">
                ({profitPercentage.toFixed(2)}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Investments</h2>
        <Button
          onClick={() => {
            setSelectedInvestment(undefined);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Investment
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Investment</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Cost Basis</TableHead>
              <TableHead>Current Value</TableHead>
              <TableHead>Gains/Losses</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No investments found.
                </TableCell>
              </TableRow>
            ) : (
              investments.map((inv) => {
                const investmentProfit =
                  Number(inv.currentValue || inv.amount) - Number(inv.amount);
                const investmentProfitPerc =
                  (investmentProfit / Number(inv.amount)) * 100;

                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">
                      <div>{inv.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(inv.date), 'yyyy-MM-dd')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{inv.type || 'Other'}</Badge>
                    </TableCell>
                    <TableCell>
                      <NumericFormat
                        value={inv.amount}
                        displayType="text"
                        thousandSeparator=","
                        prefix={inv.currency === 'KRW' ? '₩' : '₫'}
                      />
                    </TableCell>
                    <TableCell>
                      <NumericFormat
                        value={inv.currentValue || inv.amount}
                        displayType="text"
                        thousandSeparator=","
                        prefix={inv.currency === 'KRW' ? '₩' : '₫'}
                        className="font-semibold"
                      />
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          'flex flex-col',
                          investmentProfit >= 0
                            ? 'text-green-500'
                            : 'text-red-500'
                        )}
                      >
                        <span className="font-medium">
                          {investmentProfit >= 0 ? '+' : ''}
                          <NumericFormat
                            value={investmentProfit}
                            displayType="text"
                            thousandSeparator=","
                            prefix={inv.currency === 'KRW' ? '₩' : '₫'}
                          />
                        </span>
                        <span className="text-xs">
                          {investmentProfit >= 0 ? '+' : ''}
                          {investmentProfitPerc.toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedInvestment(inv);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setInvestmentToDelete(inv.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <InvestmentDialog
        investment={selectedInvestment}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {}}
      />

      <ConfirmDeleteDialog
        isOpen={!!investmentToDelete}
        onOpenChange={(open) => !open && setInvestmentToDelete(null)}
        onConfirm={() => investmentToDelete && handleDelete(investmentToDelete)}
        title="Delete Investment"
        description="Are you sure you want to delete this investment? This action cannot be undone."
      />
    </div>
  );
}
