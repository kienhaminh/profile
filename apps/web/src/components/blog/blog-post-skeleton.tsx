import { Skeleton } from '@/components/ui/skeleton';

export function BlogPostSkeleton(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <article className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <header className="mb-12 space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-3/4" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </header>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full mt-6" />
          <Skeleton className="h-4 w-full mt-6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </article>
    </div>
  );
}
