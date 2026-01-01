import type { JSX, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TechItem {
  name: string;
  category: string;
  icon: ReactNode;
}

interface TechStackGridProps {
  items: TechItem[];
  className?: string;
}

/**
 * TechStackGrid - Displays a grid of technology/skill items with icons.
 * Following the reference design pattern with icon + label cards.
 */
export function TechStackGrid({ items, className }: TechStackGridProps): JSX.Element {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {items.map((item) => (
        <div
          key={item.name}
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/30 hover:bg-card/60 transition-colors"
        >
          <div className="p-2 bg-muted/50 rounded-lg text-foreground">
            {item.icon}
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{item.name}</div>
            <div className="text-xs text-muted-foreground">{item.category}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TechStackGrid;
