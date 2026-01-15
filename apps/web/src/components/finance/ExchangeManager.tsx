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
import {
  Loader2,
  Plus,
  Trash2,
  ArrowRightLeft,
  Calendar as CalendarIcon,
  History,
  Info,
} from 'lucide-react';
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

interface ExchangeManagerProps {
  exchanges: FinanceExchange[];
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
    <div className="space-y-8">
      {/* 1. Interactive Form Card */}
      <Card className="bg-card/50 border-primary/10 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-primary to-orange-500" />
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Currency Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8 justify-between">
            {/* From Section */}
            <div className="flex-1 w-full space-y-2">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  Sell Assets
                </Label>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">
                  Outgoing
                </span>
              </div>
              <div className="flex gap-1">
                <Select
                  value={fromCurrency}
                  onValueChange={(v) => setFromCurrency(v as Currency)}
                >
                  <SelectTrigger className="w-[110px] h-12 font-bold border-r-0 rounded-r-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KRW">KRW (₩)</SelectItem>
                    <SelectItem value="VND">VND (₫)</SelectItem>
                  </SelectContent>
                </Select>
                <CurrencyInput
                  currency={fromCurrency}
                  placeholder="0.00"
                  className="h-12 flex-1 text-lg font-black border-l-0 rounded-l-none focus-visible:ring-emerald-500/30"
                  value={fromAmount}
                  onValueChange={(values) =>
                    handleFromAmountChange(values.value)
                  }
                />
              </div>
            </div>

            {/* Interchange Section */}
            <div className="flex lg:flex-col items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={swapCurrencies}
                className="rounded-full h-10 w-10 border-muted hover:border-primary transition-all group"
              >
                <ArrowRightLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:rotate-180 transition-all duration-300" />
              </Button>
              <div className="hidden lg:flex flex-col items-center">
                <Label className="text-[9px] font-bold text-muted-foreground uppercase mb-1">
                  Exchange Rate
                </Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    placeholder="0.0000"
                    value={rate}
                    onChange={(e) => handleRateChange(e.target.value)}
                    className="h-8 text-[11px] font-bold w-20 text-center bg-muted/50 border-muted-foreground/20 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* To Section */}
            <div className="flex-1 w-full space-y-2">
              <div className="flex justify-between items-center mb-1">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                  Receive Assets
                </Label>
                <span className="text-[10px] font-bold text-violet-500 bg-violet-500/10 px-1.5 py-0.5 rounded uppercase">
                  Incoming
                </span>
              </div>
              <div className="flex gap-1">
                <Select
                  value={toCurrency}
                  onValueChange={(v) => setToCurrency(v as Currency)}
                >
                  <SelectTrigger className="w-[110px] h-12 font-bold border-r-0 rounded-r-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KRW">KRW (₩)</SelectItem>
                    <SelectItem value="VND">VND (₫)</SelectItem>
                  </SelectContent>
                </Select>
                <CurrencyInput
                  currency={toCurrency}
                  placeholder="0.00"
                  className="h-12 flex-1 text-lg font-black border-l-0 rounded-l-none focus-visible:ring-violet-500/30"
                  value={toAmount}
                  onValueChange={(values) => handleToAmountChange(values.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-border/50 pt-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                Transaction Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-11 justify-start text-left font-medium rounded-xl',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">
                Internal Note
              </Label>
              <Input
                placeholder="Where or why did you exchange?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isPending || !fromAmount || !toAmount}
            className="w-full h-12 font-bold text-sm bg-primary hover:bg-primary/90 rounded-xl"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ArrowRightLeft className="h-4 w-4 mr-2" />
            )}
            Confirm Asset Exchange
          </Button>
        </CardContent>
      </Card>

      {/* 2. Compact History Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-bold text-base tracking-tight text-foreground">
            Exchange History
          </h3>
          <div className="flex-1 border-b border-border/50 mx-2" />
          <div className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {exchanges.length} Total
          </div>
        </div>

        {exchanges.length === 0 ? (
          <div className="bg-muted/20 rounded-2xl border border-dashed p-12 text-center">
            <Info className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium text-sm">
              No exchanges found for the current period.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exchanges.map((exchange) => (
              <div
                key={exchange.id}
                className="group bg-card border border-border/50 p-4 rounded-xl hover:shadow-md hover:border-border transition-all relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-muted px-2 py-1 rounded text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
                    <CalendarIcon className="h-3 w-3" />
                    {format(new Date(exchange.date), 'MMM d, yyyy')}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(exchange.id)}
                    disabled={deletingId === exchange.id}
                  >
                    {deletingId === exchange.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-4 justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                      Sell
                    </p>
                    <p className="text-sm font-bold truncate">
                      <NumericFormat
                        value={exchange.fromAmount}
                        displayType="text"
                        thousandSeparator=","
                        prefix={exchange.fromCurrency === 'KRW' ? '₩' : '₫'}
                      />
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {exchange.fromCurrency}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <ArrowRightLeft className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    <span className="text-[9px] font-bold text-muted-foreground leading-none">
                      1:{parseFloat(exchange.rate).toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-right">
                    <p className="text-[9px] font-bold text-violet-500 uppercase tracking-wider">
                      Buy
                    </p>
                    <p className="text-sm font-bold truncate">
                      <NumericFormat
                        value={exchange.toAmount}
                        displayType="text"
                        thousandSeparator=","
                        prefix={exchange.toCurrency === 'KRW' ? '₩' : '₫'}
                      />
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {exchange.toCurrency}
                    </p>
                  </div>
                </div>

                {exchange.description && (
                  <div className="mt-4 pt-4 border-t border-border/30 flex items-start gap-2">
                    <Info className="h-3 w-3 text-muted-foreground mt-0.5" />
                    <p className="text-[10px] text-muted-foreground italic truncate">
                      {exchange.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
