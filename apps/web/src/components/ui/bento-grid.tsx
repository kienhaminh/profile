import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * BentoGrid - A responsive CSS Grid container for bento-style layouts
 *
 * @example
 * <BentoGrid columns={4} gap="lg">
 *   <BentoItem size="2x2">Featured content</BentoItem>
 *   <BentoItem size="1x1">Small item</BentoItem>
 * </BentoGrid>
 */
const bentoGridVariants = cva('bento-grid', {
  variants: {
    columns: {
      3: 'lg:grid-cols-3',
      4: 'lg:grid-cols-4',
      5: 'lg:grid-cols-5',
    },
    gap: {
      sm: 'gap-[var(--bento-gap-sm)]',
      md: 'gap-[var(--bento-gap-md)]',
      lg: 'gap-[var(--bento-gap-lg)]',
    },
  },
  defaultVariants: {
    columns: 4,
    gap: 'lg',
  },
});

export interface BentoGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bentoGridVariants> {}

const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, columns, gap, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(bentoGridVariants({ columns, gap, className }))}
      {...props}
    />
  )
);
BentoGrid.displayName = 'BentoGrid';

export { BentoGrid, bentoGridVariants };
