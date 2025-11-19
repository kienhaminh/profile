import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminOrThrow } from '@/lib/auth';
import { VocabularyService } from '@/services/vocabulary';

/**
 * GET /api/admin/vocabularies
 * List all vocabularies with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const language = searchParams.get('language') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;
    const search = searchParams.get('search') || undefined;

    const limit = limitParam ? Math.max(1, Number(limitParam)) : 100;
    const offset = offsetParam ? Math.max(0, Number(offsetParam)) : 0;

    const vocabularies = await VocabularyService.getAll(
      { language, difficulty, search },
      limit,
      offset
    );

    return NextResponse.json({
      items: vocabularies,
      pagination: {
        limit,
        offset,
        total: vocabularies.length,
      },
    });
  } catch (error) {
    console.error('Error fetching vocabularies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabularies' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

/**
 * POST /api/admin/vocabularies
 * Create a new vocabulary entry
 */
export async function POST(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);

    const body = await request.json();

    // Validate required fields
    if (!body.word || !body.language || !body.meaning) {
      return NextResponse.json(
        { error: 'Missing required fields: word, language, and meaning are required' },
        { status: 400 }
      );
    }

    const vocabulary = await VocabularyService.create({
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

    return NextResponse.json(vocabulary, { status: 201 });
  } catch (error) {
    console.error('Error creating vocabulary:', error);
    return NextResponse.json(
      { error: 'Failed to create vocabulary' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
