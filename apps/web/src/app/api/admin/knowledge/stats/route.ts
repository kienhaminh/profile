import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminOrThrow } from '@/lib/auth';
import { KnowledgeExtractionService } from '@/services/knowledge-extraction';

/**
 * GET /api/admin/knowledge/stats
 * Get knowledge extraction statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Ensure admin authentication
    await ensureAdminOrThrow(request);

    const stats = await KnowledgeExtractionService.getStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching knowledge stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
