import Link from 'next/link';
import { Metadata } from 'next';
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
import type { Project } from '@/types/project';

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
  let projects: Project[] = [];
  try {
    const response = await getAllProjects(PROJECT_STATUS_FILTERS.PUBLISHED);
    projects = response.data;
  } catch (error) {
    console.warn('Failed to fetch projects:', error);
    // Return empty array if database is not available during build
  }

  return (
    <div className="min-h-screen bg-background pt-28">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-3">
          {PAGE_CONTENT.TITLE}
        </h1>
        <p className="text-muted-foreground">
          {PAGE_CONTENT.SUBTITLE}
        </p>
      </div>

      {/* Projects Grid */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        {projects.length === 0 ? (
          <div className="text-center py-16 border-t border-border">
            <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-1">Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              {PAGE_CONTENT.NO_PROJECTS}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="group border border-border hover:border-primary/50 bg-card/30 hover:bg-card/60 overflow-hidden transition-all duration-300"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-medium group-hover:text-primary transition-colors">
                      <Link href={`/projects/${project.slug}`}>
                        {project.title}
                      </Link>
                    </CardTitle>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-medium shrink-0 ${
                        STATUS_BADGE_STYLES[project.status] ||
                        STATUS_BADGE_STYLES.DRAFT
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>

                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 text-xs bg-muted/50 text-muted-foreground rounded-md"
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    {project.liveUrl && (
                      <Link
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {PROJECT_BUTTON_LABELS.LIVE_DEMO}
                      </Link>
                    )}
                    {project.githubUrl && (
                      <Link
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        {PROJECT_BUTTON_LABELS.VIEW_CODE}
                      </Link>
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
