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
import { FinanceCategory, FinancePriority } from '@/types/finance';
import { X } from 'lucide-react';

interface FinanceFiltersProps {
  categories: FinanceCategory[];
}

export function FinanceFilters({ categories }: FinanceFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('categoryId') || 'all';
  const currentPriority = searchParams.get('priority') || 'all';
  const currentCurrency = searchParams.get('currency') || 'all';

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasFilters =
    searchParams.get('categoryId') ||
    searchParams.get('priority') ||
    searchParams.get('currency');

  return (
    <div className="flex flex-wrap gap-4 items-center mb-6">
      <div className="w-[200px]">
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
      </div>

      <div className="w-[150px]">
        <Select
          value={currentCurrency}
          onValueChange={(v) => updateFilters('currency', v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Currencies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Currencies</SelectItem>
            <SelectItem value="KRW">KRW (₩)</SelectItem>
            <SelectItem value="VND">VND (₫)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-[200px]">
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
      </div>

      {hasFilters && (
        <Button variant="ghost" onClick={clearFilters} size="sm">
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
