import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminOrThrow } from '@/lib/auth';
import { FlashcardService } from '@/services/flashcard';

/**
 * GET /api/admin/flashcards/stats
 * Get flashcard statistics
 */
export async function GET(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);

    const stats = await FlashcardService.getStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching flashcard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcard statistics' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
