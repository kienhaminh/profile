import type { JSX } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Blog } from '@/types/blog';
import { ArrowRight } from 'lucide-react';

interface BlogListItemProps {
  post: Blog;
  className?: string;
}

/**
 * BlogListItem - Displays a blog post in a list format with hover effects.
 * Following the reference design with dividers and minimal styling.
 */
export function BlogListItem({ post, className }: BlogListItemProps): JSX.Element {
  const formattedDate = post.publishDate
    ? new Date(post.publishDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        'group flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-6 border-b border-border hover:bg-muted/30 -mx-4 px-4 transition-colors',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <h3 className="text-foreground font-medium group-hover:text-primary transition-colors truncate">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {post.excerpt}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
        <span className="font-mono text-xs">{formattedDate}</span>
        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
      </div>
    </Link>
  );
}

export default BlogListItem;
