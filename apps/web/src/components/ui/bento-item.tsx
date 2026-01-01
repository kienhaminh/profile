import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Link from 'next/link';

/**
 * BentoItem - A tile component for use within BentoGrid
 * Supports 4 sizes: 1x1, 2x1, 1x2, 2x2
 * Optionally wraps content in a link
 *
 * @example
 * <BentoItem size="2x1" variant="featured">
 *   <h3>Title</h3>
 *   <p>Description</p>
 * </BentoItem>
 *
 * <BentoItem size="1x1" href="/about" variant="accent">
 *   Clickable item
 * </BentoItem>
 */
const bentoItemVariants = cva(
  'bento-item relative overflow-hidden focus-visible:outline-primary',
  {
    variants: {
      size: {
        '1x1': 'bento-item-1x1',
        '2x1': 'bento-item-2x1',
        '1x2': 'bento-item-1x2',
        '2x2': 'bento-item-2x2',
      },
      variant: {
        default: 'bg-card',
        featured: 'bg-gradient-to-br from-primary/5 to-accent/5',
        accent: 'border-primary/30 bg-primary/5',
        muted: 'bg-muted',
      },
    },
    defaultVariants: {
      size: '1x1',
      variant: 'default',
    },
  }
);

export interface BentoItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bentoItemVariants> {
  /** Optional link URL - wraps content in Next.js Link */
  href?: string;
  /** Link target for external links */
  target?: string;
  /** Disable hover animation */
  static?: boolean;
}

const BentoItem = React.forwardRef<HTMLDivElement, BentoItemProps>(
  (
    {
      className,
      size,
      variant,
      href,
      target,
      static: isStatic,
      children,
      ...props
    },
    ref
  ) => {
    const itemClasses = cn(
      bentoItemVariants({ size, variant, className }),
      isStatic && 'hover:transform-none hover:shadow-none'
    );

    // If href provided, wrap in Link
    if (href) {
      return (
        <div ref={ref} className={itemClasses} {...props}>
          <Link
            href={href}
            target={target}
            className="absolute inset-0 z-10"
            aria-label={typeof children === 'string' ? children : undefined}
          />
          <div className="relative z-0">{children}</div>
        </div>
      );
    }

    return (
      <div ref={ref} className={itemClasses} {...props}>
        {children}
      </div>
    );
  }
);
BentoItem.displayName = 'BentoItem';

export { BentoItem, bentoItemVariants };
