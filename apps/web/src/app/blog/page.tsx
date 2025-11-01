'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { INFORMATION, CONTACT } from '@/constants/information';
import { trpc } from '@/trpc/react';
import {
  BookOpen,
  Mail,
  Linkedin,
  Github,
  ArrowRight,
  Search,
} from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200/50 shadow-sm"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
                aria-label="Home"
              >
                Kien Ha
              </Link>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Link
                href="/projects"
                className="px-3 py-2 text-sm sm:text-base text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                Projects
              </Link>
              <Link
                href="/blog"
                className="px-3 py-2 text-sm sm:text-base text-purple-600 bg-purple-50 rounded-lg font-medium transition-all duration-200"
              >
                Blog
              </Link>
              <Link href={`mailto:${CONTACT.email}`}>
                <Button
                  size="sm"
                  className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Contact</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header with gradient */}
      <div className="relative py-20 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"></div>
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
          <Search className="w-5 h-5 text-gray-500" />
          <Button
            variant={selectedTopic === '' ? 'default' : 'outline'}
            onClick={() => setSelectedTopic('')}
            size="sm"
            className={
              selectedTopic === ''
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md'
                : 'border-2 hover:border-purple-300 transition-all'
            }
          >
            All
          </Button>
          <Button
            variant={selectedTopic === 'AI' ? 'default' : 'outline'}
            onClick={() => setSelectedTopic('AI')}
            size="sm"
            className={
              selectedTopic === 'AI'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md'
                : 'border-2 hover:border-purple-300 transition-all'
            }
          >
            AI
          </Button>
          <Button
            variant={selectedTopic === 'Backend' ? 'default' : 'outline'}
            onClick={() => setSelectedTopic('Backend')}
            size="sm"
            className={
              selectedTopic === 'Backend'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md'
                : 'border-2 hover:border-purple-300 transition-all'
            }
          >
            Backend
          </Button>
          <Button
            variant={selectedTopic === 'Career' ? 'default' : 'outline'}
            onClick={() => setSelectedTopic('Career')}
            size="sm"
            className={
              selectedTopic === 'Career'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md'
                : 'border-2 hover:border-purple-300 transition-all'
            }
          >
            Career
          </Button>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading posts...</p>
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
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <Card className="h-full border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-purple-600 transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.topics.slice(0, 2).map((topic) => (
                        <span
                          key={topic.id}
                          className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-full border border-purple-200"
                        >
                          {topic.name}
                        </span>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 line-clamp-3 leading-relaxed">
                      {post.excerpt || 'No excerpt available.'}
                    </p>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        {formatDate(post.publishDate)}
                      </span>
                      <span className="inline-flex items-center text-sm font-semibold text-purple-600 group-hover:text-pink-600 transition-colors">
                        Read More
                        <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-purple-600" />
            </div>
            <p className="text-xl text-gray-700 mb-2 font-semibold">
              {selectedTopic ? `No posts found` : 'Coming Soon!'}
            </p>
            <p className="text-gray-500 mb-6">
              {selectedTopic
                ? `No posts found for topic "${selectedTopic}".`
                : 'No blog posts yet. Check back soon for exciting content!'}
            </p>
            {selectedTopic && (
              <Button
                variant="outline"
                onClick={() => setSelectedTopic('')}
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all"
              >
                View All Posts
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer - Enhanced version matching homepage */}
      <footer
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden"
        role="contentinfo"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-600 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Contact Information */}
            <div>
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Contact Information
              </h3>
              <div className="space-y-4">
                <Link
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center group hover:translate-x-1 transition-transform duration-200"
                >
                  <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors mr-3">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    {CONTACT.email}
                  </span>
                </Link>
                <Link
                  href={`tel:${CONTACT.mobile}`}
                  className="flex items-center group hover:translate-x-1 transition-transform duration-200"
                >
                  <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors mr-3">
                    <Mail className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    {CONTACT.mobile}
                  </span>
                </Link>
                <div className="flex items-start group">
                  <div className="p-2 rounded-lg bg-white/10 mr-3 mt-0.5">
                    <Mail className="w-5 h-5 text-pink-400" />
                  </div>
                  <span className="text-gray-300">{CONTACT.address}</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Connect With Me
              </h3>
              <div className="space-y-4">
                <Link
                  href={CONTACT.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center group hover:translate-x-1 transition-transform duration-200"
                >
                  <div className="p-2 rounded-lg bg-white/10 group-hover:bg-blue-600 transition-colors mr-3">
                    <Linkedin className="w-5 h-5" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    LinkedIn
                  </span>
                </Link>
                <Link
                  href={CONTACT.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center group hover:translate-x-1 transition-transform duration-200"
                >
                  <div className="p-2 rounded-lg bg-white/10 group-hover:bg-purple-600 transition-colors mr-3">
                    <Github className="w-5 h-5" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    GitHub
                  </span>
                </Link>
                <Link
                  href={CONTACT.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center group hover:translate-x-1 transition-transform duration-200"
                >
                  <div className="p-2 rounded-lg bg-white/10 group-hover:bg-blue-500 transition-colors mr-3">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    Facebook
                  </span>
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent">
                Quick Links
              </h3>
              <div className="space-y-4">
                <Link
                  href="/projects"
                  className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
                >
                  View My Projects
                </Link>
                <Link
                  href="/blog"
                  className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
                >
                  Read My Blog
                </Link>
                <Link
                  href={`mailto:${CONTACT.email}`}
                  className="inline-block mt-2"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-2 border-white/30 bg-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Get In Touch
                    <Mail className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} {INFORMATION.name}. All rights
                reserved.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Made with</span>
                <span className="text-red-500 animate-pulse">♥</span>
                <span>using Next.js</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
