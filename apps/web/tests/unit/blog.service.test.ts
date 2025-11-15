import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from '@/services/blog';
import { POST_STATUS } from '@/types/enums';

// Mock the posts service
vi.mock('@/services/posts', () => ({
  getAllPosts: vi.fn(),
  getPostById: vi.fn(),
  getPostBySlug: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
}));

// Import mocked functions after mock
import * as postsService from '@/services/posts';

describe('blog.service (wrapper)', () => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');

  const mockBlog = {
    id: 'post-1',
    slug: 'test-post',
    title: 'Test Post',
    status: POST_STATUS.PUBLISHED,
    publishDate: mockDate.toISOString(),
    content: '<p>Test content</p>',
    excerpt: 'Test excerpt',
    readTime: 5,
    coverImage: 'https://example.com/image.jpg',
    createdAt: mockDate.toISOString(),
    updatedAt: mockDate.toISOString(),
    author: {
      id: 'user-1',
      name: 'admin',
      bio: null,
      avatar: null,
      socialLinks: {},
      email: null,
    },
    tags: [
      {
        id: 'tag-1',
        slug: 'typescript',
        label: 'TypeScript',
        description: 'TypeScript language',
        createdAt: mockDate.toISOString(),
        updatedAt: mockDate.toISOString(),
      },
    ],
  };

  const mockPaginatedResult = {
    data: [mockBlog],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listBlogs', () => {
    it('should call getAllPosts and return results', async () => {
      vi.mocked(postsService.getAllPosts).mockResolvedValue(mockPaginatedResult);

      const result = await listBlogs();

      expect(postsService.getAllPosts).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should pass status filter to getAllPosts', async () => {
      vi.mocked(postsService.getAllPosts).mockResolvedValue(mockPaginatedResult);

      await listBlogs(POST_STATUS.PUBLISHED);

      expect(postsService.getAllPosts).toHaveBeenCalledWith(
        POST_STATUS.PUBLISHED,
        undefined
      );
    });

    it('should pass pagination to getAllPosts', async () => {
      vi.mocked(postsService.getAllPosts).mockResolvedValue(mockPaginatedResult);

      await listBlogs(undefined, { page: 2, limit: 5 });

      expect(postsService.getAllPosts).toHaveBeenCalledWith(undefined, {
        page: 2,
        limit: 5,
      });
    });
  });

  describe('getBlogById', () => {
    it('should call getPostById and return result', async () => {
      vi.mocked(postsService.getPostById).mockResolvedValue(mockBlog);

      const result = await getBlogById('post-1');

      expect(postsService.getPostById).toHaveBeenCalledWith('post-1');
      expect(result).toEqual(mockBlog);
    });
  });

  describe('getBlogBySlug', () => {
    it('should call getPostBySlug and return result', async () => {
      vi.mocked(postsService.getPostBySlug).mockResolvedValue(mockBlog);

      const result = await getBlogBySlug('test-post');

      expect(postsService.getPostBySlug).toHaveBeenCalledWith('test-post');
      expect(result).toEqual(mockBlog);
    });
  });

  describe('createBlog', () => {
    it('should call createPost with authorId merged', async () => {
      vi.mocked(postsService.createPost).mockResolvedValue(mockBlog);

      const input = {
        title: 'New Blog',
        slug: 'new-blog',
        content: '<p>Content</p>',
      };

      const result = await createBlog(input, 'user-1');

      expect(postsService.createPost).toHaveBeenCalledWith({
        ...input,
        authorId: 'user-1',
      });
      expect(result).toEqual(mockBlog);
    });

    it('should handle blog creation with tags', async () => {
      vi.mocked(postsService.createPost).mockResolvedValue(mockBlog);

      const input = {
        title: 'New Blog',
        slug: 'new-blog',
        content: '<p>Content</p>',
        tagIds: ['tag-1', 'tag-2'],
      };

      const result = await createBlog(input, 'user-1');

      expect(postsService.createPost).toHaveBeenCalledWith({
        ...input,
        authorId: 'user-1',
      });
      expect(result).toEqual(mockBlog);
    });
  });

  describe('updateBlog', () => {
    it('should call updatePost and return result', async () => {
      vi.mocked(postsService.updatePost).mockResolvedValue(mockBlog);

      const updateData = {
        title: 'Updated Title',
        content: '<p>Updated content</p>',
      };

      const result = await updateBlog('post-1', updateData);

      expect(postsService.updatePost).toHaveBeenCalledWith('post-1', updateData);
      expect(result).toEqual(mockBlog);
    });
  });

  describe('deleteBlog', () => {
    it('should call deletePost', async () => {
      vi.mocked(postsService.deletePost).mockResolvedValue(undefined);

      await deleteBlog('post-1');

      expect(postsService.deletePost).toHaveBeenCalledWith('post-1');
    });
  });
});
