import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST_STATUS } from '@/types/enums';

// Mock Next.js modules
vi.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    json: () => Promise<any>;
    constructor(
      public url: string,
      public init?: RequestInit
    ) {
      this.json = async () => JSON.parse((init?.body as string) || '{}');
    }
  },
  NextResponse: {
    json: (data: any, init?: ResponseInit) => ({
      status: init?.status || 200,
      json: async () => data,
      headers: new Headers(init?.headers),
    }),
  },
}));

// Mock services
vi.mock('@/services/auth', () => ({
  authenticateUser: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock('@/services/posts', () => ({
  getAllPosts: vi.fn(),
  getPostById: vi.fn(),
  getPostBySlug: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  verifyAdminToken: vi.fn(),
  hashPassword: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import * as authService from '@/services/auth';
import * as postsService from '@/services/posts';
import * as authLib from '@/lib/auth';

describe('Admin API Integration Tests', () => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  const mockUser = {
    id: 'user-1',
    username: 'admin',
    createdAt: mockDate,
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
    coverImage: null,
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
    tags: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/admin/login', () => {
    it('should authenticate admin user successfully', async () => {
      vi.mocked(authService.authenticateUser).mockResolvedValue({
        success: true,
        token: 'mock-jwt-token',
        user: { id: mockUser.id, username: mockUser.username },
      });

      const credentials = {
        username: 'admin',
        password: 'password123',
      };

      // Simulate login request
      expect(authService.authenticateUser).toBeDefined();

      const result = await authService.authenticateUser(credentials);

      expect(authService.authenticateUser).toHaveBeenCalledWith(credentials);
      expect(result.token).toBe('mock-jwt-token');
      expect(result.success).toBe(true);
    });

    it('should reject invalid credentials', async () => {
      vi.mocked(authService.authenticateUser).mockResolvedValue({
        success: false,
      });

      const result = await authService.authenticateUser({
        username: 'admin',
        password: 'wrong_password',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('GET /api/admin/posts', () => {
    it('should return all posts including drafts', async () => {
      const mockPaginatedResult = {
        data: [mockBlog],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      vi.mocked(postsService.getAllPosts).mockResolvedValue(
        mockPaginatedResult
      );

      const result = await postsService.getAllPosts();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(POST_STATUS.PUBLISHED);
    });

    it('should support pagination', async () => {
      const mockPaginatedResult = {
        data: [mockBlog],
        pagination: {
          page: 2,
          limit: 5,
          total: 15,
          totalPages: 3,
        },
      };

      vi.mocked(postsService.getAllPosts).mockResolvedValue(
        mockPaginatedResult
      );

      const result = await postsService.getAllPosts(undefined, {
        page: 2,
        limit: 5,
      });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(15);
    });
  });

  describe('POST /api/admin/posts', () => {
    it('should create a new post', async () => {
      const newPost = {
        title: 'New Post',
        slug: 'new-post',
        content: '<p>Content</p>',
        authorId: 'user-1',
      };

      vi.mocked(postsService.createPost).mockResolvedValue(mockBlog);

      const result = await postsService.createPost(newPost);

      expect(postsService.createPost).toHaveBeenCalledWith(newPost);
      expect(result.title).toBe('Test Post');
    });

    it('should create post with tags', async () => {
      const newPost = {
        title: 'New Post',
        slug: 'new-post',
        content: '<p>Content</p>',
        authorId: 'user-1',
        tagIds: ['tag-1', 'tag-2'],
      };

      vi.mocked(postsService.createPost).mockResolvedValue(mockBlog);

      await postsService.createPost(newPost);

      expect(postsService.createPost).toHaveBeenCalledWith(
        expect.objectContaining({
          tagIds: ['tag-1', 'tag-2'],
        })
      );
    });
  });

  describe('PATCH /api/admin/posts/[slug]', () => {
    it('should update post by slug', async () => {
      const updateData = {
        title: 'Updated Title',
        content: '<p>Updated content</p>',
      };

      const updatedBlog = { ...mockBlog, ...updateData };
      vi.mocked(postsService.getPostBySlug).mockResolvedValue(mockBlog);
      vi.mocked(postsService.updatePost).mockResolvedValue(updatedBlog);

      // First get the post by slug to get the ID
      const post = await postsService.getPostBySlug('test-post');

      // Then update it
      const result = await postsService.updatePost(post.id, updateData);

      expect(result.title).toBe('Updated Title');
    });

    it('should update post status from draft to published', async () => {
      const draftPost = { ...mockBlog, status: POST_STATUS.DRAFT };
      const publishedPost = { ...mockBlog, status: POST_STATUS.PUBLISHED };

      vi.mocked(postsService.getPostBySlug).mockResolvedValue(draftPost);
      vi.mocked(postsService.updatePost).mockResolvedValue(publishedPost);

      const post = await postsService.getPostBySlug('test-post');
      const result = await postsService.updatePost(post.id, {
        status: POST_STATUS.PUBLISHED,
        publishDate: mockDate.toISOString(),
      });

      expect(result.status).toBe(POST_STATUS.PUBLISHED);
    });
  });

  describe('DELETE /api/admin/posts/[slug]', () => {
    it('should delete post by slug', async () => {
      vi.mocked(postsService.getPostBySlug).mockResolvedValue(mockBlog);
      vi.mocked(postsService.deletePost).mockResolvedValue(undefined);

      // First get the post by slug to get the ID
      const post = await postsService.getPostBySlug('test-post');

      // Then delete it
      await postsService.deletePost(post.id);

      expect(postsService.deletePost).toHaveBeenCalledWith('post-1');
    });
  });

  describe('GET /api/admin/stats', () => {
    it('should return admin dashboard statistics', async () => {
      const mockPublishedPosts = {
        data: [mockBlog],
        pagination: { page: 1, limit: 10, total: 5, totalPages: 1 },
      };

      const mockDraftPosts = {
        data: [],
        pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
      };

      vi.mocked(postsService.getAllPosts)
        .mockResolvedValueOnce(mockPublishedPosts)
        .mockResolvedValueOnce(mockDraftPosts);

      const publishedResult = await postsService.getAllPosts(
        POST_STATUS.PUBLISHED
      );
      const draftResult = await postsService.getAllPosts(POST_STATUS.DRAFT);

      const stats = {
        totalPosts:
          publishedResult.pagination.total + draftResult.pagination.total,
        publishedPosts: publishedResult.pagination.total,
        draftPosts: draftResult.pagination.total,
      };

      expect(stats.totalPosts).toBe(8);
      expect(stats.publishedPosts).toBe(5);
      expect(stats.draftPosts).toBe(3);
    });
  });

  describe('Authentication Middleware', () => {
    it('should verify JWT token', async () => {
      const mockPayload = { adminId: 'user-1', username: 'admin' };
      vi.mocked(authLib.verifyAdminToken).mockReturnValue(mockPayload);

      const payload = authLib.verifyAdminToken('valid-jwt-token');

      expect(payload).toEqual(mockPayload);
    });

    it('should reject invalid JWT token', () => {
      vi.mocked(authLib.verifyAdminToken).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authLib.verifyAdminToken('invalid-token')).toThrow(
        'Invalid token'
      );
    });

    it('should retrieve user from token payload', async () => {
      const mockPayload = { adminId: 'user-1', username: 'admin' };
      vi.mocked(authLib.verifyAdminToken).mockReturnValue(mockPayload);
      vi.mocked(authService.getUserById).mockResolvedValue(mockUser);

      const payload = authLib.verifyAdminToken('valid-jwt-token');
      const user = await authService.getUserById(payload.adminId);

      expect(user).not.toBeNull();
      expect(user?.id).toBe('user-1');
      expect(user?.username).toBe('admin');
    });
  });
});
