import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminOrThrow } from '@/lib/auth';
import { FlashcardService } from '@/services/flashcard';

/**
 * POST /api/admin/flashcards/[id]/vocabularies
 * Add vocabularies to a flashcard set
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdminOrThrow(request);
    const { id } = await params;
    const body = await request.json();

    if (!body.vocabularyIds || !Array.isArray(body.vocabularyIds)) {
      return NextResponse.json(
        { error: 'vocabularyIds must be an array' },
        { status: 400 }
      );
    }

    const results = await FlashcardService.addVocabularies(id, body.vocabularyIds);

    return NextResponse.json({
      message: 'Vocabularies added successfully',
      count: results.length,
    });
  } catch (error) {
    console.error('Error adding vocabularies to flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to add vocabularies to flashcard' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

/**
 * DELETE /api/admin/flashcards/[id]/vocabularies
 * Remove vocabularies from a flashcard set
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdminOrThrow(request);
    const { id } = await params;
    const body = await request.json();

    if (!body.vocabularyIds || !Array.isArray(body.vocabularyIds)) {
      return NextResponse.json(
        { error: 'vocabularyIds must be an array' },
        { status: 400 }
      );
    }

    const results = await FlashcardService.removeVocabularies(id, body.vocabularyIds);

    return NextResponse.json({
      message: 'Vocabularies removed successfully',
      count: results.length,
    });
  } catch (error) {
    console.error('Error removing vocabularies from flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to remove vocabularies from flashcard' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
