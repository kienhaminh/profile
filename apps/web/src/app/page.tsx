import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { INFORMATION, CONTACT } from '@/constants/information';
import { getAllProjects } from '@/services/projects';
import { listBlogs } from '@/services/blog';
import { POST_STATUS, PROJECT_STATUS } from '@/types/enums';
import {
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { HomeAnimations } from '@/components/HomeAnimations';

export default async function Home() {
  const [projects, blogs] = await Promise.all([
    getAllProjects(PROJECT_STATUS.PUBLISHED),
    listBlogs(POST_STATUS.PUBLISHED),
  ]);

  // For now, just take the first few items
  // TODO: Add proper pagination support in services
  const featuredProjects = projects.slice(0, 2);
  const recentBlogs = blogs.slice(0, 3);

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return '';
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* GSAP Animations */}
      <HomeAnimations />

      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg shadow-lg"
      >
        Skip to main content
      </a>

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
                className="px-3 py-2 text-sm sm:text-base text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Projects
              </Link>
              <Link
                href="/blog"
                className="px-3 py-2 text-sm sm:text-base text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

      {/* Hero Section */}
      <main id="main-content">
        <section
          className="relative py-20 sm:py-32 overflow-hidden"
          aria-labelledby="hero-heading"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="bg-blob-1 absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
            <div className="bg-blob-2 absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-8">
              {/* Profile avatar */}
              <div className="flex justify-center">
                <div className="hero-avatar relative group">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 shadow-xl">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      <Image
                        src="/assets/avatar.jpg"
                        alt="Kien Ha"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                </div>
              </div>

              <div className="space-y-6">
                <h1
                  id="hero-heading"
                  className="text-4xl font-extrabold sm:text-5xl md:text-7xl"
                >
                  <span className="hero-title block text-gray-900">
                    Hi, I&apos;m
                  </span>
                  <span className="hero-subtitle block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                    Kien Ha
                  </span>
                </h1>

                <p className="hero-description mt-3 max-w-md mx-auto text-lg text-gray-600 sm:text-xl md:mt-5 md:max-w-3xl leading-relaxed">
                  Full-stack developer studying{' '}
                  <span className="font-semibold text-blue-600">AI</span>.
                  Building modern web applications with a focus on{' '}
                  <span className="font-semibold text-purple-600">
                    clean code
                  </span>{' '}
                  and{' '}
                  <span className="font-semibold text-pink-600">
                    user experience
                  </span>
                  .
                </p>

                {/* Social Links */}
                <div className="flex justify-center gap-4">
                  <Link
                    href={CONTACT.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-social p-3 rounded-full bg-gray-100 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-500 text-gray-700 hover:text-white transition-all duration-300 shadow-md hover:shadow-xl hover:scale-110"
                    aria-label="GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </Link>
                  <Link
                    href={CONTACT.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-social p-3 rounded-full bg-gray-100 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-500 text-gray-700 hover:text-white transition-all duration-300 shadow-md hover:shadow-xl hover:scale-110"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </Link>
                  <Link
                    href={`mailto:${CONTACT.email}`}
                    className="hero-social p-3 rounded-full bg-gray-100 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-500 text-gray-700 hover:text-white transition-all duration-300 shadow-md hover:shadow-xl hover:scale-110"
                    aria-label="Email"
                  >
                    <Mail className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link href="/projects">
                  <Button
                    size="lg"
                    className="hero-cta animated-button w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    View My Work
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/blog">
                  <Button
                    size="lg"
                    variant="outline"
                    className="hero-cta animated-button w-full sm:w-auto border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Read My Blog
                  </Button>
                </Link>
              </div>

              {/* Scroll Indicator */}
              <div className="scroll-indicator pt-12 flex flex-col items-center gap-2 opacity-50">
                <span className="text-sm text-gray-500">Scroll to explore</span>
                <ChevronDown className="w-6 h-6 text-gray-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="py-20 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="section-title text-center space-y-4 mb-16">
              <h2 className="text-4xl font-extrabold text-gray-900">
                Featured{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Projects
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A selection of my recent work showcasing creativity and
                technical expertise
              </p>
            </div>
            <div className="mt-12">
              {featuredProjects.length > 0 ? (
                <div className="grid gap-8 lg:grid-cols-2">
                  {featuredProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="project-card group block"
                    >
                      <Card className="h-full border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden relative">
                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <CardHeader className="relative">
                          <CardTitle className="text-2xl group-hover:text-blue-600 transition-colors flex items-center justify-between">
                            {project.title}
                            <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="relative space-y-4">
                          <p className="text-gray-600 leading-relaxed">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {project.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag.id}
                                className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-full border border-blue-200 hover:border-blue-400 transition-colors"
                              >
                                {tag.label}
                              </span>
                            ))}
                          </div>
                          <div className="pt-2">
                            <span className="inline-flex items-center text-sm font-semibold text-blue-600 group-hover:text-purple-600 transition-colors">
                              View Project
                              <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid gap-8 lg:grid-cols-2">
                  <Link href="/projects" className="project-card group block">
                    <Card className="h-full border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <CardHeader className="relative">
                        <CardTitle className="text-2xl group-hover:text-blue-600 transition-colors flex items-center justify-between">
                          AI-Powered Portfolio
                          <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative space-y-4">
                        <p className="text-gray-600 leading-relaxed">
                          A modern portfolio website built with Next.js,
                          featuring AI-generated content and analytics.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full border border-blue-200">
                            Next.js
                          </span>
                          <span className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-full border border-green-200">
                            TypeScript
                          </span>
                          <span className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-full border border-purple-200">
                            AI
                          </span>
                        </div>
                        <div className="pt-2">
                          <span className="inline-flex items-center text-sm font-semibold text-blue-600 group-hover:text-purple-600 transition-colors">
                            Explore Projects
                            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/projects" className="project-card group block">
                    <Card className="h-full border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <CardHeader className="relative">
                        <CardTitle className="text-2xl group-hover:text-blue-600 transition-colors flex items-center justify-between">
                          Machine Learning API
                          <ExternalLink className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative space-y-4">
                        <p className="text-gray-600 leading-relaxed">
                          RESTful API for machine learning model inference with
                          real-time predictions and monitoring.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-full border border-red-200">
                            Python
                          </span>
                          <span className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 rounded-full border border-orange-200">
                            FastAPI
                          </span>
                          <span className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 rounded-full border border-yellow-200">
                            ML
                          </span>
                        </div>
                        <div className="pt-2">
                          <span className="inline-flex items-center text-sm font-semibold text-blue-600 group-hover:text-purple-600 transition-colors">
                            Explore Projects
                            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              )}

              {/* Show More Button */}
              <div className="mt-16 text-center">
                <Link href="/projects">
                  <Button
                    size="lg"
                    className="animated-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    Explore All Projects
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Blog Posts */}
        <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="section-title text-center space-y-4 mb-16">
              <h2 className="text-4xl font-extrabold text-gray-900">
                Latest from the{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Blog
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Thoughts on AI, development, and technology
              </p>
            </div>
            <div className="mt-12">
              {recentBlogs.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {recentBlogs.map((blog) => (
                    <Link
                      key={blog.id}
                      href={`/blog/${blog.slug}`}
                      className="blog-card group block"
                    >
                      <Card className="h-full border-2 border-gray-100 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-xl group-hover:text-purple-600 transition-colors line-clamp-2">
                            {blog.title}
                          </CardTitle>
                          {blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {blog.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag.id}
                                  className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 rounded-full border border-purple-200"
                                >
                                  {tag.label}
                                </span>
                              ))}
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-600 line-clamp-3 leading-relaxed">
                            {blog.excerpt || 'No excerpt available.'}
                          </p>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-sm text-gray-500">
                              {formatDate(blog.publishDate)}
                            </span>
                            <span className="inline-flex items-center text-sm font-semibold text-purple-600 group-hover:text-blue-600 transition-colors">
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
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <Mail className="w-12 h-12 text-purple-600" />
                  </div>
                  <p className="text-xl text-gray-700 mb-2 font-semibold">
                    Coming Soon!
                  </p>
                  <p className="text-gray-500 mb-6">
                    No blog posts yet. Check back soon for exciting content!
                  </p>
                  <Link href="/blog">
                    <Button
                      variant="outline"
                      className="animated-button border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Visit Blog
                    </Button>
                  </Link>
                </div>
              )}

              {/* Show More Button */}
              {recentBlogs.length > 0 && (
                <div className="mt-16 text-center">
                  <Link href="/blog">
                    <Button
                      size="lg"
                      className="animated-button bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      View All Posts
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden"
        role="contentinfo"
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Contact Information */}
            <div className="footer-section">
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
            <div className="footer-section">
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
            <div className="footer-section">
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
                    className="animated-button text-white border-2 border-white/30 bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl"
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
