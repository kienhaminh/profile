import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '@/lib/errors';
import { POST_STATUS } from '@/types/enums';

// Mock the database client
vi.mock('@/db/client', () => ({
  db: {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    offset: vi.fn(),
    orderBy: vi.fn(),
    insert: vi.fn(),
    values: vi.fn(),
    returning: vi.fn(),
    update: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    innerJoin: vi.fn(),
    $dynamic: vi.fn(),
  },
}));

vi.mock('@/db/schema', () => ({
  posts: {},
  postTags: {},
  tags: {},
  users: {},
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock drizzle-orm functions
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value, op: 'eq' })),
  desc: vi.fn((field) => ({ field, dir: 'desc' })),
  count: vi.fn(() => ({ fn: 'count' })),
}));

// Import after mocks
import { db } from '@/db/client';
import {
  getAllPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
} from '@/services/posts';

describe('posts.service', () => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  const mockDb = db as any;

  // Helper to create a thenable dynamic query mock
  const createDynamicQueryMock = (result: any) => ({
    where: vi.fn(function(this: any) { return this; }),
    orderBy: vi.fn(function(this: any) { return this; }),
    limit: vi.fn(function(this: any) { return this; }),
    offset: vi.fn(function(this: any) { return this; }),
    then: vi.fn((resolve) => resolve(result)),
  });
  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    username: 'admin',
    passwordHash: 'hash',
    createdAt: mockDate,
  };

  const mockTag = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    slug: 'typescript',
    label: 'TypeScript',
    description: 'TypeScript language',
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockPost = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    slug: 'test-post',
    title: 'Test Post',
    status: POST_STATUS.PUBLISHED,
    publishDate: mockDate,
    content: '<p>Test content</p>',
    excerpt: 'Test excerpt',
    readTime: 5,
    coverImage: 'https://example.com/image.jpg',
    authorId: '550e8400-e29b-41d4-a716-446655440000',
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllPosts', () => {
    it('should return all posts without pagination', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.$dynamic.mockReturnValue(createDynamicQueryMock([mockPost]));

      // Mock author query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      const result = await getAllPosts();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(mockPost.id);
      expect(result.data[0].title).toBe(mockPost.title);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should return posts with pagination', async () => {
      // Mock count query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockResolvedValueOnce([{ value: 15 }]);

      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.$dynamic.mockReturnValue(createDynamicQueryMock([mockPost]));

      // Mock author query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      const result = await getAllPosts(undefined, { page: 1, limit: 10 });

      expect(result.pagination.total).toBe(15);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should filter posts by status', async () => {
      // Mock count query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ value: 5 }]);

      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.$dynamic.mockReturnValue(createDynamicQueryMock([mockPost]));

      // Mock author query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      const result = await getAllPosts(POST_STATUS.PUBLISHED, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('getPostById', () => {
    it('should return post when found', async () => {
      // Mock post query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockPost]);

      // Mock author query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      const result = await getPostById('550e8400-e29b-41d4-a716-446655440002');

      expect(result.id).toBe(mockPost.id);
      expect(result.title).toBe(mockPost.title);
      expect(result.tags).toHaveLength(1);
      expect(result.tags[0].slug).toBe('typescript');
    });

    it('should throw NotFoundError when post not found', async () => {
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(getPostById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getPostBySlug', () => {
    it('should return post when found', async () => {
      // Mock post query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockPost]);

      // Mock author query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      const result = await getPostBySlug('test-post');

      expect(result.slug).toBe(mockPost.slug);
      expect(result.title).toBe(mockPost.title);
    });

    it('should throw NotFoundError when post not found', async () => {
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(getPostBySlug('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createPost', () => {
    it('should create post without tags', async () => {
      const newPost = {
        title: 'New Post',
        slug: 'new-post',
        content: '<p>Content</p>',
        authorId: '550e8400-e29b-41d4-a716-446655440000',
      };

      // Mock insert
      mockDb.insert.mockReturnValueOnce(mockDb);
      mockDb.values.mockReturnValueOnce(mockDb);
      mockDb.returning.mockResolvedValueOnce([mockPost]);

      // Mock getPostById for final return - post query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockPost]);

      // Mock author query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([]);

      const result = await createPost(newPost);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result.title).toBe(mockPost.title);
    });

    it('should create post with tags', async () => {
      const newPost = {
        title: 'New Post',
        slug: 'new-post',
        content: '<p>Content</p>',
        authorId: '550e8400-e29b-41d4-a716-446655440000',
        tagIds: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'],
      };

      // Mock post insert
      mockDb.insert.mockReturnValueOnce(mockDb);
      mockDb.values.mockReturnValueOnce(mockDb);
      mockDb.returning.mockResolvedValueOnce([mockPost]);

      // Mock postTags insert
      mockDb.insert.mockReturnValueOnce(mockDb);
      mockDb.values.mockResolvedValueOnce(undefined);

      // Mock getPostById for final return - post query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockPost]);

      // Mock author query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      const result = await createPost(newPost);

      expect(mockDb.insert).toHaveBeenCalledTimes(2); // post + postTags
      expect(result.tags).toHaveLength(1);
    });
  });

  describe('updatePost', () => {
    it('should update post fields', async () => {
      const updateData = {
        title: 'Updated Title',
        content: '<p>Updated content</p>',
      };

      // Mock getPostById (existence check) - post query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockPost]);

      // Mock author query for existence check
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      // Mock tags query for existence check
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      // Mock update
      mockDb.update.mockReturnValueOnce(mockDb);
      mockDb.set.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce(undefined);

      // Mock getPostById for final return - post query
      const updatedPost = { ...mockPost, ...updateData };
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([updatedPost]);

      // Mock author query for final return
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      // Mock tags query for final return
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      const result = await updatePost('550e8400-e29b-41d4-a716-446655440002', updateData);

      expect(mockDb.update).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
    });

    it('should update post tags', async () => {
      const updateData = {
        tagIds: ['550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004'],
      };

      // Mock getPostById (existence check) - post query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockPost]);

      // Mock author query for existence check
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      // Mock tags query for existence check
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      // Mock update
      mockDb.update.mockReturnValueOnce(mockDb);
      mockDb.set.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce(undefined);

      // Mock delete old tags
      mockDb.delete.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce(undefined);

      // Mock insert new tags
      mockDb.insert.mockReturnValueOnce(mockDb);
      mockDb.values.mockResolvedValueOnce(undefined);

      // Mock getPostById for final return - post query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockPost]);

      // Mock author query for final return
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      // Mock tags query for final return
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      await updatePost('550e8400-e29b-41d4-a716-446655440002', updateData);

      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should throw NotFoundError when post not found', async () => {
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(
        updatePost('nonexistent', { title: 'Updated' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deletePost', () => {
    it('should delete post successfully', async () => {
      // Mock getPostById (existence check) - post query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockPost]);

      // Mock author query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockUser]);

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      // Mock delete
      mockDb.delete.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce(undefined);

      await deletePost('550e8400-e29b-41d4-a716-446655440002');

      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundError when post not found', async () => {
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(deletePost('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});
