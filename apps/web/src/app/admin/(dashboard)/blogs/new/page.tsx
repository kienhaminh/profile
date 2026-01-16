'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlogForm, type BlogFormData } from '@/components/admin/BlogForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { PostStatus } from '@/types/enums';

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
    <div className="max-w-7xl mx-auto pb-20 px-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 pt-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/admin/blogs"
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              New Story
            </h1>
          </div>
          <p className="text-muted-foreground ml-10">
            Create a new blog post using AI or write it yourself.
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 p-4 bg-destructive/10 border-l-4 border-destructive rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className="relative">
        {/* Background Visuals (Static) */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/30 rounded-full blur-[80px] -z-10" />

        {isSaving && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-12 w-12">
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">
                  Publishing...
                </p>
              </div>
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
