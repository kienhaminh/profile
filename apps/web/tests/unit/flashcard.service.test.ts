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
    innerJoin: vi.fn(),
    onConflictDoNothing: vi.fn(),
  },
}));

// Import after mocks
import { db } from '@/db/client';
import { FlashcardService } from '@/services/flashcard';

describe('flashcard.service', () => {
  const mockDb = db as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new flashcard set', async () => {
      const mockFlashcard = {
        id: '1',
        name: 'Spanish Basics',
        description: 'Basic Spanish vocabulary',
        language: 'es',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue([mockFlashcard]);

      const result = await FlashcardService.create({
        name: 'Spanish Basics',
        description: 'Basic Spanish vocabulary',
        language: 'es',
      });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toEqual(mockFlashcard);
      expect(result.name).toBe('Spanish Basics');
      expect(result.isActive).toBe(true);
    });

    it('should respect isActive flag', async () => {
      const mockFlashcard = {
        id: '2',
        name: 'French Advanced',
        language: 'fr',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue([mockFlashcard]);

      const result = await FlashcardService.create({
        name: 'French Advanced',
        language: 'fr',
        isActive: false,
      });

      expect(result.isActive).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return all flashcard sets', async () => {
      const mockFlashcards = [
        {
          id: '1',
          name: 'Spanish Basics',
          language: 'es',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'French Basics',
          language: 'fr',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.orderBy.mockReturnValue(mockDb);
      mockDb.limit.mockReturnValue(mockDb);
      mockDb.offset.mockResolvedValue(mockFlashcards);

      const result = await FlashcardService.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Spanish Basics');
    });
  });

  describe('getById', () => {
    it('should return flashcard by id', async () => {
      const mockFlashcard = {
        id: '1',
        name: 'Spanish Basics',
        language: 'es',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([mockFlashcard]);

      const result = await FlashcardService.getById('1');

      expect(result).toEqual(mockFlashcard);
      expect(result?.id).toBe('1');
    });

    it('should return null if flashcard not found', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([]);

      const result = await FlashcardService.getById('999');

      expect(result).toBeNull();
    });
  });

  describe('getByIdWithVocabularies', () => {
    it('should return flashcard with its vocabularies', async () => {
      const mockFlashcard = {
        id: '1',
        name: 'Spanish Basics',
        description: 'Basic Spanish vocabulary',
        language: 'es',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockVocabularies = [
        {
          vocabulary: {
            id: 'v1',
            word: 'hola',
            language: 'es',
            meaning: 'hello',
            difficulty: 'beginner',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          addedAt: new Date(),
        },
        {
          vocabulary: {
            id: 'v2',
            word: 'adios',
            language: 'es',
            meaning: 'goodbye',
            difficulty: 'beginner',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          addedAt: new Date(),
        },
      ];

      // Mock getById
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockFlashcard]);

      // Mock vocabulary query
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.innerJoin.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.orderBy.mockResolvedValue(mockVocabularies);

      const result = await FlashcardService.getByIdWithVocabularies('1');

      expect(result).not.toBeNull();
      expect(result?.vocabularies).toHaveLength(2);
      expect(result?.vocabularies[0].word).toBe('hola');
      expect(result?.vocabularies[1].word).toBe('adios');
    });

    it('should return null if flashcard not found', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([]);

      const result = await FlashcardService.getByIdWithVocabularies('999');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update flashcard', async () => {
      const mockUpdated = {
        id: '1',
        name: 'Spanish Advanced',
        description: 'Advanced Spanish vocabulary',
        language: 'es',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.update.mockReturnValue(mockDb);
      mockDb.set.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue([mockUpdated]);

      const result = await FlashcardService.update('1', {
        name: 'Spanish Advanced',
        description: 'Advanced Spanish vocabulary',
        isActive: false,
      });

      expect(mockDb.update).toHaveBeenCalled();
      expect(result.name).toBe('Spanish Advanced');
      expect(result.isActive).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete flashcard', async () => {
      const mockDeleted = {
        id: '1',
        name: 'Spanish Basics',
        language: 'es',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.delete.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue([mockDeleted]);

      const result = await FlashcardService.delete('1');

      expect(mockDb.delete).toHaveBeenCalled();
      expect(result.id).toBe('1');
    });
  });

  describe('addVocabularies', () => {
    it('should add vocabularies to flashcard', async () => {
      const mockResults = [
        { flashcardId: 'f1', vocabularyId: 'v1', addedAt: new Date() },
        { flashcardId: 'f1', vocabularyId: 'v2', addedAt: new Date() },
      ];

      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockReturnValue(mockDb);
      mockDb.onConflictDoNothing.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue(mockResults);

      const result = await FlashcardService.addVocabularies('f1', ['v1', 'v2']);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should handle empty vocabulary ids', async () => {
      const result = await FlashcardService.addVocabularies('f1', []);

      expect(result).toHaveLength(0);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('removeVocabularies', () => {
    it('should remove vocabularies from flashcard', async () => {
      const mockResults = [
        { flashcardId: 'f1', vocabularyId: 'v1', addedAt: new Date() },
      ];

      mockDb.delete.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue(mockResults);

      const result = await FlashcardService.removeVocabularies('f1', ['v1']);

      expect(mockDb.delete).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('should handle empty vocabulary ids', async () => {
      const result = await FlashcardService.removeVocabularies('f1', []);

      expect(result).toHaveLength(0);
      expect(mockDb.delete).not.toHaveBeenCalled();
    });
  });

  describe('recordPracticeSession', () => {
    it('should record practice session results', async () => {
      const mockResults = [
        {
          id: 's1',
          flashcardId: 'f1',
          vocabularyId: 'v1',
          wasCorrect: true,
          practiceDate: new Date(),
        },
        {
          id: 's2',
          flashcardId: 'f1',
          vocabularyId: 'v2',
          wasCorrect: false,
          practiceDate: new Date(),
        },
      ];

      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue(mockResults);

      const result = await FlashcardService.recordPracticeSession('f1', [
        { vocabularyId: 'v1', wasCorrect: true },
        { vocabularyId: 'v2', wasCorrect: false },
      ]);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should handle empty results', async () => {
      const result = await FlashcardService.recordPracticeSession('f1', []);

      expect(result).toHaveLength(0);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('getPracticeStats', () => {
    it('should calculate practice statistics correctly', async () => {
      const mockSessions = [
        {
          id: 's1',
          flashcardId: 'f1',
          vocabularyId: 'v1',
          wasCorrect: true,
          practiceDate: new Date(),
        },
        {
          id: 's2',
          flashcardId: 'f1',
          vocabularyId: 'v1',
          wasCorrect: true,
          practiceDate: new Date(),
        },
        {
          id: 's3',
          flashcardId: 'f1',
          vocabularyId: 'v2',
          wasCorrect: false,
          practiceDate: new Date(),
        },
        {
          id: 's4',
          flashcardId: 'f1',
          vocabularyId: 'v2',
          wasCorrect: true,
          practiceDate: new Date(),
        },
      ];

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue(mockSessions);

      const result = await FlashcardService.getPracticeStats('f1');

      expect(result.totalPractices).toBe(4);
      expect(result.correctPractices).toBe(3);
      expect(result.accuracy).toBe(75);
      expect(result.vocabularyStats.v1.total).toBe(2);
      expect(result.vocabularyStats.v1.correct).toBe(2);
      expect(result.vocabularyStats.v1.accuracy).toBe(100);
      expect(result.vocabularyStats.v2.total).toBe(2);
      expect(result.vocabularyStats.v2.correct).toBe(1);
      expect(result.vocabularyStats.v2.accuracy).toBe(50);
    });

    it('should handle no practice sessions', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockResolvedValue([]);

      const result = await FlashcardService.getPracticeStats('f1');

      expect(result.totalPractices).toBe(0);
      expect(result.correctPractices).toBe(0);
      expect(result.accuracy).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return flashcard statistics', async () => {
      const mockFlashcards = [
        {
          id: '1',
          name: 'Spanish Basics',
          language: 'es',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'French Basics',
          language: 'fr',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          name: 'German Advanced',
          language: 'de',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockResolvedValue(mockFlashcards);

      const result = await FlashcardService.getStats();

      expect(result.total).toBe(3);
      expect(result.active).toBe(2);
      expect(result.byLanguage.es).toBe(1);
      expect(result.byLanguage.fr).toBe(1);
      expect(result.byLanguage.de).toBe(1);
    });
  });
});
