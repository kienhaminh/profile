'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { INFORMATION } from '@/constants/information';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  githubUrl?: string | null;
  liveUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isOngoing: boolean;
  images: string[];
  technologies: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: string;
  }>;
  hashtags: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: string;
  }>;
}

export default function ProjectDetail() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        } else if (response.status === 404) {
          setError('Project not found');
        } else {
          setError('Failed to load project');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Project not found'}
            </h1>
            <Link href="/projects">
              <Button variant="outline">← Back to Projects</Button>
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
              <Link href="/projects" className="text-gray-900 font-medium">
                Projects
              </Link>
              <Link href="/blog" className="text-gray-600 hover:text-gray-900">
                Blog
              </Link>
              <Link
                href={`mailto:${INFORMATION.email}`}
                className="text-gray-600 hover:text-gray-900"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Project Header */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/projects">
              <Button variant="outline" size="sm" className="mb-6">
                ← Back to Projects
              </Button>
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  {project.title}
                </h1>
                <div className="mt-4">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      project.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {project.status}
                  </span>
                  {project.isOngoing && (
                    <span className="ml-2 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                      Ongoing
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                {project.liveUrl && (
                  <Button variant="outline" asChild>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Live Demo
                    </a>
                  </Button>
                )}
                {project.githubUrl && (
                  <Button variant="outline" asChild>
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Code
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Project Content */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Project Images */}
                  {project.images && project.images.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Project Gallery
                      </h3>
                      <div className="grid gap-4">
                        {project.images.map((image, index) => (
                          <Image
                            key={index}
                            src={image}
                            alt={`${project.title} screenshot ${index + 1}`}
                            className="rounded-lg shadow-md w-full"
                            width={800}
                            height={600}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Technologies Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech.id}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hashtags */}
              {project.hashtags && project.hashtags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.hashtags.map((hashtag) => (
                        <span
                          key={hashtag.id}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                        >
                          #{hashtag.name}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Project Dates */}
              {(project.startDate || project.endDate) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      {project.startDate && (
                        <p>
                          <span className="font-medium">Started:</span>{' '}
                          {new Date(project.startDate).toLocaleDateString()}
                        </p>
                      )}
                      {project.endDate && (
                        <p>
                          <span className="font-medium">Completed:</span>{' '}
                          {new Date(project.endDate).toLocaleDateString()}
                        </p>
                      )}
                      {!project.endDate && project.isOngoing && (
                        <p className="text-blue-600 font-medium">
                          Currently ongoing
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
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
              <Link href={`mailto:${INFORMATION.email}`}>
                <Button
                  variant="outline"
                  className="text-white border-white bg-transparent hover:bg-white hover:text-gray-900"
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
