'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { GoogleAds } from '@/components/ads/GoogleAds';
import DOMPurify from 'isomorphic-dompurify';
import { Share2, Bookmark, BookmarkCheck } from 'lucide-react';
import { INFORMATION, CONTACT } from '@/constants/information';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  publishDate: string | null;
  readTime: number | null;
  topics: Array<{
    id: string;
    name: string;
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

  useEffect(() => {
    const controller = new AbortController();
    fetchPost(controller.signal);

    return () => {
      controller.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check bookmark status from localStorage when post loads
  useEffect(() => {
    if (post) {
      const bookmarked = localStorage.getItem(`bookmark-${post.slug}`);
      setIsBookmarked(bookmarked === 'true');
    }
  }, [post]);

  const fetchPost = async (signal: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const { slug } = await params;
      const response = await fetch(`/api/blog/posts/${slug}`, {
        signal,
      });
      if (response.ok) {
        const data = await response.json();
        // Sanitize the content to prevent XSS attacks
        const sanitizedContent = DOMPurify.sanitize(data.content);
        setPost({ ...data, content: sanitizedContent });

        // Fetch related posts once we have the post ID
        if (data.id) {
          fetchRelatedPosts(data.id, signal);
        }
      } else if (response.status === 404) {
        setError('Post not found');
      } else {
        setError('Failed to load post');
      }
    } catch (error) {
      // Handle AbortError separately to avoid showing error for cancelled requests
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Post fetch was aborted');
        return;
      }

      console.error('Error fetching post:', error);
      setError('Failed to load post');
    } finally {
      // Only update loading state if the request was not aborted
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  };

  const fetchRelatedPosts = async (postId: string, signal: AbortSignal) => {
    try {
      const response = await fetch(`/api/blog/${postId}/related?limit=5`, {
        signal,
      });

      if (response.ok) {
        const data = await response.json();
        setRelatedPosts(data.data || []);
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
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Post Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              {error || "The post you're looking for doesn't exist."}
            </p>
            <Link href="/blog">
              <Button>Back to Blog</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold">
                {process.env.NEXT_PUBLIC_SITE_NAME || 'Kien Ha'}
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link
                href="/projects"
                className="text-gray-600 hover:text-gray-900"
              >
                Projects
              </Link>
              <Link href="/blog" className="text-gray-900 font-medium">
                Blog
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Article */}
      <article className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-4">
            {post.topics.map((topic) => (
              <span
                key={topic.name}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
              >
                {topic.name}
              </span>
            ))}
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <span>{formatDate(post.publishDate)}</span>
            {post.readTime && (
              <>
                <span className="mx-2">•</span>
                <span>{post.readTime} min read</span>
              </>
            )}
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
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
          <div className="mt-12 pt-8 border-t">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Posts
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="block transition-transform hover:scale-[1.02]"
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">
                        {relatedPost.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        Relevance score: {relatedPost.score}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t">
          <div className="flex justify-between items-center">
            <Link href="/blog">
              <Button variant="outline">← Back to Blog</Button>
            </Link>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                aria-label={`Share post: ${post.title}`}
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white" role="contentinfo">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3">📧</span>
                  <Link
                    href={`mailto:${CONTACT.email}`}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {CONTACT.email}
                  </Link>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3">📱</span>
                  <Link
                    href={`tel:${CONTACT.mobile}`}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {CONTACT.mobile}
                  </Link>
                </div>
                <div className="flex items-start">
                  <span className="text-gray-400 mr-3 mt-0.5">📍</span>
                  <span className="text-gray-300">{CONTACT.address}</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect With Me</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3">💼</span>
                  <Link
                    href={CONTACT.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    LinkedIn
                  </Link>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3">🐙</span>
                  <Link
                    href={CONTACT.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    GitHub
                  </Link>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-3">📘</span>
                  <Link
                    href={CONTACT.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Facebook
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link
                  href="/projects"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  View My Projects
                </Link>
                <Link
                  href="/blog"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Read My Blog
                </Link>
                <Link
                  href={`mailto:${CONTACT.email}`}
                  className="inline-block mt-4"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white bg-transparent hover:bg-white hover:text-gray-900"
                  >
                    Get In Touch
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} {INFORMATION.name}. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
