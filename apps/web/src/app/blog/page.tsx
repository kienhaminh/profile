'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { INFORMATION, CONTACT } from '@/constants/information';
import { trpc } from '@/trpc/react';

export default function Blog() {
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  const {
    data: posts = [],
    isLoading,
    isError,
  } = trpc.blog.posts.useQuery(
    {
      topic: selectedTopic || undefined,
      limit: 10,
    },
    { keepPreviousData: true }
  );

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
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading posts...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Unable to load posts right now. Please try again later.
            </p>
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
                    {post.topics.map((topic) => (
                      <span
                        key={topic.id}
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
                    <Button variant="outline" size="sm">
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
