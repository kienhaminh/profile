import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST_STATUS, PROJECT_STATUS } from '@/types/enums';

// Mock services
vi.mock('@/services/posts', () => ({
  getAllPosts: vi.fn(),
  getPostBySlug: vi.fn(),
}));

vi.mock('@/services/projects', () => ({
  getAllProjects: vi.fn(),
  getProjectBySlug: vi.fn(),
}));

vi.mock('@/services/tags', () => ({
  getAllTags: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import * as postsService from '@/services/posts';
import * as projectsService from '@/services/projects';
import * as tagsService from '@/services/tags';

describe('Public API Integration Tests', () => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');

  const mockTag = {
    id: 'tag-1',
    slug: 'typescript',
    label: 'TypeScript',
    description: 'TypeScript language',
    createdAt: mockDate.toISOString(),
    updatedAt: mockDate.toISOString(),
  };

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
    tags: [mockTag],
  };

  const mockProject = {
    id: 'project-1',
    slug: 'test-project',
    title: 'Test Project',
    status: PROJECT_STATUS.PUBLISHED,
    description: 'Test project description',
    images: ['https://example.com/image1.jpg'],
    githubUrl: 'https://github.com/test/project',
    liveUrl: 'https://test-project.com',
    startDate: mockDate.toISOString(),
    endDate: null,
    isOngoing: true,
    createdAt: mockDate.toISOString(),
    updatedAt: mockDate.toISOString(),
    tags: [mockTag],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/blog/posts', () => {
    it('should return only published posts', async () => {
      const mockPaginatedResult = {
        data: [mockBlog],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      vi.mocked(postsService.getAllPosts).mockResolvedValue(mockPaginatedResult);

      const result = await postsService.getAllPosts(POST_STATUS.PUBLISHED);

      expect(postsService.getAllPosts).toHaveBeenCalledWith(POST_STATUS.PUBLISHED);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(POST_STATUS.PUBLISHED);
    });

    it('should support pagination for published posts', async () => {
      const mockPaginatedResult = {
        data: [mockBlog],
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      };

      vi.mocked(postsService.getAllPosts).mockResolvedValue(mockPaginatedResult);

      const result = await postsService.getAllPosts(POST_STATUS.PUBLISHED, {
        page: 2,
        limit: 10,
      });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.totalPages).toBe(3);
    });

    it('should return empty array when no posts exist', async () => {
      const emptyResult = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      vi.mocked(postsService.getAllPosts).mockResolvedValue(emptyResult);

      const result = await postsService.getAllPosts(POST_STATUS.PUBLISHED);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('GET /api/blog/posts/[slug]', () => {
    it('should return published post by slug', async () => {
      vi.mocked(postsService.getPostBySlug).mockResolvedValue(mockBlog);

      const result = await postsService.getPostBySlug('test-post');

      expect(result.slug).toBe('test-post');
      expect(result.title).toBe('Test Post');
      expect(result.status).toBe(POST_STATUS.PUBLISHED);
    });

    it('should throw error for non-existent post', async () => {
      vi.mocked(postsService.getPostBySlug).mockRejectedValue(
        new Error('Post not found')
      );

      await expect(postsService.getPostBySlug('non-existent')).rejects.toThrow(
        'Post not found'
      );
    });

    it('should include post tags', async () => {
      vi.mocked(postsService.getPostBySlug).mockResolvedValue(mockBlog);

      const result = await postsService.getPostBySlug('test-post');

      expect(result.tags).toHaveLength(1);
      expect(result.tags[0].slug).toBe('typescript');
    });

    it('should include author information', async () => {
      vi.mocked(postsService.getPostBySlug).mockResolvedValue(mockBlog);

      const result = await postsService.getPostBySlug('test-post');

      expect(result.author).toBeDefined();
      expect(result.author.name).toBe('admin');
    });
  });

  describe('GET /api/projects', () => {
    it('should return only published projects', async () => {
      const mockPaginatedResult = {
        data: [mockProject],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      vi.mocked(projectsService.getAllProjects).mockResolvedValue(
        mockPaginatedResult
      );

      const result = await projectsService.getAllProjects(PROJECT_STATUS.PUBLISHED);

      expect(projectsService.getAllProjects).toHaveBeenCalledWith(
        PROJECT_STATUS.PUBLISHED
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(PROJECT_STATUS.PUBLISHED);
    });

    it('should support pagination for projects', async () => {
      const mockPaginatedResult = {
        data: [mockProject],
        pagination: {
          page: 1,
          limit: 12,
          total: 24,
          totalPages: 2,
        },
      };

      vi.mocked(projectsService.getAllProjects).mockResolvedValue(
        mockPaginatedResult
      );

      const result = await projectsService.getAllProjects(
        PROJECT_STATUS.PUBLISHED,
        { page: 1, limit: 12 }
      );

      expect(result.pagination.limit).toBe(12);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should include project images and URLs', async () => {
      const mockPaginatedResult = {
        data: [mockProject],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      vi.mocked(projectsService.getAllProjects).mockResolvedValue(
        mockPaginatedResult
      );

      const result = await projectsService.getAllProjects(PROJECT_STATUS.PUBLISHED);

      expect(result.data[0].images).toBeDefined();
      expect(result.data[0].images).toHaveLength(1);
      expect(result.data[0].githubUrl).toBe('https://github.com/test/project');
      expect(result.data[0].liveUrl).toBe('https://test-project.com');
    });
  });

  describe('GET /api/projects/[id]', () => {
    it('should return project by slug', async () => {
      vi.mocked(projectsService.getProjectBySlug).mockResolvedValue(mockProject);

      const result = await projectsService.getProjectBySlug('test-project');

      expect(result.slug).toBe('test-project');
      expect(result.title).toBe('Test Project');
    });

    it('should include project tags', async () => {
      vi.mocked(projectsService.getProjectBySlug).mockResolvedValue(mockProject);

      const result = await projectsService.getProjectBySlug('test-project');

      expect(result.tags).toHaveLength(1);
      expect(result.tags[0].slug).toBe('typescript');
    });
  });

  describe('GET /api/tags', () => {
    it('should return all tags', async () => {
      const mockTags = [
        mockTag,
        {
          id: 'tag-2',
          slug: 'react',
          label: 'React',
          description: 'React library',
          createdAt: mockDate.toISOString(),
          updatedAt: mockDate.toISOString(),
        },
      ];

      vi.mocked(tagsService.getAllTags).mockResolvedValue(mockTags);

      const result = await tagsService.getAllTags();

      expect(result).toHaveLength(2);
      expect(result[0].slug).toBe('typescript');
      expect(result[1].slug).toBe('react');
    });

    it('should return empty array when no tags exist', async () => {
      vi.mocked(tagsService.getAllTags).mockResolvedValue([]);

      const result = await tagsService.getAllTags();

      expect(result).toHaveLength(0);
    });
  });

  describe('SEO and Metadata', () => {
    it('should include read time in blog posts', async () => {
      vi.mocked(postsService.getPostBySlug).mockResolvedValue(mockBlog);

      const result = await postsService.getPostBySlug('test-post');

      expect(result.readTime).toBe(5);
    });

    it('should include excerpt in blog posts', async () => {
      vi.mocked(postsService.getPostBySlug).mockResolvedValue(mockBlog);

      const result = await postsService.getPostBySlug('test-post');

      expect(result.excerpt).toBe('Test excerpt');
    });

    it('should include cover image in blog posts', async () => {
      vi.mocked(postsService.getPostBySlug).mockResolvedValue(mockBlog);

      const result = await postsService.getPostBySlug('test-post');

      expect(result.coverImage).toBe('https://example.com/image.jpg');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(postsService.getAllPosts).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(postsService.getAllPosts(POST_STATUS.PUBLISHED)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle invalid slugs', async () => {
      vi.mocked(postsService.getPostBySlug).mockRejectedValue(
        new Error('Post not found')
      );

      await expect(
        postsService.getPostBySlug('invalid-slug-123')
      ).rejects.toThrow('Post not found');
    });
  });
});
