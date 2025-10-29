'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { INFORMATION, CONTACT } from '@/constants/information';
import { trpc } from '@/trpc/react';

export default function Home() {
  const { data, isLoading, isError } = trpc.projects.list.useQuery(
    { limit: 2, status: 'PUBLISHED' },
    {
      staleTime: 60_000,
    }
  );

  const featuredProjects = data?.data ?? [];

  return (
    <div className="min-h-screen bg-white">
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <nav className="border-b" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold" aria-label="Home">
                Kien Ha
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link
                href="/projects"
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                Projects
              </Link>
              <Link
                href="/blog"
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                Blog
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main id="main-content">
        <section className="py-20" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1
                id="hero-heading"
                className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl"
              >
                Hi, I&apos;m Kien Ha
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Full-stack developer studying AI. Building modern web
                applications with a focus on clean code and user experience.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Link href="/projects">
                    <Button size="lg" className="w-full">
                      View My Work
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link href="/blog">
                    <Button size="lg" variant="outline" className="w-full">
                      Read My Blog
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Featured Projects
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                A selection of my recent work
              </p>
            </div>
            <div className="mt-12">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading projects...</p>
                </div>
              ) : isError ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Unable to load featured projects right now.
                  </p>
                </div>
              ) : featuredProjects.length > 0 ? (
                <div className="grid gap-8 lg:grid-cols-2">
                  {featuredProjects.map((project) => (
                    <Card key={project.id}>
                      <CardHeader>
                        <CardTitle>{project.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{project.description}</p>
                        <div className="mt-4 flex gap-2">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <span
                              key={tech.name}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                            >
                              {tech.name}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Link href={`/projects/${project.id}`}>
                            <Button variant="outline" size="sm">
                              View Project
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid gap-8 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI-Powered Portfolio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        A modern portfolio website built with Next.js, featuring
                        AI-generated content and analytics.
                      </p>
                      <div className="mt-4 flex gap-2">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          Next.js
                        </span>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          TypeScript
                        </span>
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                          AI
                        </span>
                      </div>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/projects">View Projects</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Machine Learning API</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        RESTful API for machine learning model inference with
                        real-time predictions and monitoring.
                      </p>
                      <div className="mt-4 flex gap-2">
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          Python
                        </span>
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                          FastAPI
                        </span>
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          ML
                        </span>
                      </div>
                      <div className="mt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/projects">View Projects</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Recent Blog Posts */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Latest from the Blog
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Thoughts on AI, development, and technology
              </p>
            </div>
            <div className="mt-12">
              <div className="text-center">
                <p className="text-gray-500">
                  No blog posts yet. Check back soon!
                </p>
                <div className="mt-4">
                  <Link href="/blog">
                    <Button variant="outline">Visit Blog</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

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
