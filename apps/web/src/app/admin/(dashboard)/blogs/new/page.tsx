'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlogForm } from '@/components/admin/BlogForm';
import type { PostStatus } from '@/types/enums';

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  publishDate?: string;
  excerpt?: string;
  readTime?: number;
  coverImage?: string;
  tagIds: string[];
}

export default function NewBlogPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: BlogFormData) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          publishDate: data.publishDate
            ? (() => {
                const date = new Date(data.publishDate);
                if (isNaN(date.getTime())) {
                  throw new Error('Invalid publish date provided');
                }
                return date.toISOString();
              })()
            : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create blog post');
      }

      router.push('/admin/blogs');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create blog post. Please try again.';
      setError(errorMessage);
      setIsSaving(false);
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Blog Post</h1>
        <p className="text-gray-600">
          Fill in the details below to create a new blog post
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      <div className="bg-white rounded-lg shadow p-6 relative">
        {isSaving && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="text-sm text-gray-600">Creating blog post...</p>
            </div>
          </div>
        )}
        <BlogForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/blogs')}
        />
      </div>
    </div>
  );
}
