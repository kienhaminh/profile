'use client';

import { useState, useEffect } from 'react';
import { HashtagSelect } from './HashtagSelect';
import { TopicSelect } from './TopicSelect';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import type { CreateBlogRequest } from '@/lib/validation';

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

// Type that matches the form data but allows optional fields for editing
type BlogFormEditData = Partial<CreateBlogRequest> & {
  topicIds?: string[];
  hashtagIds?: string[];
};

interface BlogFormProps {
  initialData?: BlogFormEditData;
  onSubmit: (data: BlogFormData) => Promise<void>;
  onCancel?: () => void;
  mode: 'create' | 'edit';
}

export function BlogForm({
  initialData,
  onSubmit,
  onCancel,
  mode,
}: BlogFormProps) {
  const [formData, setFormData] = useState<BlogFormData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    status: initialData?.status || 'DRAFT',
    publishDate: initialData?.publishDate || '',
    excerpt: initialData?.excerpt || '',
    readTime: initialData?.readTime || undefined,
    coverImage: initialData?.coverImage || '',
    topicIds: initialData?.topicIds || [],
    hashtagIds: initialData?.hashtagIds || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initialData?.slug && formData.title) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, initialData?.slug]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number' ? (value === '' ? undefined : Number(value)) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    if (
      formData.coverImage &&
      !/^https?:\/\/[^\s]+\.[^\s]+/.test(formData.coverImage)
    ) {
      newErrors.coverImage = 'Cover image must be a valid URL';
    }

    if (
      formData.readTime &&
      (formData.readTime <= 0 || !Number.isInteger(formData.readTime))
    ) {
      newErrors.readTime = 'Read time must be a positive integer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : 'Failed to save blog post',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter blog title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-2">
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="blog-post-slug"
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
        )}
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium mb-2">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Brief summary of the blog post"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          value={formData.content}
          onChange={handleContentChange}
          placeholder="Write your blog content here..."
          className="min-h-[400px]"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-2">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>

        <div>
          <label htmlFor="readTime" className="block text-sm font-medium mb-2">
            Read Time (minutes)
          </label>
          <input
            type="number"
            id="readTime"
            name="readTime"
            value={formData.readTime || ''}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="5"
          />
          {errors.readTime && (
            <p className="mt-1 text-sm text-red-600">{errors.readTime}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium mb-2">
          Cover Image URL
        </label>
        <input
          type="url"
          id="coverImage"
          name="coverImage"
          value={formData.coverImage}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
        />
        {errors.coverImage && (
          <p className="mt-1 text-sm text-red-600">{errors.coverImage}</p>
        )}
      </div>

      <div>
        <label htmlFor="publishDate" className="block text-sm font-medium mb-2">
          Publish Date
        </label>
        <input
          type="datetime-local"
          id="publishDate"
          name="publishDate"
          value={formData.publishDate}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Topics</label>
        <TopicSelect
          value={formData.topicIds}
          onChange={(topicIds) =>
            setFormData((prev) => ({ ...prev, topicIds }))
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Hashtags</label>
        <HashtagSelect
          value={formData.hashtagIds}
          onChange={(hashtagIds) =>
            setFormData((prev) => ({ ...prev, hashtagIds }))
          }
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? 'Saving...'
            : mode === 'create'
              ? 'Create Blog Post'
              : 'Update Blog Post'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
