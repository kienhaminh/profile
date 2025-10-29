'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { INFORMATION, CONTACT } from '@/constants/information';
import type { ProjectWithRelations } from '@/db/schema';

interface ProjectsResponse {
  data: ProjectWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function Projects() {
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/projects?status=PUBLISHED&limit=20');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const result: ProjectsResponse = await response.json();
        setProjects(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

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
              <Link href="/projects" className="text-gray-900 font-medium">
                Projects
              </Link>
              <Link href="/blog" className="text-gray-600 hover:text-gray-900">
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
            <h1 className="text-4xl font-bold text-gray-900">My Projects</h1>
            <p className="mt-4 text-lg text-gray-600">
              A collection of my recent work and side projects
            </p>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {error && (
          <Alert className="mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="break-inside-avoid mb-8">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full mb-4" />
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-14" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No projects found.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
            {projects.map((project) => (
              <Card key={project.id} className="break-inside-avoid mb-8">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {project.title}
                      </Link>
                    </CardTitle>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        project.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{project.description}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.technologies?.map(
                      (tech: ProjectWithRelations['technologies'][number]) => (
                        <span
                          key={tech.id}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                        >
                          {tech.name}
                        </span>
                      )
                    )}
                  </div>

                  <div className="flex gap-2">
                    {project.liveUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Live Demo
                        </Link>
                      </Button>
                    )}
                    {project.githubUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Code
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
