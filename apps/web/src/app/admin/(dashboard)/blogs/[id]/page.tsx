'use client';

import { useState, useEffect } from 'react';
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
  topicIds: string[];
  hashtagIds: string[];
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
  hashtags: Array<{ id: string }>;
}

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [blog, setBlog] = useState<BlogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(true);
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
      throw error; // Re-throw to prevent form submission
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error || 'Blog not found'}</p>
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
    topicIds: blog.topics?.map((t) => t.id) || [],
    hashtagIds: blog.hashtags?.map((h) => h.id) || [],
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Blog Post</h1>
        <p className="text-gray-600">Update the details of your blog post</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <BlogForm
          mode="edit"
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/blogs')}
        />
      </div>
    </div>
  );
}
