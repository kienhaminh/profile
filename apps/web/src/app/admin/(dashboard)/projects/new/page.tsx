'use client';

import { useRouter } from 'next/navigation';
import { ProjectForm } from '@/components/admin/ProjectForm';
import type { ProjectStatus } from '@/types/enums';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
  tagIds: string[];
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
      throw error;
    }
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
            Create New Project
          </h1>
          <p className="text-muted-foreground">
            Fill in the details below to create a new project
          </p>
        </div>
      </div>

      <Card className="border-border shadow-md bg-card">
        <CardContent className="pt-6">
          <ProjectForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={() => router.push('/admin/projects')}
          />
        </CardContent>
      </Card>
    </div>
  );
}
