import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminOrThrow } from '@/lib/auth';
import { KnowledgeExtractionService } from '@/services/knowledge-extraction';

/**
 * GET /api/admin/knowledge
 * List all knowledge entries
 */
export async function GET(request: NextRequest) {
  try {
    // Ensure admin authentication
    await ensureAdminOrThrow(request);

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    const limit = limitParam ? Math.max(1, Number(limitParam)) : 50;
    const offset = offsetParam ? Math.max(0, Number(offsetParam)) : 0;

    const entries = await KnowledgeExtractionService.getAllEntries(limit, offset);

    return NextResponse.json({
      items: entries,
      pagination: {
        limit,
        offset,
        total: entries.length,
      },
    });
  } catch (error) {
    console.error('Error fetching knowledge entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge entries' },
      { status: 500 }
    );
  }
}
