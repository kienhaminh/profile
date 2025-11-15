import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { INFORMATION, CONTACT } from '@/constants/information';
import { getAllProjects } from '@/services/projects';
import {
  PROJECT_STATUS_FILTERS,
  STATUS_BADGE_STYLES,
  PROJECT_BUTTON_LABELS,
  NAVIGATION_LABELS,
  PAGE_CONTENT,
} from '@/constants/projects';
import { ExternalLink, Github, Mail, Linkedin, Rocket } from 'lucide-react';
import { generateMetadata as generateSEOMetadata } from '@/config/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Projects',
  description:
    'Explore my portfolio of web development projects, including full-stack applications built with React, Next.js, TypeScript, Node.js, and AI integrations. Real-world applications showcasing modern development practices.',
  keywords: [
    'portfolio',
    'projects',
    'web applications',
    'react projects',
    'nextjs projects',
    'full-stack projects',
    'typescript projects',
    'AI applications',
  ],
  url: '/projects',
});

export default async function Projects() {
  const { data: projects } = await getAllProjects(
    PROJECT_STATUS_FILTERS.PUBLISHED
  );

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Header */}
      <div className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/20 shadow-xl">
                <Rocket className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold">
              <span className="block text-foreground">{PAGE_CONTENT.TITLE}</span>
              <span className="block text-primary text-glow">
                Portfolio
              </span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {PAGE_CONTENT.SUBTITLE}
            </p>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Rocket className="w-12 h-12 text-primary" />
            </div>
            <p className="text-xl text-foreground mb-2 font-semibold">
              Coming Soon!
            </p>
            <p className="text-muted-foreground">{PAGE_CONTENT.NO_PROJECTS}</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cosmic-card group h-full border-2 border-border hover:border-primary hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] overflow-hidden relative"
              >
                <CardHeader className="relative">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="hover:underline"
                      >
                        {project.title}
                      </Link>
                    </CardTitle>
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        STATUS_BADGE_STYLES[project.status] ||
                        STATUS_BADGE_STYLES.DRAFT
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2.5 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-full border border-border"
                      >
                        {tag.label}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    {project.liveUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                        asChild
                      >
                        <Link
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          {PROJECT_BUTTON_LABELS.LIVE_DEMO}
                        </Link>
                      </Button>
                    )}
                    {project.githubUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground transition-all"
                        asChild
                      >
                        <Link
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github className="w-4 h-4 mr-1" />
                          {PROJECT_BUTTON_LABELS.VIEW_CODE}
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="relative bg-card text-foreground overflow-hidden border-t border-border"
        role="contentinfo"
      >

        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Contact Information */}
            <div>
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {PAGE_CONTENT.CONTACT_INFO}
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
                {PAGE_CONTENT.CONNECT_WITH_ME}
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
                {PAGE_CONTENT.QUICK_LINKS}
              </h3>
              <div className="space-y-4">
                <Link
                  href="/projects"
                  className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
                >
                  {PAGE_CONTENT.VIEW_MY_PROJECTS}
                </Link>
                <Link
                  href="/blog"
                  className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-200"
                >
                  {PAGE_CONTENT.READ_MY_BLOG}
                </Link>
                <Link
                  href={`mailto:${CONTACT.email}`}
                  className="inline-block mt-2"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-2 border-white/30 bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {PAGE_CONTENT.GET_IN_TOUCH}
                    <Mail className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} {INFORMATION.name}.{' '}
                {PAGE_CONTENT.ALL_RIGHTS_RESERVED}
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
