import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminOrThrow } from '@/lib/auth';
import { VocabularyService } from '@/services/vocabulary';

/**
 * GET /api/admin/vocabularies/stats
 * Get vocabulary statistics
 */
export async function GET(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);

    const stats = await VocabularyService.getStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching vocabulary stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary statistics' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}
