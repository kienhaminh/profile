'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { authPut } from '@/lib/auth';
import type { ProjectStatus } from '@/types/enums';
import type { Tag } from '@/types/tag';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProjectFormData {
  title: string;
  slug: string;
  description: string;
  status: ProjectStatus;
  images: string[];
  githubUrl?: string;
  liveUrl?: string;
  startDate?: string | null;
  endDate?: string | null;
  isOngoing: boolean;
  tagIds: string[];
}

interface ProjectData {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: ProjectStatus;
  images: string[];
  githubUrl?: string;
  liveUrl?: string;
  startDate?: string;
  endDate?: string;
  isOngoing: boolean;
  tags: Tag[];
}

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error('Failed to fetch project');

      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      const processedData = { ...data };

      if (data.startDate) {
        processedData.startDate = new Date(data.startDate).toISOString();
      } else {
        processedData.startDate = null;
      }

      if (data.endDate) {
        processedData.endDate = new Date(data.endDate).toISOString();
      } else {
        processedData.endDate = null;
      }

      if (processedData.startDate && processedData.endDate) {
        if (
          new Date(processedData.endDate) < new Date(processedData.startDate)
        ) {
          throw new Error('End date cannot be before start date');
        }
      }

      const response = await authPut(`/api/projects/${id}`, processedData);

      if (!response.ok) {
        let errorMessage = 'Failed to update project';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      router.push('/admin/projects');
    } catch (error) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Project not found'}</AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link href="/admin/projects">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  const initialData = {
    title: project.title,
    slug: project.slug,
    description: project.description,
    status: project.status,
    images: project.images || [],
    githubUrl: project.githubUrl || '',
    liveUrl: project.liveUrl || '',
    startDate: project.startDate
      ? new Date(project.startDate).toISOString().slice(0, 10)
      : '',
    endDate: project.endDate
      ? new Date(project.endDate).toISOString().slice(0, 10)
      : '',
    isOngoing: project.isOngoing,
    tagIds: project.tags?.map((t) => t.id) || [],
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/projects">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Edit Project
          </h1>
          <p className="text-muted-foreground">
            Update the details of your project
          </p>
        </div>
      </div>

      <Card className="border-border shadow-md bg-card">
        <CardContent className="pt-6">
          <ProjectForm
            mode="edit"
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/admin/projects')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
