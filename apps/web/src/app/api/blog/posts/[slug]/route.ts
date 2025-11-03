import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug } from '@/services/posts';
import { POST_STATUS } from '@/types/enums';
import { NotFoundError } from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    // Only return published posts for public API
    if (post.status !== POST_STATUS.PUBLISHED) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
