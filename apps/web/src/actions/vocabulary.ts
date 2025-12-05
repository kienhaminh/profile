'use server';

import { db } from '@/db/client';
import { vocabularies, vocabularyRelations } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getVocabularies(language?: string) {
  try {
    const conditions = language
      ? eq(vocabularies.language, language)
      : undefined;
    const data = await db.query.vocabularies.findMany({
      where: conditions,
      orderBy: [desc(vocabularies.createdAt)],
      with: {
        outgoingRelations: {
          with: {
            target: true,
          },
        },
        incomingRelations: {
          with: {
            source: true,
          },
        },
      },
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching vocabularies:', error);
    return { success: false, error: 'Failed to fetch vocabularies' };
  }
}

export async function createVocabulary(data: {
  word: string;
  meaning: string;
  language: string;
  partOfSpeech?: string;
  example?: string;
  pronunciation?: string;
}) {
  try {
    await db.insert(vocabularies).values(data);
    revalidatePath('/admin/vocabulary');
    return { success: true };
  } catch (error) {
    console.error('Error creating vocabulary:', error);
    return { success: false, error: 'Failed to create vocabulary' };
  }
}

export async function deleteVocabulary(id: string) {
  try {
    await db.delete(vocabularies).where(eq(vocabularies.id, id));
    revalidatePath('/admin/vocabulary');
    return { success: true };
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    return { success: false, error: 'Failed to delete vocabulary' };
  }
}
