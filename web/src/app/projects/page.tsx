import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Projects() {
  const projects = [
    {
      id: 1,
      title: 'AI-Powered Portfolio',
      description:
        'A modern portfolio website built with Next.js, featuring AI-generated content and analytics.',
      technologies: ['Next.js', 'TypeScript', 'AI', 'PostgreSQL'],
      status: 'Completed',
      links: {
        live: '#',
        repo: '#',
      },
    },
    {
      id: 2,
      title: 'Machine Learning API',
      description:
        'RESTful API for machine learning model inference with real-time predictions and monitoring.',
      technologies: ['Python', 'FastAPI', 'ML', 'Docker'],
      status: 'In Progress',
      links: {
        live: '#',
        repo: '#',
      },
    },
    {
      id: 3,
      title: 'Real-time Chat Application',
      description:
        'WebSocket-based chat application with real-time messaging and user presence.',
      technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB'],
      status: 'Completed',
      links: {
        live: '#',
        repo: '#',
      },
    },
  ];

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
            <h1 className="text-4xl font-bold text-gray-900">My Projects</h1>
            <p className="mt-4 text-lg text-gray-600">
              A collection of my recent work and side projects
            </p>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id} className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      project.status === 'Completed'
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
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={project.links.live}>Live Demo</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={project.links.repo}>View Code</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects to display yet.</p>
            <div className="mt-4">
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
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
