'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TagSelect } from './TagSelect';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { createBlogSchema } from '@/lib/validation';
import { POST_STATUS, type PostStatus } from '@/types/enums';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Wand2, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

// Define the schema for the form, making authorId optional
const formSchema = createBlogSchema.extend({
  authorId: z.string().uuid().optional(),
});

export type BlogFormData = z.infer<typeof formSchema>;

interface BlogFormProps {
  initialData?: Partial<BlogFormData>;
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
}: BlogFormProps): React.ReactElement {
  const form = useForm<BlogFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      content: initialData?.content || '',
      status: (initialData?.status as PostStatus) || POST_STATUS.DRAFT,
      publishDate: initialData?.publishDate || '',
      excerpt: initialData?.excerpt || '',
      readTime: initialData?.readTime || undefined,
      coverImage: initialData?.coverImage || '',
      tagIds: initialData?.tagIds || [],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Auto-generate slug from title
  const watchedTitle = form.watch('title');
  useEffect(() => {
    if (!initialData?.slug && watchedTitle) {
      const generatedSlug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-+|-+$/g, '');
      form.setValue('slug', generatedSlug, { shouldValidate: true });
    }
  }, [watchedTitle, initialData?.slug, form]);

  const handlePromptChange = (field: keyof PromptData, value: string): void => {
    setPromptData((prev) => ({ ...prev, [field]: value }));
  };

  const generateContentFromPrompt = async () => {
    if (!promptData.prompt.trim()) {
      form.setError('root', { message: 'Prompt is required' });
      return;
    }

    setIsGenerating(true);

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
        throw new Error('Failed to generate content');
      }

      const { data } = await response.json();

      // Update form data with generated content
      if (data.title) form.setValue('title', data.title);
      if (data.content) form.setValue('content', data.content);
      if (data.excerpt) form.setValue('excerpt', data.excerpt);
      if (data.readTime) form.setValue('readTime', data.readTime);

      // Switch to manual mode after generation
      setIsPromptMode(false);
    } catch (error) {
      form.setError('root', {
        message:
          error instanceof Error ? error.message : 'Failed to generate content',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePromptMode = (): void => {
    setIsPromptMode((prev) => !prev);
    form.clearErrors();
  };

  const onFormSubmit = async (data: BlogFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      form.setError('root', {
        message:
          error instanceof Error ? error.message : 'Failed to save blog post',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8">
        {form.formState.errors.root && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex justify-center">
          <div className="inline-flex items-center p-1 bg-muted rounded-lg border border-border">
            <button
              type="button"
              onClick={() => isPromptMode && togglePromptMode()}
              className={`flex items-center gap-2 py-2 px-6 rounded-md text-sm font-medium transition-colors ${
                !isPromptMode
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Manual</span>
            </button>
            <button
              type="button"
              onClick={() => !isPromptMode && togglePromptMode()}
              className={`flex items-center gap-2 py-2 px-6 rounded-md text-sm font-medium transition-colors ${
                isPromptMode
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Wand2 className="h-4 w-4" />
              <span>Helper</span>
            </button>
          </div>
        </div>

        {isPromptMode ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-xl">AI Content Generator</CardTitle>
                <CardDescription>
                  Describe your topic and let AI draft the content for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-2">
                  <FormLabel className="text-sm font-semibold">
                    What is this post about?{' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Textarea
                    value={promptData.prompt}
                    onChange={(e) =>
                      handlePromptChange('prompt', e.target.value)
                    }
                    rows={4}
                    className="resize-none"
                    placeholder="e.g. A guide to CSS Grid layout for beginners..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormLabel>Topic</FormLabel>
                    <Input
                      value={promptData.topic}
                      onChange={(e) =>
                        handlePromptChange('topic', e.target.value)
                      }
                      placeholder="e.g. Web Design"
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Target Audience</FormLabel>
                    <Input
                      value={promptData.targetAudience}
                      onChange={(e) =>
                        handlePromptChange('targetAudience', e.target.value)
                      }
                      placeholder="e.g. Developers"
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Tone</FormLabel>
                    <Select
                      value={promptData.tone}
                      onValueChange={(v) => handlePromptChange('tone', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">
                          Professional
                        </SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="conversational">
                          Conversational
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <FormLabel>Length</FormLabel>
                    <Select
                      value={promptData.length}
                      onValueChange={(v) => handlePromptChange('length', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={generateContentFromPrompt}
                  disabled={isGenerating}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Draft
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider font-semibold">
                        Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="text-2xl font-bold py-6 px-4 border-transparent hover:border-border focus:border-border bg-transparent shadow-none rounded-none border-b transition-colors"
                          placeholder="Enter your title..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="border border-border/40 rounded-lg overflow-hidden min-h-[500px] bg-background">
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Tell your story..."
                            className="min-h-[500px] prose-lg"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Right Column: Meta & Settings */}
            <div className="space-y-6">
              <Card className="border-border/60 bg-card/50">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-base font-medium">
                    Publishing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={POST_STATUS.DRAFT}>
                              Draft
                            </SelectItem>
                            <SelectItem value={POST_STATUS.PUBLISHED}>
                              Published
                            </SelectItem>
                            <SelectItem value={POST_STATUS.ARCHIVED}>
                              Archived
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="publishDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Publish Date</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="datetime-local"
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : mode === 'create' ? (
                        'Publish Post'
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/50">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-base font-medium">
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="url-slug"
                            className="font-mono text-xs"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exerpt</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ''}
                            rows={3}
                            placeholder="Short summary..."
                            className="resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="readTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Read Time (min)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            value={field.value || ''}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ''
                                  ? undefined
                                  : Number(e.target.value)
                              )
                            }
                            min="1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/50">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-base font-medium">
                    Media & Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="url"
                            value={field.value || ''}
                            placeholder="https://..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tagIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <TagSelect
                            value={field.value || []}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}
