'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BlogForm } from '@/components/admin/BlogForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, FileEdit } from 'lucide-react';
import type { PostStatus } from '@/types/enums';
import type { Tag } from '@/types/tag';
import Link from 'next/link';

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

interface BlogData {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: PostStatus;
  publishDate?: string;
  excerpt?: string;
  readTime?: number;
  coverImage?: string;
  topics: Array<{ id: string }>;
  tags: Tag[];
}

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [blog, setBlog] = useState<BlogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlog();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBlog = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { id } = await params;
      const response = await fetch(`/api/blog/${id}`);
      if (!response.ok) throw new Error('Failed to fetch blog');

      const data = await response.json();
      setBlog(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: BlogFormData) => {
    setIsSaving(true);
    setError(null);
    try {
      const { id } = await params;
      const response = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          publishDate: data.publishDate
            ? new Date(data.publishDate).toISOString()
            : null,
        }),
      });

      // Parse response as JSON (this can also throw)
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        if (!response.ok) {
          throw new Error(
            `Server error (${response.status}): ${response.statusText}`
          );
        }
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(
          errorData.message || `Failed to update blog post (${response.status})`
        );
      }

      // Success - navigate to blogs list
      router.push('/admin/blogs');
    } catch (error) {
      // Handle errors and show feedback to user
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update blog post. Please try again.';
      setError(errorMessage);
      setIsSaving(false);
      throw error; // Re-throw to prevent form submission
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8 space-y-4 animate-fade-in">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-12 w-80" />
            <Skeleton className="h-5 w-96" />
          </div>

          <div className="bg-card rounded-xl shadow-lg border border-border p-8 space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8 animate-fade-in">
            <Link href="/admin/blogs">
              <Button variant="ghost" size="sm" className="mb-4 hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blogs
              </Button>
            </Link>
          </div>

          <div className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-8 shadow-lg animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {error ? 'Error Loading Blog' : 'Blog Not Found'}
                </h3>
                <p className="text-muted-foreground">
                  {error || 'The blog post you\'re looking for could not be found.'}
                </p>
                <div className="mt-4">
                  <Link href="/admin/blogs">
                    <Button
                      variant="outline"
                      className="border-destructive/30 hover:bg-destructive/10"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Return to Blogs
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initialData = {
    title: blog.title,
    slug: blog.slug,
    content: blog.content,
    status: blog.status,
    publishDate: blog.publishDate
      ? new Date(blog.publishDate).toISOString().slice(0, 16)
      : '',
    excerpt: blog.excerpt || '',
    readTime: blog.readTime,
    coverImage: blog.coverImage || '',
    tagIds: blog.tags?.map((t) => t.id) || [],
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 space-y-4 animate-fade-in">
          <Link href="/admin/blogs">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-primary/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blogs
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <FileEdit className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Edit Blog Post
              </h1>
              <p className="text-muted-foreground mt-1">
                Update the details of your blog post
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border-l-4 border-destructive rounded-r-lg shadow-sm animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-card rounded-xl shadow-lg border border-border p-8 relative animate-fade-in">
          {isSaving && (
            <div className="absolute inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center rounded-xl">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/20"></div>
                  <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary"></div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">Saving your changes...</p>
                  <p className="text-sm text-muted-foreground mt-1">This will only take a moment</p>
                </div>
              </div>
            </div>
          )}
          <BlogForm
            mode="edit"
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/admin/blogs')}
          />
        </div>
      </div>
    </div>
  );
}
