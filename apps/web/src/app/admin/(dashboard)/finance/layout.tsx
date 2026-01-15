import { getCategories } from '@/app/actions/finance';
import { FinanceHeader } from '@/components/finance/FinanceHeader';
import { FinanceFilters } from '@/components/finance/FinanceFilters';

export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <FinanceHeader />
      <FinanceFilters categories={categories} />
      {children}
    </div>
  );
}
