'use client';

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

export default function NewProjectPage() {
  const router = useRouter();

  const handleSubmit = async (data: ProjectFormData) => {
    const token = localStorage.getItem('admin_token');
    
    const response = await fetch('/api/projects', {
      method: 'POST',
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
      throw new Error(error.message || 'Failed to create project');
    }

    router.push('/admin/projects');
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
