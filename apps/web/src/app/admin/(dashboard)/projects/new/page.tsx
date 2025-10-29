'use client';

import { useRouter } from 'next/navigation';
import { ProjectForm } from '@/components/admin/ProjectForm';
import type { ProjectStatus } from '@/types/enums';

interface ProjectFormData {
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
  technologyIds: string[];
  hashtagIds: string[];
}

export default function NewProjectPage() {
  const router = useRouter();

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          startDate: data.startDate
            ? new Date(data.startDate).toISOString()
            : null,
          endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        }),
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: 'Failed to create project' }));
        throw new Error(error.message || 'Failed to create project');
      }

      router.push('/admin/projects');
    } catch (error) {
      console.error('Failed to create project:', error);
      // Consider adding user-facing error notification here
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
        <p className="text-gray-600">
          Fill in the details below to create a new project
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ProjectForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/projects')}
        />
      </div>
    </div>
  );
}
