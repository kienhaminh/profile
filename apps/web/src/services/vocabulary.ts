import { db } from '@/db/client';
import { vocabularies, flashcards, flashcardVocabularies, practiceSessions } from '@/db/schema';
import { desc, eq, and, sql, inArray } from 'drizzle-orm';

export interface CreateVocabularyInput {
  word: string;
  language: string;
  meaning: string;
  translation?: string;
  pronunciation?: string;
  example?: string;
  partOfSpeech?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  notes?: string;
}

export interface UpdateVocabularyInput {
  word?: string;
  language?: string;
  meaning?: string;
  translation?: string;
  pronunciation?: string;
  example?: string;
  partOfSpeech?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  notes?: string;
}

export interface VocabularyFilter {
  language?: string;
  difficulty?: string;
  search?: string;
}

export class VocabularyService {
  /**
   * Create a new vocabulary entry
   */
  static async create(input: CreateVocabularyInput) {
    const [vocabulary] = await db
      .insert(vocabularies)
      .values({
        ...input,
        difficulty: input.difficulty || 'intermediate',
        updatedAt: new Date(),
      })
      .returning();

    return vocabulary;
  }

  /**
   * Get all vocabularies with optional filtering
   */
  static async getAll(filters?: VocabularyFilter, limit = 100, offset = 0) {
    let query = db.select().from(vocabularies);

    // Apply filters
    const conditions = [];
    if (filters?.language) {
      conditions.push(eq(vocabularies.language, filters.language));
    }
    if (filters?.difficulty) {
      conditions.push(eq(vocabularies.difficulty, filters.difficulty));
    }
    if (filters?.search) {
      conditions.push(
        sql`(${vocabularies.word} ILIKE ${`%${filters.search}%`} OR ${vocabularies.meaning} ILIKE ${`%${filters.search}%`})`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const results = await query
      .orderBy(desc(vocabularies.createdAt))
      .limit(limit)
      .offset(offset);

    return results;
  }

  /**
   * Get vocabulary by ID
   */
  static async getById(id: string) {
    const [vocabulary] = await db
      .select()
      .from(vocabularies)
      .where(eq(vocabularies.id, id))
      .limit(1);

    return vocabulary || null;
  }

  /**
   * Update vocabulary
   */
  static async update(id: string, input: UpdateVocabularyInput) {
    const [vocabulary] = await db
      .update(vocabularies)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(vocabularies.id, id))
      .returning();

    return vocabulary;
  }

  /**
   * Delete vocabulary
   */
  static async delete(id: string) {
    const [vocabulary] = await db
      .delete(vocabularies)
      .where(eq(vocabularies.id, id))
      .returning();

    return vocabulary;
  }

  /**
   * Get vocabulary statistics
   */
  static async getStats() {
    const allVocabs = await db.select().from(vocabularies);

    const byLanguage: Record<string, number> = {};
    const byDifficulty: Record<string, number> = {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
    };

    allVocabs.forEach((vocab) => {
      // Count by language
      byLanguage[vocab.language] = (byLanguage[vocab.language] || 0) + 1;

      // Count by difficulty
      const difficulty = vocab.difficulty || 'intermediate';
      byDifficulty[difficulty] = (byDifficulty[difficulty] || 0) + 1;
    });

    return {
      total: allVocabs.length,
      byLanguage,
      byDifficulty,
    };
  }

  /**
   * Get vocabularies by language
   */
  static async getByLanguage(language: string, limit = 100, offset = 0) {
    const results = await db
      .select()
      .from(vocabularies)
      .where(eq(vocabularies.language, language))
      .orderBy(desc(vocabularies.createdAt))
      .limit(limit)
      .offset(offset);

    return results;
  }

  /**
   * Bulk create vocabularies
   */
  static async bulkCreate(inputs: CreateVocabularyInput[]) {
    const results = await db
      .insert(vocabularies)
      .values(
        inputs.map((input) => ({
          ...input,
          difficulty: input.difficulty || 'intermediate',
          updatedAt: new Date(),
        }))
      )
      .returning();

    return results;
  }
}
