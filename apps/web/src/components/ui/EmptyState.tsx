import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-xl bg-muted/30 animate-in fade-in zoom-in-95 duration-500',
        className
      )}
    >
      {Icon && (
        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-background border border-border shadow-sm">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-medium text-foreground tracking-tight">
        {title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
        {description}
      </p>
      {action && (
        <div className="mt-6">
          {action.onClick ? (
            <Button onClick={action.onClick}>{action.label}</Button>
          ) : (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
