import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  },
}));

// Import after mocks
import { db } from '@/db/client';
import { VocabularyService } from '@/services/vocabulary';

describe('vocabulary.service', () => {
  const mockDb = db as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new vocabulary entry', async () => {
      const mockVocabulary = {
        id: '1',
        word: 'hello',
        language: 'en',
        meaning: 'a greeting',
        translation: 'hola',
        pronunciation: 'həˈloʊ',
        example: 'Hello, world!',
        partOfSpeech: 'interjection',
        difficulty: 'beginner',
        notes: 'Common greeting',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue([mockVocabulary]);

      const result = await VocabularyService.create({
        word: 'hello',
        language: 'en',
        meaning: 'a greeting',
        translation: 'hola',
        pronunciation: 'həˈloʊ',
        example: 'Hello, world!',
        partOfSpeech: 'interjection',
        difficulty: 'beginner',
        notes: 'Common greeting',
      });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(mockVocabulary);
      expect(result.word).toBe('hello');
    });

    it('should use default difficulty if not provided', async () => {
      const mockVocabulary = {
        id: '2',
        word: 'test',
        language: 'en',
        meaning: 'a test',
        difficulty: 'intermediate',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue([mockVocabulary]);

      const result = await VocabularyService.create({
        word: 'test',
        language: 'en',
        meaning: 'a test',
      });

      expect(result.difficulty).toBe('intermediate');
    });
  });

  describe('getAll', () => {
    it('should return all vocabularies without filters', async () => {
      const mockVocabularies = [
        {
          id: '1',
          word: 'hello',
          language: 'en',
          meaning: 'a greeting',
          difficulty: 'beginner',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          word: 'goodbye',
          language: 'en',
          meaning: 'a farewell',
          difficulty: 'beginner',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.orderBy.mockReturnValue(mockDb);
      mockDb.limit.mockReturnValue(mockDb);
      mockDb.offset.mockResolvedValue(mockVocabularies);

      const result = await VocabularyService.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].word).toBe('hello');
    });

    it('should filter by language', async () => {
      const mockVocabularies = [
        {
          id: '1',
          word: 'hola',
          language: 'es',
          meaning: 'hello',
          difficulty: 'beginner',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockReturnValue(mockDb);
      mockDb.limit.mockReturnValue(mockDb);
      mockDb.offset.mockResolvedValue(mockVocabularies);

      const result = await VocabularyService.getAll({ language: 'es' });

      expect(mockDb.where).toHaveBeenCalled();
      expect(result[0].language).toBe('es');
    });
  });

  describe('getById', () => {
    it('should return vocabulary by id', async () => {
      const mockVocabulary = {
        id: '1',
        word: 'hello',
        language: 'en',
        meaning: 'a greeting',
        difficulty: 'beginner',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([mockVocabulary]);

      const result = await VocabularyService.getById('1');

      expect(result).toEqual(mockVocabulary);
      expect(result?.id).toBe('1');
    });

    it('should return null if vocabulary not found', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([]);

      const result = await VocabularyService.getById('999');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update vocabulary', async () => {
      const mockUpdated = {
        id: '1',
        word: 'hello',
        language: 'en',
        meaning: 'updated meaning',
        difficulty: 'intermediate',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue([mockUpdated]);

      const result = await VocabularyService.update('1', {
        meaning: 'updated meaning',
        difficulty: 'intermediate',
      });

      expect(mockDb.update).toHaveBeenCalled();
      expect(result.meaning).toBe('updated meaning');
    });
  });

  describe('delete', () => {
    it('should delete vocabulary', async () => {
      const mockDeleted = {
        id: '1',
        word: 'hello',
        language: 'en',
        meaning: 'a greeting',
        difficulty: 'beginner',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.delete.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue([mockDeleted]);

      const result = await VocabularyService.delete('1');

      expect(mockDb.delete).toHaveBeenCalled();
      expect(result.id).toBe('1');
    });
  });

  describe('getStats', () => {
    it('should return vocabulary statistics', async () => {
      const mockVocabularies = [
        {
          id: '1',
          word: 'hello',
          language: 'en',
          difficulty: 'beginner',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          word: 'hola',
          language: 'es',
          difficulty: 'beginner',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          word: 'bonjour',
          language: 'fr',
          difficulty: 'intermediate',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockResolvedValue(mockVocabularies);

      const result = await VocabularyService.getStats();

      expect(result.total).toBe(3);
      expect(result.byLanguage.en).toBe(1);
      expect(result.byLanguage.es).toBe(1);
      expect(result.byLanguage.fr).toBe(1);
      expect(result.byDifficulty.beginner).toBe(2);
      expect(result.byDifficulty.intermediate).toBe(1);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple vocabularies at once', async () => {
      const mockVocabularies = [
        {
          id: '1',
          word: 'hello',
          language: 'en',
          meaning: 'a greeting',
          difficulty: 'beginner',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          word: 'goodbye',
          language: 'en',
          meaning: 'a farewell',
          difficulty: 'beginner',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue(mockVocabularies);

      const result = await VocabularyService.bulkCreate([
        { word: 'hello', language: 'en', meaning: 'a greeting' },
        { word: 'goodbye', language: 'en', meaning: 'a farewell' },
      ]);

      expect(result).toHaveLength(2);
      expect(result[0].word).toBe('hello');
      expect(result[1].word).toBe('goodbye');
    });
  });
});
