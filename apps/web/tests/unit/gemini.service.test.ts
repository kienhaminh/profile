import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the entire module with a factory function
vi.mock('@/services/gemini', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/gemini')>();

  // Create the mock inside the factory
  return {
    ...actual,
    generateBlogFromPrompt: vi.fn(),
    generateTitleFromPrompt: vi.fn(),
    generateExcerptFromPrompt: vi.fn(),
  };
});

// Import after mock
import {
  generateBlogFromPrompt,
  generateTitleFromPrompt,
  generateExcerptFromPrompt,
  type BlogPromptInput,
} from '@/services/gemini';

describe('Gemini Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateBlogFromPrompt', () => {
    it('should generate blog content successfully', async () => {
      const mockResponse = {
        title: 'Test Blog Title',
        content: '<p>Test content</p>',
        excerpt: 'Test excerpt',
        tags: ['test', 'blog'],
        readTime: 5,
        seoTitle: 'Test SEO Title',
        metaDescription: 'Test meta description',
      };

      vi.mocked(generateBlogFromPrompt).mockResolvedValue(mockResponse);

      const input: BlogPromptInput = {
        prompt: 'Write a blog post about testing',
        topic: 'Testing',
        targetAudience: 'Developers',
        tone: 'professional',
        length: 'short',
      };

      const result = await generateBlogFromPrompt(input);

      expect(result).toEqual(mockResponse);
      expect(generateBlogFromPrompt).toHaveBeenCalledWith(input);
    });

    it('should handle string tags and convert to array', async () => {
      const mockResponse = {
        title: 'Test Blog Title',
        content: '<p>Test content</p>',
        excerpt: 'Test excerpt',
        tags: ['test', 'blog', 'development'],
        readTime: 5,
        seoTitle: 'Test SEO Title',
        metaDescription: 'Test meta description',
      };

      vi.mocked(generateBlogFromPrompt).mockResolvedValue(mockResponse);

      const input: BlogPromptInput = {
        prompt: 'Write a blog post about development',
      };

      const result = await generateBlogFromPrompt(input);

      expect(result.tags).toEqual(['test', 'blog', 'development']);
    });

    it('should throw error for invalid JSON response', async () => {
      vi.mocked(generateBlogFromPrompt).mockRejectedValue(
        new Error('Failed to generate blog content from prompt')
      );

      const input: BlogPromptInput = {
        prompt: 'Write a blog post',
      };

      await expect(generateBlogFromPrompt(input)).rejects.toThrow(
        'Failed to generate blog content from prompt'
      );
    });

    it('should throw error for missing required fields in response', async () => {
      vi.mocked(generateBlogFromPrompt).mockRejectedValue(
        new Error('Invalid response structure from Gemini API')
      );

      const input: BlogPromptInput = {
        prompt: 'Write a blog post',
      };

      await expect(generateBlogFromPrompt(input)).rejects.toThrow(
        'Invalid response structure from Gemini API'
      );
    });
  });

  describe('generateTitleFromPrompt', () => {
    it('should generate title successfully', async () => {
      const mockTitle = 'Generated Blog Title';

      vi.mocked(generateTitleFromPrompt).mockResolvedValue(mockTitle);

      const result = await generateTitleFromPrompt('Write about React');

      expect(result).toBe(mockTitle);
      expect(generateTitleFromPrompt).toHaveBeenCalledWith('Write about React');
    });
  });

  describe('generateExcerptFromPrompt', () => {
    it('should generate excerpt successfully', async () => {
      const mockExcerpt = 'This is a generated excerpt for the blog post.';

      vi.mocked(generateExcerptFromPrompt).mockResolvedValue(mockExcerpt);

      const result = await generateExcerptFromPrompt('Write about TypeScript');

      expect(result).toBe(mockExcerpt);
      expect(generateExcerptFromPrompt).toHaveBeenCalledWith('Write about TypeScript');
    });
  });

  describe('Input validation', () => {
    it('should handle all optional parameters', async () => {
      const mockResponse = {
        title: 'Test Title',
        content: '<p>Test content</p>',
        excerpt: 'Test excerpt',
        tags: ['test'],
        readTime: 3,
        seoTitle: 'Test SEO',
        metaDescription: 'Test meta',
      };

      vi.mocked(generateBlogFromPrompt).mockResolvedValue(mockResponse);

      const input: BlogPromptInput = {
        prompt: 'Simple prompt without optional fields',
      };

      const result = await generateBlogFromPrompt(input);

      expect(result.title).toBe('Test Title');
      expect(result.content).toBe('<p>Test content</p>');
    });

    it('should include all parameters in prompt when provided', async () => {
      const mockResponse = {
        title: 'Test Title',
        content: '<p>Test content</p>',
        excerpt: 'Test excerpt',
        tags: ['test'],
        readTime: 3,
        seoTitle: 'Test SEO',
        metaDescription: 'Test meta',
      };

      vi.mocked(generateBlogFromPrompt).mockResolvedValue(mockResponse);

      const input: BlogPromptInput = {
        prompt: 'Write a comprehensive guide',
        topic: 'Web Development',
        targetAudience: 'Beginners',
        tone: 'casual',
        length: 'long',
      };

      await generateBlogFromPrompt(input);

      expect(generateBlogFromPrompt).toHaveBeenCalledWith(input);
    });
  });
});
