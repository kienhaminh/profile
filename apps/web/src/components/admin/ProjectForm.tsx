'use client';

import { useState, useEffect } from 'react';
import { TagSelect } from './TagSelect';
import type { CreateProjectRequest } from '@/lib/validation';
import { PROJECT_STATUS, type ProjectStatus } from '@/types/enums';

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

// Type that matches the form data but allows optional fields for editing
type ProjectFormEditData = Partial<CreateProjectRequest> & {
  tagIds?: string[];
};

interface ProjectFormProps {
  initialData?: ProjectFormEditData;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel?: () => void;
  mode: 'create' | 'edit';
}

export function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
  mode,
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    status: (initialData?.status as ProjectStatus) || PROJECT_STATUS.DRAFT,
    images: initialData?.images || [],
    githubUrl: initialData?.githubUrl || '',
    liveUrl: initialData?.liveUrl || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    isOngoing: initialData?.isOngoing || false,
    tagIds: initialData?.tagIds || [],
  });

  const [imageInput, setImageInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (!initialData?.slug && formData.title && !isSlugManuallyEdited) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .trim();
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, initialData?.slug, isSlugManuallyEdited]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name === 'slug') {
      setIsSlugManuallyEdited(true);
    }

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddImage = () => {
    const trimmedInput = imageInput.trim();

    if (!trimmedInput) {
      setErrors((prev) => ({
        ...prev,
        images: 'Please enter a valid URL',
      }));
      return;
    }

    try {
      const url = new URL(trimmedInput);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        setErrors((prev) => ({
          ...prev,
          images: 'Please enter a valid URL',
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, trimmedInput],
      }));
      setImageInput('');
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: '' }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        images: 'Please enter a valid URL',
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
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

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.githubUrl && !/^https?:\/\/.+/.test(formData.githubUrl)) {
      newErrors.githubUrl = 'GitHub URL must be a valid URL';
    }

    if (formData.liveUrl && !/^https?:\/\/.+/.test(formData.liveUrl)) {
      newErrors.liveUrl = 'Live URL must be a valid URL';
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
          error instanceof Error ? error.message : 'Failed to save project',
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
          placeholder="Enter project title"
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
          placeholder="project-slug"
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe your project"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
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
            <option value={PROJECT_STATUS.DRAFT}>Draft</option>
            <option value={PROJECT_STATUS.PUBLISHED}>Published</option>
          </select>
        </div>

        <div className="flex items-center pt-7">
          <label
            htmlFor="isOngoing"
            className="flex items-center cursor-pointer"
          >
            <input
              type="checkbox"
              id="isOngoing"
              name="isOngoing"
              checked={formData.isOngoing}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm">Ongoing Project</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-2">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-2">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            disabled={formData.isOngoing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label htmlFor="githubUrl" className="block text-sm font-medium mb-2">
          GitHub URL
        </label>
        <input
          type="url"
          id="githubUrl"
          name="githubUrl"
          value={formData.githubUrl}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://github.com/username/repo"
        />
        {errors.githubUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.githubUrl}</p>
        )}
      </div>

      <div>
        <label htmlFor="liveUrl" className="block text-sm font-medium mb-2">
          Live URL
        </label>
        <input
          type="url"
          id="liveUrl"
          name="liveUrl"
          value={formData.liveUrl}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com"
        />
        {errors.liveUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.liveUrl}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Images</label>
        <div className="flex gap-2 mb-3">
          <input
            type="url"
            value={imageInput}
            onChange={(e) => {
              setImageInput(e.target.value);
              if (errors.images) {
                setErrors((prev) => ({ ...prev, images: '' }));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddImage();
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Add
          </button>
        </div>
        {errors.images && (
          <p className="text-sm text-red-600 mb-2">{errors.images}</p>
        )}
        {formData.images.length > 0 && (
          <ul className="space-y-2">
            {formData.images.map((image, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className="text-sm truncate flex-1">{image}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="ml-2 text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <TagSelect
          value={formData.tagIds}
          onChange={(tagIds) => setFormData((prev) => ({ ...prev, tagIds }))}
          placeholder="Search or create tags for your project..."
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
              ? 'Create Project'
              : 'Update Project'}
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
