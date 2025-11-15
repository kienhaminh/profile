import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function BlogCardSkeleton(): React.JSX.Element {
  return (
    <Card className="h-full border-2 border-gray-100 bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-3" />
        <div className="flex flex-wrap gap-2 mt-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}
