'use client';

import { useState, useEffect } from 'react';
import { TagSelect } from './TagSelect';
import type { CreateProjectRequest } from '@/lib/validation';
import { PROJECT_STATUS, type ProjectStatus } from '@/types/enums';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Trash2,
  Plus,
  CalendarIcon,
  Github,
  Globe,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'slug') setIsSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAddImage = () => {
    const trimmedInput = imageInput.trim();
    if (!trimmedInput) return;

    try {
      new URL(trimmedInput);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, trimmedInput],
      }));
      setImageInput('');
      setErrors((prev) => ({ ...prev, images: '' }));
    } catch {
      setErrors((prev) => ({ ...prev, images: 'Please enter a valid URL' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.description.trim())
      newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

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
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors.submit && (
        <Alert variant="destructive">
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="title" className="text-foreground font-semibold">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Portfolio Website"
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="slug" className="text-foreground font-semibold">
            Slug <span className="text-destructive">*</span>
          </Label>
          <Input
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="portfolio-website"
            className={errors.slug ? 'border-destructive' : ''}
          />
          {errors.slug && (
            <p className="text-xs text-destructive">{errors.slug}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label
            htmlFor="description"
            className="text-foreground font-semibold"
          >
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of your project..."
            className={`min-h-[150px] ${errors.description ? 'border-destructive' : ''}`}
          />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label htmlFor="status" className="text-foreground font-semibold">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  status: value as ProjectStatus,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PROJECT_STATUS.DRAFT}>Draft</SelectItem>
                <SelectItem value={PROJECT_STATUS.PUBLISHED}>
                  Published
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-8">
            <Checkbox
              id="isOngoing"
              checked={formData.isOngoing}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isOngoing: !!checked }))
              }
            />
            <Label
              htmlFor="isOngoing"
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Ongoing Project
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label
              htmlFor="startDate"
              className="text-foreground font-semibold flex items-center gap-2"
            >
              <CalendarIcon size={14} /> Start Date
            </Label>
            <Input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="endDate"
              className="text-foreground font-semibold flex items-center gap-2"
            >
              <CalendarIcon size={14} /> End Date
            </Label>
            <Input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              disabled={formData.isOngoing}
              className={
                formData.isOngoing ? 'opacity-50 cursor-not-allowed' : ''
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label
              htmlFor="githubUrl"
              className="text-foreground font-semibold flex items-center gap-2"
            >
              <Github size={14} /> GitHub URL
            </Label>
            <Input
              type="url"
              id="githubUrl"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/..."
            />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="liveUrl"
              className="text-foreground font-semibold flex items-center gap-2"
            >
              <Globe size={14} /> Live URL
            </Label>
            <Input
              type="url"
              id="liveUrl"
              name="liveUrl"
              value={formData.liveUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label className="text-foreground font-semibold flex items-center gap-2">
            <ImageIcon size={14} /> Images
          </Label>
          <div className="flex gap-2">
            <Input
              type="url"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              placeholder="Add image URL..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddImage();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={handleAddImage}>
              <Plus size={16} className="mr-2" /> Add
            </Button>
          </div>
          {errors.images && (
            <p className="text-xs text-destructive">{errors.images}</p>
          )}

          {formData.images.length > 0 && (
            <div className="grid gap-2 mt-2">
              {formData.images.map((image, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/50 border border-border"
                >
                  <span className="text-xs truncate max-w-[400px] text-muted-foreground">
                    {image}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        images: p.images.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <Label className="text-foreground font-semibold">Tags</Label>
          <TagSelect
            value={formData.tagIds}
            onChange={(tagIds) => setFormData((prev) => ({ ...prev, tagIds }))}
            placeholder="Search or create tags..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border">
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
        <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : mode === 'create' ? (
            'Create Project'
          ) : (
            'Update Project'
          )}
        </Button>
      </div>
    </form>
  );
}
