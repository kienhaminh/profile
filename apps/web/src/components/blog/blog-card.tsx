import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BlogListItem } from '@/types/blog';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  post: BlogListItem;
  className?: string;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function BlogCard({
  post,
  className,
}: BlogCardProps): React.JSX.Element {
  return (
    <Link href={`/blog/${post.slug}`} className={cn('group block', className)}>
      <Card className="h-full border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl group-hover:text-purple-600 transition-colors line-clamp-2">
            {post.title}
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-full border border-purple-200"
              >
                {tag.label}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 line-clamp-3 leading-relaxed">
            {post.excerpt || 'No excerpt available.'}
          </p>
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              {formatDate(post.publishDate)}
            </span>
            <span className="inline-flex items-center text-sm font-semibold text-purple-600 group-hover:text-pink-600 transition-colors">
              Read More
              <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
