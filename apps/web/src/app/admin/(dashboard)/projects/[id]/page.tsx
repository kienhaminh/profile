'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { authFetch } from '@/lib/auth-client';
import type { ProjectStatus } from '@/types/enums';

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
  technologyIds: string[];
  hashtagIds: string[];
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
  technologies: Array<{ id: string }>;
  hashtags: Array<{ id: string }>;
}

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { id } = await params;
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error('Failed to fetch project');

      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      // Validate and process dates before making the request
      const processedData = { ...data };

      // Validate startDate
      if (data.startDate) {
        const startDateObj = new Date(data.startDate);
        if (isNaN(startDateObj.getTime())) {
          throw new Error('Invalid start date provided');
        }
        processedData.startDate = startDateObj.toISOString();
      } else {
        processedData.startDate = null;
      }

      // Validate endDate
      if (data.endDate) {
        const endDateObj = new Date(data.endDate);
        if (isNaN(endDateObj.getTime())) {
          throw new Error('Invalid end date provided');
        }
        processedData.endDate = endDateObj.toISOString();
      } else {
        processedData.endDate = null;
      }

      // Validate date range
      if (processedData.startDate && processedData.endDate) {
        const start = new Date(processedData.startDate);
        const end = new Date(processedData.endDate);
        if (end < start) {
          throw new Error('End date cannot be before start date');
        }
      }

      const { id } = await params;
      const response = await authFetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update project';
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          // If response.json() fails, use the status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Only navigate on successful response
      router.push('/admin/projects');
    } catch (error) {
      // Re-throw with a clear error message for the form to handle
      throw new Error(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while updating the project'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error || 'Project not found'}</p>
        </div>
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
    technologyIds: project.technologies?.map((t) => t.id) || [],
    hashtagIds: project.hashtags?.map((h) => h.id) || [],
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Project</h1>
        <p className="text-gray-600">Update the details of your project</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ProjectForm
          mode="edit"
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/projects')}
        />
      </div>
    </div>
  );
}
