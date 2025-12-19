import { db } from '@/db/client';
import {
  flashcards,
  vocabularies,
  flashcardVocabularies,
  practiceSessions,
} from '@/db/schema';
import { desc, eq, and, inArray, sql } from 'drizzle-orm';

export interface CreateFlashcardInput {
  name: string;
  description?: string;
  language: string;
  isActive?: boolean;
}

export interface UpdateFlashcardInput {
  name?: string;
  description?: string;
  language?: string;
  isActive?: boolean;
}

export interface FlashcardWithVocabularies {
  id: string;
  name: string;
  description: string | null;
  language: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  vocabularies: Array<{
    id: string;
    word: string;
    language: string;
    meaning: string;
    translation?: string | null;
    pronunciation: string | null;
    example: string | null;
    partOfSpeech: string | null;
    difficulty?: string | null;
    notes?: string | null;
    addedAt: Date;
  }>;
}

export interface PracticeResult {
  vocabularyId: string;
  wasCorrect: boolean;
}

export class FlashcardService {
  /**
   * Create a new flashcard set
   */
  static async create(input: CreateFlashcardInput) {
    const [flashcard] = await db
      .insert(flashcards)
      .values({
        ...input,
        isActive: input.isActive !== undefined ? input.isActive : true,
        updatedAt: new Date(),
      })
      .returning();

    return flashcard;
  }

  /**
   * Get all flashcards
   */
  static async getAll(limit = 100, offset = 0) {
    const results = await db
      .select()
      .from(flashcards)
      .orderBy(desc(flashcards.createdAt))
      .limit(limit)
      .offset(offset);

    return results;
  }

  /**
   * Get flashcard by ID
   */
  static async getById(id: string) {
    const [flashcard] = await db
      .select()
      .from(flashcards)
      .where(eq(flashcards.id, id))
      .limit(1);

    return flashcard || null;
  }

  /**
   * Get flashcard with its vocabularies
   */
  static async getByIdWithVocabularies(
    id: string
  ): Promise<FlashcardWithVocabularies | null> {
    const flashcard = await this.getById(id);
    if (!flashcard) return null;

    // Get all vocabularies for this flashcard
    const vocabsWithAddedAt = await db
      .select({
        vocabulary: vocabularies,
        addedAt: flashcardVocabularies.addedAt,
      })
      .from(flashcardVocabularies)
      .innerJoin(
        vocabularies,
        eq(flashcardVocabularies.vocabularyId, vocabularies.id)
      )
      .where(eq(flashcardVocabularies.flashcardId, id))
      .orderBy(desc(flashcardVocabularies.addedAt));

    return {
      ...flashcard,
      vocabularies: vocabsWithAddedAt.map((item) => ({
        ...item.vocabulary,
        addedAt: item.addedAt,
      })),
    };
  }

  /**
   * Update flashcard
   */
  static async update(id: string, input: UpdateFlashcardInput) {
    const [flashcard] = await db
      .update(flashcards)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(flashcards.id, id))
      .returning();

    return flashcard;
  }

  /**
   * Delete flashcard
   */
  static async delete(id: string) {
    const [flashcard] = await db
      .delete(flashcards)
      .where(eq(flashcards.id, id))
      .returning();

    return flashcard;
  }

  /**
   * Add vocabularies to flashcard
   */
  static async addVocabularies(flashcardId: string, vocabularyIds: string[]) {
    if (vocabularyIds.length === 0) return [];

    const results = await db
      .insert(flashcardVocabularies)
      .values(
        vocabularyIds.map((vocabularyId) => ({
          flashcardId,
          vocabularyId,
        }))
      )
      .onConflictDoNothing()
      .returning();

    return results;
  }

  /**
   * Remove vocabularies from flashcard
   */
  static async removeVocabularies(
    flashcardId: string,
    vocabularyIds: string[]
  ) {
    if (vocabularyIds.length === 0) return [];

    const results = await db
      .delete(flashcardVocabularies)
      .where(
        and(
          eq(flashcardVocabularies.flashcardId, flashcardId),
          inArray(flashcardVocabularies.vocabularyId, vocabularyIds)
        )
      )
      .returning();

    return results;
  }

  /**
   * Record practice session results
   */
  static async recordPracticeSession(
    flashcardId: string,
    results: PracticeResult[]
  ) {
    if (results.length === 0) return [];

    const sessions = await db
      .insert(practiceSessions)
      .values(
        results.map((result) => ({
          flashcardId,
          vocabularyId: result.vocabularyId,
          wasCorrect: result.wasCorrect,
        }))
      )
      .returning();

    return sessions;
  }

  /**
   * Get practice statistics for a flashcard
   */
  static async getPracticeStats(flashcardId: string) {
    const sessions = await db
      .select()
      .from(practiceSessions)
      .where(eq(practiceSessions.flashcardId, flashcardId));

    const totalPractices = sessions.length;
    const correctPractices = sessions.filter((s) => s.wasCorrect).length;
    const accuracy =
      totalPractices > 0 ? (correctPractices / totalPractices) * 100 : 0;

    // Get vocabulary-specific stats
    const vocabularyStats: Record<
      string,
      { total: number; correct: number; accuracy: number }
    > = {};

    sessions.forEach((session) => {
      const vocabId = session.vocabularyId;
      if (!vocabularyStats[vocabId]) {
        vocabularyStats[vocabId] = { total: 0, correct: 0, accuracy: 0 };
      }
      vocabularyStats[vocabId].total++;
      if (session.wasCorrect) {
        vocabularyStats[vocabId].correct++;
      }
    });

    // Calculate accuracy for each vocabulary
    Object.keys(vocabularyStats).forEach((vocabId) => {
      const stats = vocabularyStats[vocabId];
      stats.accuracy = (stats.correct / stats.total) * 100;
    });

    return {
      totalPractices,
      correctPractices,
      accuracy: Math.round(accuracy * 10) / 10,
      vocabularyStats,
    };
  }

  /**
   * Get flashcard statistics
   */
  static async getStats() {
    const allFlashcards = await db.select().from(flashcards);

    const byLanguage: Record<string, number> = {};
    let activeCount = 0;

    allFlashcards.forEach((flashcard) => {
      byLanguage[flashcard.language] =
        (byLanguage[flashcard.language] || 0) + 1;
      if (flashcard.isActive) activeCount++;
    });

    return {
      total: allFlashcards.length,
      active: activeCount,
      byLanguage,
    };
  }
}
