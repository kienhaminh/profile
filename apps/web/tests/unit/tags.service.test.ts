import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError, ConflictError } from '@/lib/errors';

// Mock slugify
vi.mock('slugify', () => ({
  default: vi.fn((str: string) => str.toLowerCase().replace(/\s+/g, '-')),
}));

// Mock the database client
vi.mock('@/db/client', () => ({
  db: {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    insert: vi.fn(),
    values: vi.fn(),
    returning: vi.fn(),
    update: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
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

// Import after mocks
import { db } from '@/db/client';
import {
  getAllTags,
  getTagById,
  getTagBySlug,
  createTag,
} from '@/services/tags';

describe('tags.service', () => {
  const mockDb = db as any;
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllTags', () => {
    it('should return all tags', async () => {
      const mockTags = [
        {
          id: '1',
          slug: 'typescript',
          label: 'TypeScript',
          description: 'TypeScript language',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          slug: 'react',
          label: 'React',
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockResolvedValue(mockTags);

      const result = await getAllTags();

      expect(result).toHaveLength(2);
      expect(result[0].slug).toBe('typescript');
      expect(result[1].slug).toBe('react');
    });
  });

  describe('getTagById', () => {
    it('should return tag when found', async () => {
      const mockTag = {
        id: '1',
        slug: 'typescript',
        label: 'TypeScript',
        description: 'TypeScript language',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([mockTag]);

      const result = await getTagById('1');

      expect(result.slug).toBe('typescript');
      expect(result.label).toBe('TypeScript');
    });

    it('should throw NotFoundError when tag not found', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([]);

      await expect(getTagById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getTagBySlug', () => {
    it('should return tag when found', async () => {
      const mockTag = {
        id: '1',
        slug: 'typescript',
        label: 'TypeScript',
        description: 'TypeScript language',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([mockTag]);

      const result = await getTagBySlug('typescript');

      expect(result).not.toBeNull();
      expect(result?.slug).toBe('typescript');
    });

    it('should return null when tag not found', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([]);

      const result = await getTagBySlug('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createTag', () => {
    it('should create a new tag', async () => {
      const mockTag = {
        id: '1',
        slug: 'typescript',
        label: 'TypeScript',
        description: 'TypeScript language',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      // Mock getTagBySlug to return null (slug doesn't exist)
      mockDb.limit
        .mockResolvedValueOnce([]) // getTagBySlug returns null
        .mockResolvedValueOnce([mockTag]); // getTagById after create
      
      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue([mockTag]);

      const result = await createTag({
        slug: 'typescript',
        label: 'TypeScript',
        description: 'TypeScript language',
      });

      expect(result.slug).toBe('typescript');
      expect(result.label).toBe('TypeScript');
    });

    it('should throw ConflictError when slug already exists', async () => {
      const existingTag = {
        id: '1',
        slug: 'typescript',
        label: 'TypeScript',
        description: 'TypeScript language',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([existingTag]);

      await expect(
        createTag({
          slug: 'typescript',
          label: 'TypeScript',
        })
      ).rejects.toThrow(ConflictError);
    });
  });
});
