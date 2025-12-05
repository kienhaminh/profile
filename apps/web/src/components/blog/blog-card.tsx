import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
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
    month: 'short',
    day: 'numeric',
  });
}

export function BlogCard({
  post,
  className,
}: BlogCardProps): React.JSX.Element {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn('group block h-full', className)}
    >
      <Card className="cosmic-card h-full relative overflow-hidden border-2 border-border/50 dark:border-border/30 bg-card/80 backdrop-blur-sm hover:border-primary dark:hover:border-primary hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1 animate-fade-in">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

        <CardHeader className="relative space-y-3 pb-3">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 text-primary dark:text-primary-foreground rounded-full border border-primary/20 dark:border-primary/30 group-hover:from-primary/20 group-hover:to-secondary/20 dark:group-hover:from-primary/30 dark:group-hover:to-secondary/30 transition-all duration-300"
                >
                  {tag.label}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="px-2.5 py-1 text-xs font-semibold bg-muted text-muted-foreground rounded-full border border-border">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <CardTitle className="text-lg md:text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
            {post.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Excerpt */}
          <p className="text-sm md:text-base text-muted-foreground line-clamp-3 leading-relaxed">
            {post.excerpt ||
              'Discover insights and in-depth analysis on this topic...'}
          </p>

          {/* Footer with metadata */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {post.publishDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(post.publishDate)}
                </span>
              )}
              {post.readTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime} min
                </span>
              )}
            </div>

            {/* Read more arrow */}
            <div className="relative z-20 flex items-center gap-1 text-sm font-bold text-primary transition-colors duration-300">
              <span className="hidden sm:inline">Read</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </CardContent>

        {/* Corner shine effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </Card>
    </Link>
  );
}
