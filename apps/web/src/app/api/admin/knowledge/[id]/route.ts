import { NextRequest, NextResponse } from 'next/server';
import { ensureAdminOrThrow } from '@/lib/auth';
import { KnowledgeExtractionService } from '@/services/knowledge-extraction';

/**
 * GET /api/admin/knowledge/[id]
 * Get a single knowledge entry
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure admin authentication
    await ensureAdminOrThrow(request);

    const { id } = await params;
    const entry = await KnowledgeExtractionService.getEntryById(id);

    if (!entry) {
      return NextResponse.json(
        { error: 'Knowledge entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error fetching knowledge entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge entry' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/knowledge/[id]
 * Delete a knowledge entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure admin authentication
    await ensureAdminOrThrow(request);

    const { id } = await params;

    // Check if entry exists
    const entry = await KnowledgeExtractionService.getEntryById(id);
    if (!entry) {
      return NextResponse.json(
        { error: 'Knowledge entry not found' },
        { status: 404 }
      );
    }

    // Delete the entry
    await KnowledgeExtractionService.deleteEntry(id);

    return NextResponse.json({
      success: true,
      message: 'Knowledge entry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting knowledge entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete knowledge entry' },
      { status: 500 }
    );
  }
}
