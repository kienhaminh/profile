import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminOrThrow } from '@/lib/auth';
import { FlashcardService } from '@/services/flashcard';

/**
 * POST /api/admin/flashcards/[id]/practice
 * Record practice session results
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdminOrThrow(request);
    const { id } = await params;
    const body = await request.json();

    if (!body.results || !Array.isArray(body.results)) {
      return NextResponse.json(
        { error: 'results must be an array of {vocabularyId, wasCorrect}' },
        { status: 400 }
      );
    }

    const sessions = await FlashcardService.recordPracticeSession(id, body.results);

    return NextResponse.json({
      message: 'Practice session recorded successfully',
      count: sessions.length,
    });
  } catch (error) {
    console.error('Error recording practice session:', error);
    return NextResponse.json(
      { error: 'Failed to record practice session' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

/**
 * GET /api/admin/flashcards/[id]/practice
 * Get practice statistics for a flashcard
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdminOrThrow(request);
    const { id } = await params;

    const stats = await FlashcardService.getPracticeStats(id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching practice stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch practice statistics' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
