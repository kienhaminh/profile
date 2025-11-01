import { NextRequest, NextResponse } from 'next/server';
import { getAllTags, createTag, searchTags } from '@/services/tags';
import { ConflictError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    const tags = query ? await searchTags(query) : await getAllTags();

    return NextResponse.json(tags);
  } catch (error) {
    logger.error('Error in GET /api/tags', { error });
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const tag = await createTag(body);

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    if (error instanceof ConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    logger.error('Error in POST /api/tags', { error });
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
