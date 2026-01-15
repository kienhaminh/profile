'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subYears,
  eachMonthOfInterval,
  startOfToday,
} from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  Calendar as CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { FinanceCategory } from '@/types/finance';

interface FinanceFiltersProps {
  categories: FinanceCategory[];
}

export function FinanceFilters({ categories }: FinanceFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOverview = pathname.includes('/overview');

  const currentCategory = searchParams.get('categoryId') || 'all';
  const currentPriority = searchParams.get('priority') || 'all';
  const currentCurrency = searchParams.get('currency') || 'KRW';

  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  const now = startOfToday();
  const defaultStart = startOfMonth(now);
  const defaultEnd = endOfMonth(now);

  const dateRange: DateRange | undefined =
    startDateParam && endDateParam
      ? {
          from: new Date(startDateParam),
          to: new Date(endDateParam),
        }
      : {
          from: defaultStart,
          to: defaultEnd,
        };

  // Determine if we are in Month or Year view for Overview
  const isYearly =
    dateRange?.from &&
    dateRange?.to &&
    format(dateRange.from, 'yyyy-MM-dd') ===
      format(startOfYear(dateRange.from), 'yyyy-MM-dd') &&
    format(dateRange.to, 'yyyy-MM-dd') ===
      format(endOfYear(dateRange.from), 'yyyy-MM-dd');

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const updateRange = (start: Date, end: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('startDate', format(start, 'yyyy-MM-dd'));
    params.set('endDate', format(end, 'yyyy-MM-dd'));
    router.push(`${pathname}?${params.toString()}`);
  };

  const shiftMonth = (amount: number) => {
    if (!dateRange?.from) return;
    const newStart = startOfMonth(subMonths(dateRange.from, -amount));
    const newEnd = endOfMonth(newStart);
    updateRange(newStart, newEnd);
  };

  const shiftYear = (amount: number) => {
    if (!dateRange?.from) return;
    const newStart = startOfYear(subYears(dateRange.from, -amount));
    const newEnd = endOfYear(newStart);
    updateRange(newStart, newEnd);
  };

  const setViewMode = (mode: 'monthly' | 'yearly') => {
    if (mode === 'monthly') {
      const start = startOfMonth(dateRange?.from || now);
      updateRange(start, endOfMonth(start));
    } else {
      const start = startOfYear(dateRange?.from || now);
      updateRange(start, endOfYear(start));
    }
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const currencyFilter = (
    <Select
      value={currentCurrency}
      onValueChange={(v) => updateFilters('currency', v)}
    >
      <SelectTrigger className="w-[140px] h-10 font-bold bg-background shadow-sm rounded-xl">
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="KRW">KRW (₩)</SelectItem>
        <SelectItem value="VND">VND (₫)</SelectItem>
      </SelectContent>
    </Select>
  );

  if (isOverview) {
    return (
      <div className="flex flex-wrap items-center gap-3 mb-2">
        {currencyFilter}

        <div className="h-10 p-1 bg-muted rounded-xl flex items-center shadow-inner">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 px-4 text-xs font-bold rounded-lg transition-all',
              !isYearly && 'bg-background shadow-sm text-foreground'
            )}
            onClick={() => setViewMode('monthly')}
          >
            Month
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 px-4 text-xs font-bold rounded-lg transition-all',
              isYearly && 'bg-background shadow-sm text-foreground'
            )}
            onClick={() => setViewMode('yearly')}
          >
            Year
          </Button>
        </div>

        <div className="flex items-center gap-1 bg-card border border-border/50 p-1 rounded-xl shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-muted"
            onClick={() => (isYearly ? shiftYear(-1) : shiftMonth(-1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="px-4 text-sm font-bold min-w-[120px] text-center">
            {isYearly
              ? format(dateRange?.from || now, 'yyyy')
              : format(dateRange?.from || now, 'MMMM yyyy')}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-muted"
            onClick={() => (isYearly ? shiftYear(1) : shiftMonth(1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {(searchParams.get('startDate') || searchParams.get('endDate')) && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            size="sm"
            className="h-10 rounded-xl font-bold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>
    );
  }

  // Full filters for other pages
  return (
    <div className="flex flex-wrap gap-3 items-center mb-6 p-4 bg-muted/30 rounded-2xl border border-border/50">
      <div className="w-full md:w-auto">{currencyFilter}</div>

      <Select
        value={currentCategory}
        onValueChange={(v) => updateFilters('categoryId', v)}
      >
        <SelectTrigger className="w-[180px] h-10 bg-background rounded-xl">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentPriority}
        onValueChange={(v) => updateFilters('priority', v)}
      >
        <SelectTrigger className="w-[160px] h-10 bg-background rounded-xl">
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="must_have">Must Have</SelectItem>
          <SelectItem value="nice_to_have">Nice to Have</SelectItem>
          <SelectItem value="waste">Waste</SelectItem>
        </SelectContent>
      </Select>

      {/* Simplified Date Range for Detail page too */}
      <div className="flex items-center gap-1 bg-background border border-border/50 p-1 rounded-xl shadow-sm h-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => shiftMonth(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="px-3 text-xs font-bold min-w-[100px] text-center">
          {format(dateRange?.from || now, 'MMM yyyy')}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => shiftMonth(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {searchParams.toString().length > 0 && !pathname.includes('currency') && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          size="sm"
          className="h-10 rounded-xl font-bold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
