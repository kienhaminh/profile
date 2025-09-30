import { NextRequest, NextResponse } from 'next/server';
import { getPosts, createPost, type PostStatus } from '@/services/posts';

// Mock auth middleware - in real app, use JWT verification
function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const topic = searchParams.get('topic');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const posts = await getPosts({
      status: statusParam ? (statusParam as PostStatus) : undefined,
      topic: topic || undefined,
      limit,
      offset,
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      status,
      publishDate,
      coverImage,
      topics,
    } = body;

    if (!title || !slug || !content || !status) {
      return NextResponse.json(
        { error: 'Title, slug, content, and status are required' },
        { status: 400 }
      );
    }

    // For now, use a default author ID - in real app, get from token
    const authorId = 'default-author';

    const post = await createPost({
      title,
      slug,
      content,
      excerpt,
      status: status as PostStatus,
      publishDate: publishDate ? new Date(publishDate) : undefined,
      coverImage,
      topics: topics || [],
      authorId,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
