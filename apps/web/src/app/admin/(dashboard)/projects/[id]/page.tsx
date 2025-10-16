'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectForm } from '@/components/admin/ProjectForm';

interface ProjectFormData {
  title: string;
  slug: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED';
  images: string[];
  githubUrl?: string;
  liveUrl?: string;
  startDate?: string;
  endDate?: string;
  isOngoing: boolean;
  technologyIds: string[];
  hashtagIds: string[];
}

interface ProjectData {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED';
  images: string[];
  githubUrl?: string;
  liveUrl?: string;
  startDate?: string;
  endDate?: string;
  isOngoing: boolean;
  technologies: Array<{ id: string }>;
  hashtags: Array<{ id: string }>;
}

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
  }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/projects/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      
      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: ProjectFormData) => {
    const token = localStorage.getItem('admin_token');
    
    const response = await fetch(`/api/projects/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update project');
    }

    router.push('/admin/projects');
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
