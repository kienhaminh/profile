import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts } from '@/services/posts';
import { ensureAdminOrThrow } from '@/lib/auth';
import { POST_STATUS_VALUES, type PostStatus } from '@/types/enums';

export async function GET(request: NextRequest) {
  try {
    // Ensure admin authentication and authorization
    await ensureAdminOrThrow(request);

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

    // Validate status parameter
    let validatedStatus: PostStatus | undefined;
    if (statusParam) {
      if (!POST_STATUS_VALUES.includes(statusParam as PostStatus)) {
        return NextResponse.json(
          {
            error: `Invalid status parameter. Must be one of: ${POST_STATUS_VALUES.join(', ')}`,
          },
          { status: 400 }
        );
      }
      validatedStatus = statusParam as PostStatus;
    }

    const posts = await getAllPosts(validatedStatus);

    return NextResponse.json(posts);
  } catch {
    console.error('Error fetching posts');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
