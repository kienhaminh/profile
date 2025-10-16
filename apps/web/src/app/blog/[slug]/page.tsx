'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GoogleAds } from '@/components/ads/GoogleAds';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  publishDate: string | null;
  readTime: number | null;
  topics: Array<{ topic: { name: string } }>;
}

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [params.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else if (response.status === 404) {
        setError('Post not found');
      } else {
        setError('Failed to load post');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
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
                Kien Ha
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
              <Link
                href="mailto:kien@example.com"
                className="text-gray-600 hover:text-gray-900"
              >
                Contact
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
            {post.topics.map(({ topic }) => (
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
        <GoogleAds
          slot={process.env.NEXT_PUBLIC_GOOGLE_ADS_SLOT_ID || ''}
          format="auto"
          responsive={true}
        />

        <div className="mt-12 pt-8 border-t">
          <div className="flex justify-between items-center">
            <Link href="/blog">
              <Button variant="outline">← Back to Blog</Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Share
              </Button>
              <Button variant="outline" size="sm">
                Bookmark
              </Button>
            </div>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Let&apos;s Connect</h3>
            <p className="mt-2 text-gray-400">
              Interested in working together? Get in touch.
            </p>
            <div className="mt-6">
              <Link href="mailto:kien@example.com">
                <Button
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-gray-900"
                >
                  Send Email
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
