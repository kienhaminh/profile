'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { GoogleAds } from '@/components/ads/GoogleAds';
import DOMPurify from 'isomorphic-dompurify';
import {
  Share2,
  Bookmark,
  BookmarkCheck,
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import type { RelatedBlog } from '@/types/graph';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  publishDate: string | null;
  readTime: number | null;
  tags: Array<{
    id: string;
    label: string;
    slug: string;
    description: string | null;
  }>;
}

interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  score: number;
}

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const fetchPost = useCallback(
    async (signal: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);

        const { slug } = await params;
        const response = await fetch(`/api/blog/posts/${slug}`, {
          signal,
        });
        if (response.ok) {
          const data = await response.json();
          const sanitizedContent = DOMPurify.sanitize(data.content);
          setPost({ ...data, content: sanitizedContent });

          if (data.id) {
            fetchRelatedPosts(data.id, signal);
          }
        } else if (response.status === 404) {
          setError('Post not found');
        } else {
          setError('Failed to load post');
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Post fetch was aborted');
          return;
        }

        console.error('Error fetching post:', error);
        setError('Failed to load post');
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [params]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchPost(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchPost]);

  // Check bookmark status from localStorage when post loads
  useEffect(() => {
    if (post) {
      const bookmarked = localStorage.getItem(`bookmark-${post.slug}`);
      setIsBookmarked(bookmarked === 'true');
    }
  }, [post]);

  // Reading progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollableHeight = documentHeight - windowHeight;

      // Handle edge case where content is shorter than viewport
      if (scrollableHeight <= 0) {
        setReadingProgress(100);
        return;
      }

      const progress = (scrollTop / scrollableHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    // Calculate initial progress after a short delay to ensure content is rendered
    const timeoutId = setTimeout(() => {
      handleScroll();
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const fetchRelatedPosts = async (postId: string, signal: AbortSignal) => {
    try {
      const response = await fetch(`/api/blog/${postId}/related?limit=5`, {
        signal,
      });

      if (response.ok) {
        const data = await response.json();
        setRelatedPosts(
          (data.relatedBlogs || []).map((rb: RelatedBlog) => ({
            id: rb.blog.id,
            slug: rb.blog.slug,
            title: rb.blog.title,
            score: rb.score,
          }))
        );
      } else {
        console.warn('Failed to fetch related posts');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Related posts fetch was aborted');
        return;
      }
      console.error('Error fetching related posts:', error);
      // Don't show error to user for related posts failure
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Share handler with Web Share API fallback to clipboard
  const handleShare = useCallback(async () => {
    if (!post) return;

    const shareData = {
      title: post.title,
      text: post.excerpt || `Check out this article: ${post.title}`,
      url: window.location.href,
    };

    try {
      // Try Web Share API first
      if (navigator.share) {
        await navigator.share(shareData);
        alert('Post shared successfully!');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Post URL copied to clipboard!');
      }
    } catch (error) {
      // Handle cases where user cancels sharing or clipboard fails
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share failed:', error);
        alert('Share failed. Please try again.');
      }
    }
  }, [post]);

  // Bookmark handler with debouncing and localStorage persistence
  const handleBookmark = useCallback(async () => {
    if (!post) return;

    const newBookmarkState = !isBookmarked;

    // Update state immediately for responsive UI
    setIsBookmarked(newBookmarkState);

    // Persist to localStorage
    try {
      if (newBookmarkState) {
        localStorage.setItem(`bookmark-${post.slug}`, 'true');
      } else {
        localStorage.removeItem(`bookmark-${post.slug}`);
      }
    } catch (error) {
      // Revert state if localStorage fails
      setIsBookmarked(!newBookmarkState);
      console.error('Failed to update bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    }
  }, [post, isBookmarked]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Post Not Found</h1>
            <p className="text-gray-600 text-lg">
              {error || "The post you're looking for doesn't exist."}
            </p>
            <Link href="/blog">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <header className="mb-12 space-y-6 animate-fade-in">
          {/* Back to Blog Button */}
          <Link href="/blog">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight">
            {post.title}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all"
              >
                {tag.label}
              </Badge>
            ))}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatDate(post.publishDate)}</span>
            </div>
            {post.readTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{post.readTime} min read</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              aria-label={`Share post: ${post.title}`}
              className="border-2 hover:border-purple-300 transition-all"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBookmark}
              aria-label={
                isBookmarked
                  ? `Remove bookmark for post: ${post.title}`
                  : `Bookmark post: ${post.title}`
              }
              aria-pressed={isBookmarked}
              className={`border-2 transition-all ${
                isBookmarked
                  ? 'border-purple-300 bg-purple-50 text-purple-700'
                  : 'hover:border-purple-300'
              }`}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 mr-2" />
              ) : (
                <Bookmark className="w-4 h-4 mr-2" />
              )}
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12 prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-10 prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-8 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-a:text-purple-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-strong:font-bold prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-blockquote:border-l-purple-500 prose-blockquote:bg-purple-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-code:text-purple-700 prose-code:bg-purple-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Google Ads - Non-intrusive placement */}
        {(() => {
          const adSlotId = process.env.NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID;
          return adSlotId && adSlotId.trim() !== '' ? (
            <GoogleAds slot={adSlotId} format="auto" responsive={true} />
          ) : null;
        })()}

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Related Posts
              </span>
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group block"
                >
                  <Card className="h-full border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-lg group-hover:text-purple-600 transition-colors line-clamp-2 mb-2">
                        {relatedPost.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        Similarity: {Math.round(relatedPost.score * 100)}%
                      </CardDescription>
                    </CardHeader>
                    <div className="px-6 pb-6">
                      <span className="inline-flex items-center text-sm font-semibold text-purple-600 group-hover:text-pink-600 transition-colors">
                        Read More
                        <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/blog">
              <Button
                variant="outline"
                className="border-2 hover:border-purple-300 transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                aria-label={`Share post: ${post.title}`}
                className="border-2 hover:border-purple-300 transition-all"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmark}
                aria-label={
                  isBookmarked
                    ? `Remove bookmark for post: ${post.title}`
                    : `Bookmark post: ${post.title}`
                }
                aria-pressed={isBookmarked}
                className={`border-2 transition-all ${
                  isBookmarked
                    ? 'border-purple-300 bg-purple-50 text-purple-700'
                    : 'hover:border-purple-300'
                }`}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                ) : (
                  <Bookmark className="w-4 h-4 mr-2" />
                )}
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
            </div>
          </div>
        </div>
      </article>

      {/* Footer moved to Root layout */}
    </div>
  );
}
