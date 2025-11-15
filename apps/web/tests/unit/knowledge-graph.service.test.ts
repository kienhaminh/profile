import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database client
vi.mock('@/db/client', () => ({
  db: {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    innerJoin: vi.fn(),
  },
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

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value, op: 'eq' })),
  ne: vi.fn((field, value) => ({ field, value, op: 'ne' })),
  and: vi.fn((...args) => ({ op: 'and', args })),
  sql: Object.assign(
    vi.fn((strings, ...values) => ({ sql: strings, values })),
    {
      // Support template literal syntax
      raw: vi.fn((str) => ({ raw: str })),
    }
  ),
  relations: vi.fn(() => ({})),
}));

// Import after mocks
import { db } from '@/db/client';
import { getRelatedBlogsById } from '@/services/knowledge-graph';

describe('knowledge-graph.service', () => {
  const mockDb = db as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRelatedBlogsById', () => {
    it('should return empty array when blog has no tags', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([]);

      const result = await getRelatedBlogsById('blog-1');

      expect(result).toEqual([]);
    });

    it('should find related blogs by shared tags', async () => {
      const mockDate = new Date('2024-01-01T00:00:00.000Z');

      // Mock: current blog has tags
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([
        { tagId: '550e8400-e29b-41d4-a716-446655440001' },
        { tagId: '550e8400-e29b-41d4-a716-446655440002' },
      ]);

      // Mock: find posts with shared tags
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([
        { postId: '550e8400-e29b-41d4-a716-446655440012', tagId: '550e8400-e29b-41d4-a716-446655440001' },
        { postId: '550e8400-e29b-41d4-a716-446655440013', tagId: '550e8400-e29b-41d4-a716-446655440001' },
        { postId: '550e8400-e29b-41d4-a716-446655440013', tagId: '550e8400-e29b-41d4-a716-446655440002' }, // post-3 shares 2 tags
      ]);

      // Mock: fetch post-3 details
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([
        {
          id: '550e8400-e29b-41d4-a716-446655440013',
          title: 'Related Post',
          slug: 'related-post',
          status: 'PUBLISHED',
          publishDate: mockDate,
          excerpt: 'Excerpt',
          readTime: 5,
          coverImage: null,
          createdAt: mockDate,
          updatedAt: mockDate,
          authorId: '550e8400-e29b-41d4-a716-446655440000',
        },
      ]);

      // Mock: fetch tags for post-3
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([
        {
          tag: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            slug: 'typescript',
            label: 'TypeScript',
            description: null,
            createdAt: mockDate,
            updatedAt: mockDate,
          },
        },
      ]);

      // Mock: fetch post-2 details
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([
        {
          id: '550e8400-e29b-41d4-a716-446655440012',
          title: 'Another Post',
          slug: 'another-post',
          status: 'PUBLISHED',
          publishDate: mockDate,
          excerpt: 'Excerpt',
          readTime: 3,
          coverImage: null,
          createdAt: mockDate,
          updatedAt: mockDate,
          authorId: '550e8400-e29b-41d4-a716-446655440000',
        },
      ]);

      // Mock: fetch tags for post-2
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([
        {
          tag: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            slug: 'typescript',
            label: 'TypeScript',
            description: null,
            createdAt: mockDate,
            updatedAt: mockDate,
          },
        },
      ]);

      const result = await getRelatedBlogsById('550e8400-e29b-41d4-a716-446655440010', 5);

      expect(result).toHaveLength(2);
      // post-3 should be first (score: 2 shared tags)
      expect(result[0].blog.id).toBe('550e8400-e29b-41d4-a716-446655440013');
      expect(result[0].score).toBe(2);
      // post-2 should be second (score: 1 shared tag)
      expect(result[1].blog.id).toBe('550e8400-e29b-41d4-a716-446655440012');
      expect(result[1].score).toBe(1);
    });

    it('should respect limit parameter', async () => {
      const mockDate = new Date('2024-01-01T00:00:00.000Z');

      // Mock: current blog has tags
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tagId: '550e8400-e29b-41d4-a716-446655440001' }]);

      // Mock: find posts with shared tags (3 posts)
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([
        { postId: '550e8400-e29b-41d4-a716-446655440012', tagId: '550e8400-e29b-41d4-a716-446655440001' },
        { postId: '550e8400-e29b-41d4-a716-446655440013', tagId: '550e8400-e29b-41d4-a716-446655440001' },
        { postId: '550e8400-e29b-41d4-a716-446655440014', tagId: '550e8400-e29b-41d4-a716-446655440001' },
      ]);

      // Mock fetch details for first 2 posts only (limit=2)
      for (let i = 0; i < 2; i++) {
        mockDb.select.mockReturnValueOnce(mockDb);
        mockDb.from.mockReturnValueOnce(mockDb);
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.limit.mockResolvedValueOnce([
          {
            id: `550e8400-e29b-41d4-a716-44665544001${i + 2}`,
            title: `Post ${i + 2}`,
            slug: `post-${i + 2}`,
            status: 'PUBLISHED',
            publishDate: mockDate,
            excerpt: 'Excerpt',
            readTime: 5,
            coverImage: null,
            createdAt: mockDate,
            updatedAt: mockDate,
            authorId: '550e8400-e29b-41d4-a716-446655440000',
          },
        ]);

        mockDb.select.mockReturnValueOnce(mockDb);
        mockDb.from.mockReturnValueOnce(mockDb);
        mockDb.innerJoin.mockReturnValueOnce(mockDb);
        mockDb.where.mockResolvedValueOnce([]);
      }

      const result = await getRelatedBlogsById('550e8400-e29b-41d4-a716-446655440010', 2);

      expect(result).toHaveLength(2);
    });
  });
});
