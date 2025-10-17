'use client';

import { useRouter } from 'next/navigation';
import { BlogForm } from '@/components/admin/BlogForm';

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishDate?: string;
  excerpt?: string;
  readTime?: number;
  coverImage?: string;
  topicIds: string[];
  hashtagIds: string[];
}

export default function NewBlogPage() {
  const router = useRouter();

  const handleSubmit = async (data: BlogFormData) => {
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
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Blog Post</h1>
        <p className="text-gray-600">
          Fill in the details below to create a new blog post
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <BlogForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/blogs')}
        />
      </div>
    </div>
  );
}
