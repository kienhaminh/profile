import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'relative overflow-hidden rounded-md bg-muted/40',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[skeleton-shimmer_3s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
        'dark:bg-white/5 dark:before:via-white/10',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
