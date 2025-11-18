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
import { BlogPostSkeleton } from '@/components/blog';
import DOMPurify from 'isomorphic-dompurify';
import { toast } from 'sonner';
import {
  Share2,
  Bookmark,
  BookmarkCheck,
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import type { Blog } from '@/types/blog';
import { fetchPostBySlug, fetchRelatedPosts } from '@/lib/blog-client';
import { BLOG_CONFIG } from '@/constants/blog';

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

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPostPage({ params }: BlogPostPageProps): React.JSX.Element {
  const [post, setPost] = useState<Blog | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  const loadPost = useCallback(
    async (signal: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);

        const { slug } = await params;
        const data = await fetchPostBySlug(slug, { signal });
        
        const sanitizedContent = DOMPurify.sanitize(data.content);
        setPost({ ...data, content: sanitizedContent });

        if (data.id) {
          loadRelatedPosts(data.id, signal);
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            return;
          }
          setError(error.message);
        } else {
          setError('Failed to load post');
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [params]
  );

  const loadRelatedPosts = async (postId: string, signal: AbortSignal): Promise<void> => {
    try {
      const related = await fetchRelatedPosts(
        postId,
        BLOG_CONFIG.RELATED_POSTS_LIMIT,
        { signal }
      );
      setRelatedPosts(related);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.warn('Failed to fetch related posts:', error);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadPost(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadPost]);

  useEffect(() => {
    if (post) {
      const bookmarked = localStorage.getItem(`bookmark-${post.slug}`);
      setIsBookmarked(bookmarked === 'true');
    }
  }, [post]);

  useEffect(() => {
    const handleScroll = (): void => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollableHeight = documentHeight - windowHeight;

      if (scrollableHeight <= 0) {
        setReadingProgress(100);
        return;
      }

      const progress = (scrollTop / scrollableHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

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

  const handleShare = useCallback(async () => {
    if (!post) return;

    const shareData = {
      title: post.title,
      text: post.excerpt || `Check out this article: ${post.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Post shared successfully!');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Post URL copied to clipboard!');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Share failed:', error);
        toast.error('Failed to share. Please try again.');
      }
    }
  }, [post]);

  const handleBookmark = useCallback(async () => {
    if (!post) return;

    const newBookmarkState = !isBookmarked;

    try {
      if (newBookmarkState) {
        localStorage.setItem(`bookmark-${post.slug}`, 'true');
        toast.success('Post bookmarked!');
      } else {
        localStorage.removeItem(`bookmark-${post.slug}`);
        toast.success('Bookmark removed');
      }
      setIsBookmarked(newBookmarkState);
    } catch (error) {
      console.error('Failed to update bookmark:', error);
      toast.error('Failed to update bookmark. Please try again.');
    }
  }, [post, isBookmarked]);

  if (loading) {
    return <BlogPostSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-100 to-pink-100 border-4 border-red-200 flex items-center justify-center shadow-lg">
              <Calendar className="w-12 h-12 text-red-600" />
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-foreground">Post Not Found</h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                {error || "The post you're looking for doesn't exist or has been removed."}
              </p>
            </div>
            <Link href="/blog">
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105">
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
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200/50 backdrop-blur-sm z-50">
        <div
          className="h-full bg-gradient-to-r from-primary via-secondary to-primary transition-all duration-150 ease-out shadow-sm"
          style={{ width: `${readingProgress}%` }}
          role="progressbar"
          aria-valuenow={readingProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Reading progress"
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
              className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-gray-100 animate-fade-in">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          )}

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight animate-fade-in">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-primary pl-6 py-2 bg-gradient-to-r from-primary/5 to-transparent rounded-r-lg animate-fade-in">
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 animate-fade-in">
              {post.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border border-primary/20 hover:from-primary/20 hover:to-secondary/20 transition-all hover:scale-105"
                >
                  {tag.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground animate-fade-in">
            {post.publishDate && (
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">{formatDate(post.publishDate)}</span>
              </div>
            )}
            {post.readTime && (
              <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">{post.readTime} min read</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 animate-fade-in">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              aria-label={`Share post: ${post.title}`}
              className="border-2 hover:border-primary/50 hover:bg-primary/5 transition-all hover:scale-105"
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
              className={`border-2 transition-all hover:scale-105 ${
                isBookmarked
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'hover:border-primary/50 hover:bg-primary/5'
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
          <div className="mt-16 pt-12 border-t border-border/50">
            <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
                  <Card className="h-full border-2 border-border hover:border-primary/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-card/80 backdrop-blur-sm overflow-hidden cosmic-card-border">
                    <CardHeader>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {relatedPost.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full inline-block">
                        Similarity: {Math.round(relatedPost.score * 100)}%
                      </CardDescription>
                    </CardHeader>
                    <div className="px-6 pb-6">
                      <span className="inline-flex items-center text-sm font-semibold text-primary group-hover:text-secondary transition-colors">
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
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/blog">
              <Button
                variant="outline"
                className="border-2 hover:border-primary/50 hover:bg-primary/5 transition-all hover:scale-105"
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
                className="border-2 hover:border-primary/50 hover:bg-primary/5 transition-all hover:scale-105"
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
                className={`border-2 transition-all hover:scale-105 ${
                  isBookmarked
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'hover:border-primary/50 hover:bg-primary/5'
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
    </div>
  );
}
