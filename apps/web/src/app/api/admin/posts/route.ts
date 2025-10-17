import { NextRequest, NextResponse } from 'next/server';
import { getPosts, type PostStatus } from '@/services/posts';
import { ensureAdminOrThrow } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // Ensure admin authentication and authorization
    await ensureAdminOrThrow(request);

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const topic = searchParams.get('topic');
    const limit = Math.min(
      Math.max(parseInt(searchParams.get('limit') || '10', 10) || 10, 1),
      100
    );
    const offset = Math.max(
      parseInt(searchParams.get('offset') || '0', 10) || 0,
      0
    );

    // Validate status parameter
    let validatedStatus: PostStatus | undefined;
    if (statusParam) {
      const validStatuses: PostStatus[] = ['draft', 'published', 'archived'];
      if (!validStatuses.includes(statusParam as PostStatus)) {
        return NextResponse.json(
          {
            error: `Invalid status parameter. Must be one of: ${validStatuses.join(', ')}`,
          },
          { status: 400 }
        );
      }
      validatedStatus = statusParam as PostStatus;
    }

    const posts = await getPosts({
      status: validatedStatus,
      topic: topic || undefined,
      limit,
      offset,
    });

    return NextResponse.json(posts);
  } catch {
    console.error('Error fetching posts');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
