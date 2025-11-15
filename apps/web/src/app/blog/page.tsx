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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header with gradient */}
      <div className="relative py-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold">
              <span className="block text-gray-900">My</span>
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                Blog
              </span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Thoughts on AI, development, and technology
            </p>
          </div>
        </div>
      </div>

      {/* Topic Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Search className="w-5 h-5 text-gray-500" aria-hidden="true" />
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
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md'
                    : 'border-2 hover:border-purple-300'
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
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-red-600" />
            </div>
            <p className="text-xl text-gray-700 mb-2 font-semibold">
              Oops! Something went wrong
            </p>
            <p className="text-gray-500">
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
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-purple-600" />
            </div>
            <p className="text-xl text-gray-700 mb-2 font-semibold">
              {selectedTopic ? 'No posts found' : 'Coming Soon!'}
            </p>
            <p className="text-gray-500 mb-6">
              {selectedTopic
                ? `No posts found for topic "${BLOG_TOPIC_LABELS[selectedTopic]}".`
                : 'No blog posts yet. Check back soon for exciting content!'}
            </p>
            {selectedTopic && (
              <Button
                variant="outline"
                onClick={() => setSelectedTopic(BLOG_TOPICS.ALL)}
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all"
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
