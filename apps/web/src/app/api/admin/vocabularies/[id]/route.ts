import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminOrThrow } from '@/lib/auth';
import { VocabularyService } from '@/services/vocabulary';

/**
 * GET /api/admin/vocabularies/[id]
 * Get a specific vocabulary by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdminOrThrow(request);
    const { id } = await params;

    const vocabulary = await VocabularyService.getById(id);

    if (!vocabulary) {
      return NextResponse.json({ error: 'Vocabulary not found' }, { status: 404 });
    }

    return NextResponse.json(vocabulary);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

/**
 * PATCH /api/admin/vocabularies/[id]
 * Update a vocabulary
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdminOrThrow(request);
    const { id } = await params;
    const body = await request.json();

    const vocabulary = await VocabularyService.update(id, {
      word: body.word,
      language: body.language,
      meaning: body.meaning,
      translation: body.translation,
      pronunciation: body.pronunciation,
      example: body.example,
      partOfSpeech: body.partOfSpeech,
      difficulty: body.difficulty,
      notes: body.notes,
    });

    if (!vocabulary) {
      return NextResponse.json({ error: 'Vocabulary not found' }, { status: 404 });
    }

    return NextResponse.json(vocabulary);
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to update vocabulary' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

/**
 * DELETE /api/admin/vocabularies/[id]
 * Delete a vocabulary
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdminOrThrow(request);
    const { id } = await params;

    const vocabulary = await VocabularyService.delete(id);

    if (!vocabulary) {
      return NextResponse.json({ error: 'Vocabulary not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Vocabulary deleted successfully' });
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to delete vocabulary' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
