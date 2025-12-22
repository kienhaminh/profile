'use client';

import { useState, useTransition } from 'react';
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
import { NumericFormat } from 'react-number-format';
import { CurrencyInput } from './CurrencyInput';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Loader2, Plus, Trash2, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';
import { FinanceExchange, Currency } from '@/types/finance';
import { createExchange, deleteExchange } from '@/app/actions/finance';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface ExchangeManagerProps {
  exchanges: FinanceExchange[];
}

function formatCurrency(amount: number | string, currency: string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const symbol = currency === 'KRW' ? '₩' : currency === 'VND' ? '₫' : '$';
  return `${symbol}${formatter.format(num)}`;
}

export function ExchangeManager({ exchanges }: ExchangeManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [fromCurrency, setFromCurrency] = useState<Currency>('KRW');
  const [toCurrency, setToCurrency] = useState<Currency>('VND');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [rate, setRate] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleFromAmountChange = (val: string) => {
    setFromAmount(val);
    if (val && rate) {
      const calculated = parseFloat(val) * parseFloat(rate);
      setToAmount(calculated.toString());
    } else if (val && toAmount) {
      const calculatedRate = parseFloat(toAmount) / parseFloat(val);
      setRate(calculatedRate.toFixed(4));
    }
  };

  const handleToAmountChange = (val: string) => {
    setToAmount(val);
    if (val && fromAmount) {
      const calculatedRate = parseFloat(val) / parseFloat(fromAmount);
      setRate(calculatedRate.toFixed(4));
    } else if (val && rate) {
      const calculatedFrom = parseFloat(val) / parseFloat(rate);
      setFromAmount(calculatedFrom.toString());
    }
  };

  const handleRateChange = (val: string) => {
    setRate(val);
    if (val && fromAmount) {
      const calculatedTo = parseFloat(fromAmount) * parseFloat(val);
      setToAmount(calculatedTo.toString());
    } else if (val && toAmount) {
      const calculatedFrom = parseFloat(toAmount) / parseFloat(val);
      setFromAmount(calculatedFrom.toString());
    }
  };

  const handleSubmit = () => {
    if (!fromAmount || !toAmount) {
      toast.error('Please enter both amounts');
      return;
    }

    startTransition(async () => {
      try {
        await createExchange({
          fromCurrency,
          toCurrency,
          fromAmount: parseFloat(fromAmount),
          toAmount: parseFloat(toAmount),
          date,
          description: description || undefined,
        });
        toast.success('Exchange recorded');
        setFromAmount('');
        setToAmount('');
        setRate('');
        setDescription('');
      } catch (error) {
        toast.error('Failed to record exchange');
        console.error(error);
      }
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteExchange(id);
        toast.success('Exchange deleted');
      } catch (error) {
        toast.error('Failed to delete exchange');
        console.error(error);
      } finally {
        setDeletingId(null);
      }
    });
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    if (rate && parseFloat(rate) !== 0) {
      setRate((1 / parseFloat(rate)).toFixed(4));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Record Exchange</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="col-span-2 space-y-2">
              <Label>From</Label>
              <Select
                value={fromCurrency}
                onValueChange={(v) => setFromCurrency(v as Currency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KRW">KRW (₩)</SelectItem>
                  <SelectItem value="VND">VND (₫)</SelectItem>
                </SelectContent>
              </Select>
              <CurrencyInput
                currency={fromCurrency}
                placeholder="Amount"
                value={fromAmount}
                onValueChange={(values) => handleFromAmountChange(values.value)}
              />
            </div>

            <div className="flex flex-col items-center gap-2">
              <Label>Rate</Label>
              <div className="flex items-center gap-2 w-full">
                <Input
                  type="number"
                  placeholder="Rate"
                  value={rate}
                  onChange={(e) => handleRateChange(e.target.value)}
                  className="text-center"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={swapCurrencies}>
                <ArrowRightLeft className="h-5 w-5" />
              </Button>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>To</Label>
              <Select
                value={toCurrency}
                onValueChange={(v) => setToCurrency(v as Currency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KRW">KRW (₩)</SelectItem>
                  <SelectItem value="VND">VND (₫)</SelectItem>
                </SelectContent>
              </Select>
              <CurrencyInput
                currency={toCurrency}
                placeholder="Amount"
                value={toAmount}
                onValueChange={(values) => handleToAmountChange(values.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                placeholder="e.g., ATM withdrawal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Record Exchange
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exchange History</CardTitle>
        </CardHeader>
        <CardContent>
          {exchanges.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No exchanges recorded this month.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exchanges.map((exchange) => (
                  <TableRow key={exchange.id}>
                    <TableCell>
                      {format(new Date(exchange.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <NumericFormat
                        value={exchange.fromAmount}
                        displayType="text"
                        thousandSeparator=","
                        prefix={exchange.fromCurrency === 'KRW' ? '₩' : '₫'}
                      />
                    </TableCell>
                    <TableCell>
                      <NumericFormat
                        value={exchange.toAmount}
                        displayType="text"
                        thousandSeparator=","
                        prefix={exchange.toCurrency === 'KRW' ? '₩' : '₫'}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      1:{parseFloat(exchange.rate).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {exchange.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(exchange.id)}
                        disabled={deletingId === exchange.id}
                      >
                        {deletingId === exchange.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
