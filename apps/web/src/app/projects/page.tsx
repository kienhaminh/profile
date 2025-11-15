import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllProjects } from '@/services/projects';
import {
  PROJECT_STATUS_FILTERS,
  STATUS_BADGE_STYLES,
  PROJECT_BUTTON_LABELS,
  PAGE_CONTENT,
} from '@/constants/projects';
import { ExternalLink, Github, Rocket } from 'lucide-react';
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
          <div className="text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/20 shadow-xl dark:shadow-primary/30 hover:scale-110 transition-all duration-300 hover:shadow-2xl dark:hover:shadow-primary/50 group">
                <Rocket className="w-12 h-12 text-primary animate-pulse group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold">
              <span className="block text-foreground">{PAGE_CONTENT.TITLE}</span>
              <span className="block text-primary text-glow bg-clip-text">
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
            {projects.map((project, index) => (
              <Card
                key={project.id}
                className="cosmic-card group h-full border-2 border-border hover:border-primary overflow-hidden relative"
                style={{ animationDelay: `${index * 100}ms` }}
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
    </div>
  );
}
