import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateBlogFromPrompt,
  generateTitleFromPrompt,
  generateExcerptFromPrompt,
  getGeminiClient,
  type BlogPromptInput,
} from '@/services/gemini';

const mockGenerateContent = vi.fn();
const mockGetGeminiClient = vi.mocked(getGeminiClient);

beforeEach(() => {
  vi.clearAllMocks();

  // Set up the mock client
  const mockClient = {
    models: {
      generateContent: mockGenerateContent,
    },
  };

  mockGetGeminiClient.mockReturnValue(mockClient);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Gemini Service', () => {
  describe('generateBlogFromPrompt', () => {
    it('should generate blog content successfully', async () => {
      const mockResponse = {
        text: JSON.stringify({
          title: 'Test Blog Title',
          content: '<p>Test content</p>',
          excerpt: 'Test excerpt',
          tags: ['test', 'blog'],
          readTime: 5,
          seoTitle: 'Test SEO Title',
          metaDescription: 'Test meta description',
        }),
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const input: BlogPromptInput = {
        prompt: 'Write a blog post about testing',
        topic: 'Testing',
        targetAudience: 'Developers',
        tone: 'professional',
        length: 'short',
      };

      const result = await generateBlogFromPrompt(input);

      expect(result).toEqual({
        title: 'Test Blog Title',
        content: '<p>Test content</p>',
        excerpt: 'Test excerpt',
        tags: ['test', 'blog'],
        readTime: 5,
        seoTitle: 'Test SEO Title',
        metaDescription: 'Test meta description',
      });

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash-001',
        contents: expect.stringContaining('Write a blog post about testing'),
      });
    });

    it('should handle string tags and convert to array', async () => {
      const mockResponse = {
        text: JSON.stringify({
          title: 'Test Blog Title',
          content: '<p>Test content</p>',
          excerpt: 'Test excerpt',
          tags: 'test, blog, development',
          readTime: 5,
          seoTitle: 'Test SEO Title',
          metaDescription: 'Test meta description',
        }),
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const input: BlogPromptInput = {
        prompt: 'Write a blog post about development',
      };

      const result = await generateBlogFromPrompt(input);

      expect(result.tags).toEqual(['test', 'blog', 'development']);
    });

    it('should throw error for invalid JSON response', async () => {
      const mockResponse = {
        text: 'Invalid JSON response',
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const input: BlogPromptInput = {
        prompt: 'Write a blog post',
      };

      await expect(generateBlogFromPrompt(input)).rejects.toThrow(
        'Failed to generate blog content from prompt'
      );
    });

    it('should throw error for missing required fields in response', async () => {
      const mockResponse = {
        text: JSON.stringify({
          content: '<p>Test content</p>',
          // Missing title
        }),
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

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
      const mockResponse = {
        text: 'Generated Blog Title',
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await generateTitleFromPrompt('Write about React');

      expect(result).toBe('Generated Blog Title');
      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash-001',
        contents: expect.stringContaining('Write about React'),
      });
    });
  });

  describe('generateExcerptFromPrompt', () => {
    it('should generate excerpt successfully', async () => {
      const mockResponse = {
        text: 'This is a generated excerpt for the blog post.',
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await generateExcerptFromPrompt('Write about TypeScript');

      expect(result).toBe('This is a generated excerpt for the blog post.');
      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash-001',
        contents: expect.stringContaining('Write about TypeScript'),
      });
    });
  });

  describe('Input validation', () => {
    it('should handle all optional parameters', async () => {
      const mockResponse = {
        text: JSON.stringify({
          title: 'Test Title',
          content: '<p>Test content</p>',
          excerpt: 'Test excerpt',
          tags: ['test'],
          readTime: 3,
          seoTitle: 'Test SEO',
          metaDescription: 'Test meta',
        }),
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const input: BlogPromptInput = {
        prompt: 'Simple prompt without optional fields',
      };

      const result = await generateBlogFromPrompt(input);

      expect(result.title).toBe('Test Title');
      expect(result.content).toBe('<p>Test content</p>');
    });

    it('should include all parameters in prompt when provided', async () => {
      const mockResponse = {
        text: JSON.stringify({
          title: 'Test Title',
          content: '<p>Test content</p>',
          excerpt: 'Test excerpt',
          tags: ['test'],
          readTime: 3,
          seoTitle: 'Test SEO',
          metaDescription: 'Test meta',
        }),
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const input: BlogPromptInput = {
        prompt: 'Write a comprehensive guide',
        topic: 'Web Development',
        targetAudience: 'Beginners',
        tone: 'casual',
        length: 'long',
      };

      await generateBlogFromPrompt(input);

      const generatedCall = mockGenerateContent.mock.calls[0][0];
      expect(generatedCall.contents).toContain('Write a comprehensive guide');
      expect(generatedCall.contents).toContain('TOPIC: Web Development');
      expect(generatedCall.contents).toContain('TARGET_AUDIENCE: Beginners');
      expect(generatedCall.contents).toContain('TONE: casual');
      expect(generatedCall.contents).toContain('LENGTH: 3000+ words');
    });
  });
});
