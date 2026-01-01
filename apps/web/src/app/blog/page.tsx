'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { trpc } from '@/trpc/react';
import { BookOpen, Search, X } from 'lucide-react';
import { BlogCard, BlogCardSkeleton } from '@/components/blog';
import { BLOG_TOPICS, BLOG_TOPIC_LABELS, BLOG_CONFIG } from '@/constants/blog';
import { cn } from '@/lib/utils';

const TOPIC_OPTIONS = Object.values(BLOG_TOPICS);

export default function Blog(): React.JSX.Element {
  const [selectedTopic, setSelectedTopic] = useState<string>(BLOG_TOPICS.ALL);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchInput]);

  const {
    data: posts = [],
    isLoading,
    isError,
  } = trpc.blog.posts.useQuery(
    {
      topic: selectedTopic || undefined,
      search: debouncedSearch || undefined,
      limit: BLOG_CONFIG.POSTS_PER_PAGE,
    },
    { keepPreviousData: true }
  );

  return (
    <div className="min-h-screen bg-background pt-28">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-3">
          Blog
        </h1>
        <p className="text-muted-foreground">
          Thoughts on AI, development, and technology
        </p>
      </div>

      {/* Search and Filters */}
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-10 h-10 bg-card/50 border border-border hover:border-border/80 focus:border-primary rounded-lg transition-colors"
              aria-label="Search blog posts"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Topic Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {TOPIC_OPTIONS.map((topic) => {
              const isSelected = selectedTopic === topic;
              return (
                <button
                  key={topic || 'all'}
                  onClick={() => setSelectedTopic(topic)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg transition-colors',
                    isSelected
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                  aria-label={`Filter by ${BLOG_TOPIC_LABELS[topic]}`}
                  aria-pressed={isSelected}
                >
                  {BLOG_TOPIC_LABELS[topic]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <BlogCardSkeleton key={idx} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 border-t border-border">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">
              Something went wrong
            </p>
            <p className="text-sm text-muted-foreground">
              Unable to load posts right now. Please try again later.
            </p>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-t border-border">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">
              {selectedTopic ? 'No posts found' : 'Coming Soon'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedTopic
                ? `No posts found for "${BLOG_TOPIC_LABELS[selectedTopic]}".`
                : 'No blog posts yet. Check back soon!'}
            </p>
            {selectedTopic && (
              <button
                onClick={() => setSelectedTopic(BLOG_TOPICS.ALL)}
                className="text-sm text-primary hover:underline"
              >
                View All Posts
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
