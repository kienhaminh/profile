'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/react';
import { BookOpen, Search } from 'lucide-react';
import { BlogCard, BlogCardSkeleton } from '@/components/blog';
import { BLOG_TOPICS, BLOG_TOPIC_LABELS, BLOG_CONFIG } from '@/constants/blog';
import { cn } from '@/lib/utils';

const TOPIC_OPTIONS = Object.values(BLOG_TOPICS);

export default function Blog(): React.JSX.Element {
  const [selectedTopic, setSelectedTopic] = useState<string>(BLOG_TOPICS.ALL);

  const {
    data: posts = [],
    isLoading,
    isError,
  } = trpc.blog.posts.useQuery(
    {
      topic: selectedTopic || undefined,
      limit: BLOG_CONFIG.POSTS_PER_PAGE,
    },
    { keepPreviousData: true }
  );

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <div className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/20 shadow-xl dark:shadow-primary/30 hover:scale-110 transition-all duration-300 hover:shadow-2xl dark:hover:shadow-primary/50">
                <BookOpen className="w-12 h-12 text-primary animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold">
              <span className="block text-foreground">My</span>
              <span className="block text-primary text-glow bg-clip-text">
                Blog
              </span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Thoughts on AI, development, and technology
            </p>
          </div>
        </div>
      </div>

      {/* Topic Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Search className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          {TOPIC_OPTIONS.map((topic) => {
            const isSelected = selectedTopic === topic;
            return (
              <Button
                key={topic || 'all'}
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => setSelectedTopic(topic)}
                size="sm"
                className={cn(
                  'transition-all',
                  isSelected
                    ? 'stellar-button bg-primary hover:bg-primary/90 text-primary-foreground shadow-md'
                    : 'border-2 hover:border-primary'
                )}
                aria-label={`Filter by ${BLOG_TOPIC_LABELS[topic]}`}
                aria-pressed={isSelected}
              >
                {BLOG_TOPIC_LABELS[topic]}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Blog Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <BlogCardSkeleton key={idx} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-destructive" />
            </div>
            <p className="text-xl text-foreground mb-2 font-semibold">
              Oops! Something went wrong
            </p>
            <p className="text-muted-foreground">
              Unable to load posts right now. Please try again later.
            </p>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-primary" />
            </div>
            <p className="text-xl text-foreground mb-2 font-semibold">
              {selectedTopic ? 'No posts found' : 'Coming Soon!'}
            </p>
            <p className="text-muted-foreground mb-6">
              {selectedTopic
                ? `No posts found for topic "${BLOG_TOPIC_LABELS[selectedTopic]}".`
                : 'No blog posts yet. Check back soon for exciting content!'}
            </p>
            {selectedTopic && (
              <Button
                variant="outline"
                onClick={() => setSelectedTopic(BLOG_TOPICS.ALL)}
                className="stellar-button border-2 border-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground transition-all"
              >
                View All Posts
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
