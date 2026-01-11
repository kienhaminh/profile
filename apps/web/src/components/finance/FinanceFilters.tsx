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
import { FinanceCategory } from '@/types/finance';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface FinanceFiltersProps {
  categories: FinanceCategory[];
}

export function FinanceFilters({ categories }: FinanceFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('categoryId') || 'all';
  const currentPriority = searchParams.get('priority') || 'all';
  const currentCurrency = searchParams.get('currency') || 'KRW';

  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  // Calculate default last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const dateRange: DateRange | undefined =
    startDateParam && endDateParam
      ? {
          from: new Date(startDateParam),
          to: new Date(endDateParam),
        }
      : {
          // Default to last 30 days if no params
          from: thirtyDaysAgo,
          to: now,
        };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const updateDateRange = (range: DateRange | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (range?.from) {
      params.set('startDate', format(range.from, 'yyyy-MM-dd'));
    } else {
      params.delete('startDate');
    }
    if (range?.to) {
      params.set('endDate', format(range.to, 'yyyy-MM-dd'));
    } else {
      params.delete('endDate');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const setDatePreset = (preset: string) => {
    const now = new Date();
    const params = new URLSearchParams(searchParams.toString());

    switch (preset) {
      case 'this_week': {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        params.set('startDate', format(startOfWeek, 'yyyy-MM-dd'));
        params.set('endDate', format(now, 'yyyy-MM-dd'));
        break;
      }
      case 'this_month': {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        params.set('startDate', format(startOfMonth, 'yyyy-MM-dd'));
        params.set('endDate', format(now, 'yyyy-MM-dd'));
        break;
      }
      case 'last_7': {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        params.set('startDate', format(sevenDaysAgo, 'yyyy-MM-dd'));
        params.set('endDate', format(now, 'yyyy-MM-dd'));
        break;
      }
      case 'last_30': {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        params.set('startDate', format(thirtyDaysAgo, 'yyyy-MM-dd'));
        params.set('endDate', format(now, 'yyyy-MM-dd'));
        break;
      }
      case 'custom':
        // Don't change anything, let user pick
        return;
      default:
        params.delete('startDate');
        params.delete('endDate');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasFilters =
    searchParams.get('categoryId') ||
    searchParams.get('priority') ||
    searchParams.get('currency') ||
    searchParams.get('startDate') ||
    searchParams.get('endDate');

  return (
    <div className="flex flex-wrap gap-4 items-center mb-6">
      <Select
        value={currentCategory}
        onValueChange={(v) => updateFilters('categoryId', v)}
      >
        <SelectTrigger>
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
        value={currentCurrency}
        onValueChange={(v) => updateFilters('currency', v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="All Currencies" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="KRW">KRW (₩)</SelectItem>
          <SelectItem value="VND">VND (₫)</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentPriority}
        onValueChange={(v) => updateFilters('priority', v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="must_have">Must Have</SelectItem>
          <SelectItem value="nice_to_have">Nice to Have</SelectItem>
          <SelectItem value="waste">Waste</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'LLL dd, y')} -{' '}
                  {format(dateRange.to, 'LLL dd, y')}
                </>
              ) : (
                format(dateRange.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDatePreset('this_week')}
              >
                This Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDatePreset('this_month')}
              >
                This Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDatePreset('last_7')}
              >
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDatePreset('last_30')}
              >
                Last 30 Days
              </Button>
            </div>
          </div>
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={updateDateRange}
            numberOfMonths={2}
            defaultMonth={dateRange?.from}
          />
        </PopoverContent>
      </Popover>

      <Button variant="ghost" onClick={clearFilters} size="sm">
        <X className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  );
}
