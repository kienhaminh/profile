'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  publishDate: string | null;
  topics: Array<{ topic: { name: string } }>;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  useEffect(() => {
    fetchPosts();
  }, [selectedTopic]);

  const fetchPosts = async () => {
    try {
      const url = selectedTopic
        ? `/api/blog/posts?topic=${encodeURIComponent(selectedTopic)}`
        : '/api/blog/posts';

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
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

      {/* Header */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Blog</h1>
            <p className="mt-4 text-lg text-gray-600">
              Thoughts on AI, development, and technology
            </p>
          </div>
        </div>
      </div>

      {/* Topic Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedTopic === '' ? 'default' : 'outline'}
            onClick={() => setSelectedTopic('')}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={selectedTopic === 'AI' ? 'default' : 'outline'}
            onClick={() => setSelectedTopic('AI')}
            size="sm"
          >
            AI
          </Button>
          <Button
            variant={selectedTopic === 'Backend' ? 'default' : 'outline'}
            onClick={() => setSelectedTopic('Backend')}
            size="sm"
          >
            Backend
          </Button>
          <Button
            variant={selectedTopic === 'Career' ? 'default' : 'outline'}
            onClick={() => setSelectedTopic('Career')}
            size="sm"
          >
            Career
          </Button>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading posts...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-2">
            {posts.map((post) => (
              <Card key={post.id} className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-blue-600"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {post.topics.map(({ topic }) => (
                      <span
                        key={topic.name}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                      >
                        {topic.name}
                      </span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {post.excerpt || 'No excerpt available.'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {formatDate(post.publishDate)}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/blog/${post.slug}`}>Read More</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {selectedTopic
                ? `No posts found for topic "${selectedTopic}".`
                : 'No blog posts yet. Check back soon!'}
            </p>
            {selectedTopic && (
              <div className="mt-4">
                <Button variant="outline" onClick={() => setSelectedTopic('')}>
                  View All Posts
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

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
