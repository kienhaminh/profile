import { FinanceFilter } from '@/types/finance';

export interface FinancePageProps {
  searchParams: Promise<{
    categoryId?: string;
    priority?: string;
    currency?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

// Helper to get current month as YYYY-MM-01
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export function getDefaultDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    startDate: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`,
    endDate: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`,
  };
}

export async function parseFinanceParams(
  searchParams: FinancePageProps['searchParams']
): Promise<FinanceFilter> {
  const params = await searchParams;
  const defaults = getDefaultDateRange();

  return {
    categoryId: params.categoryId,
    priority: params.priority as any,
    currency: (params.currency as any) || 'KRW',
    startDate: params.startDate || defaults.startDate,
    endDate: params.endDate || defaults.endDate,
  };
}
