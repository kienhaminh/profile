import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminOrThrow } from '@/lib/auth';
import { FlashcardService } from '@/services/flashcard';

/**
 * GET /api/admin/flashcards
 * List all flashcard sets
 */
export async function GET(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    const limit = limitParam ? Math.max(1, Number(limitParam)) : 100;
    const offset = offsetParam ? Math.max(0, Number(offsetParam)) : 0;

    const flashcards = await FlashcardService.getAll(limit, offset);

    return NextResponse.json({
      items: flashcards,
      pagination: {
        limit,
        offset,
        total: flashcards.length,
      },
    });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcards' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

/**
 * POST /api/admin/flashcards
 * Create a new flashcard set
 */
export async function POST(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.language) {
      return NextResponse.json(
        { error: 'Missing required fields: name and language are required' },
        { status: 400 }
      );
    }

    const flashcard = await FlashcardService.create({
      name: body.name,
      description: body.description,
      language: body.language,
      isActive: body.isActive,
    });

    return NextResponse.json(flashcard, { status: 201 });
  } catch (error) {
    console.error('Error creating flashcard:', error);
    return NextResponse.json(
      { error: 'Failed to create flashcard' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
