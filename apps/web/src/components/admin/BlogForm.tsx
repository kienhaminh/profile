'use client';

import { useState, useEffect } from 'react';
import { TagSelect } from './TagSelect';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import type { CreateBlogRequest } from '@/lib/validation';
import { POST_STATUS, type PostStatus } from '@/types/enums';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, FileText } from 'lucide-react';

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

// Type that matches the form data but allows optional fields for editing
type BlogFormEditData = Partial<CreateBlogRequest> & {
  tagIds?: string[];
};

interface BlogFormProps {
  initialData?: BlogFormEditData;
  onSubmit: (data: BlogFormData) => Promise<void>;
  onCancel?: () => void;
  mode: 'create' | 'edit';
}

interface PromptData {
  prompt: string;
  topic: string;
  targetAudience: string;
  tone: 'professional' | 'casual' | 'technical' | 'conversational';
  length: 'short' | 'medium' | 'long';
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
    status: (initialData?.status as PostStatus) || POST_STATUS.DRAFT,
    publishDate: initialData?.publishDate || '',
    excerpt: initialData?.excerpt || '',
    readTime: initialData?.readTime || undefined,
    coverImage: initialData?.coverImage || '',
    tagIds: initialData?.tagIds || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prompt mode state
  const [isPromptMode, setIsPromptMode] = useState(false);
  const [promptData, setPromptData] = useState<PromptData>({
    prompt: '',
    topic: '',
    targetAudience: '',
    tone: 'professional',
    length: 'medium',
  });
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handlePromptChange = (field: keyof PromptData, value: string) => {
    setPromptData((prev) => ({ ...prev, [field]: value }));
  };

  const generateContentFromPrompt = async () => {
    if (!promptData.prompt.trim()) {
      setErrors({ prompt: 'Prompt is required' });
      return;
    }

    setIsGenerating(true);
    setErrors({});

    try {
      const response = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(promptData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate content';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.message || error.error || errorMessage;
          } else {
            // If not JSON, try to get text content
            const textContent = await response.text();
            errorMessage = textContent || errorMessage;
          }
        } catch {
          // If parsing fails, use default error message
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Parse JSON response with error handling
      let responseData;
      try {
        responseData = await response.json();
      } catch {
        throw new Error('Invalid response format from server');
      }

      const { data } = responseData;

      // Update form data with generated content
      setFormData((prev) => ({
        ...prev,
        title: data.title || prev.title,
        content: data.content || prev.content,
        excerpt: data.excerpt || prev.excerpt,
        readTime: data.readTime || prev.readTime,
      }));

      // Switch to manual mode after generation
      setIsPromptMode(false);
    } catch (error) {
      setErrors({
        prompt:
          error instanceof Error ? error.message : 'Failed to generate content',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePromptMode = () => {
    setIsPromptMode((prev) => !prev);
    if (!isPromptMode) {
      // Switching to prompt mode - clear any existing errors
      setErrors({});
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (isPromptMode) {
      if (!promptData.prompt.trim()) {
        newErrors.prompt = 'Prompt is required';
      } else if (promptData.prompt.length < 10) {
        newErrors.prompt = 'Prompt must be at least 10 characters long';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

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

    // If in prompt mode, generate content first
    if (isPromptMode) {
      await generateContentFromPrompt();
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
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md">
          <p className="text-sm text-destructive">{errors.submit}</p>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-3">
          <FileText
            className={`h-5 w-5 ${!isPromptMode ? 'text-primary' : 'text-muted-foreground'}`}
          />
          <span
            className={`font-medium ${!isPromptMode ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Manual Entry
          </span>
        </div>
        <Button
          type="button"
          variant={isPromptMode ? 'default' : 'outline'}
          size="sm"
          onClick={togglePromptMode}
          className="flex items-center space-x-2"
        >
          <Wand2 className="h-4 w-4" />
          <span>AI Generate</span>
        </Button>
      </div>

      {isPromptMode ? (
        /* Prompt Mode Form */
        <div className="space-y-6">
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Prompt <span className="text-destructive">*</span>
            </label>
            <textarea
              id="prompt"
              value={promptData.prompt}
              onChange={(e) => handlePromptChange('prompt', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Describe what you want the blog post to be about. Be specific about the topic, key points to cover, and the desired outcome."
            />
            {errors.prompt && (
              <p className="mt-1 text-sm text-destructive">{errors.prompt}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="topic"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Topic (Optional)
              </label>
              <input
                type="text"
                id="topic"
                value={promptData.topic}
                onChange={(e) => handlePromptChange('topic', e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g., Web Development, Machine Learning"
              />
            </div>

            <div>
              <label
                htmlFor="targetAudience"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Target Audience (Optional)
              </label>
              <input
                type="text"
                id="targetAudience"
                value={promptData.targetAudience}
                onChange={(e) =>
                  handlePromptChange('targetAudience', e.target.value)
                }
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g., Developers, Beginners, Business Owners"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="tone"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Tone
              </label>
              <select
                id="tone"
                value={promptData.tone}
                onChange={(e) =>
                  handlePromptChange(
                    'tone',
                    e.target.value as PromptData['tone']
                  )
                }
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="technical">Technical</option>
                <option value="conversational">Conversational</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="length"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Length
              </label>
              <select
                id="length"
                value={promptData.length}
                onChange={(e) =>
                  handlePromptChange(
                    'length',
                    e.target.value as PromptData['length']
                  )
                }
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="short">Short (800-1200 words)</option>
                <option value="medium">Medium (1500-2500 words)</option>
                <option value="long">Long (3000+ words)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isGenerating}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              <span>{isGenerating ? 'Generating...' : 'Generate Content'}</span>
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isGenerating}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter blog title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Slug <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="blog-post-slug"
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-destructive">{errors.slug}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="excerpt"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Brief summary of the blog post"
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Content <span className="text-destructive">*</span>
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Write your blog content here..."
              className="min-h-[400px]"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-destructive">{errors.content}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value={POST_STATUS.DRAFT}>Draft</option>
                <option value={POST_STATUS.PUBLISHED}>Published</option>
                <option value={POST_STATUS.ARCHIVED}>Archived</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="readTime"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Read Time (minutes)
              </label>
              <input
                type="number"
                id="readTime"
                name="readTime"
                value={formData.readTime || ''}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="5"
              />
              {errors.readTime && (
                <p className="mt-1 text-sm text-destructive">{errors.readTime}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="coverImage"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Cover Image URL
            </label>
            <input
              type="url"
              id="coverImage"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="https://example.com/image.jpg"
            />
            {errors.coverImage && (
              <p className="mt-1 text-sm text-destructive">{errors.coverImage}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="publishDate"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Publish Date
            </label>
            <input
              type="datetime-local"
              id="publishDate"
              name="publishDate"
              value={formData.publishDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tags
            </label>
            <TagSelect
              value={formData.tagIds}
              onChange={(tagIds) =>
                setFormData((prev) => ({ ...prev, tagIds }))
              }
              placeholder="Search or create tags for your blog post..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : mode === 'create' ? (
                'Create Blog Post'
              ) : (
                'Update Blog Post'
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </>
      )}
    </form>
  );
}
