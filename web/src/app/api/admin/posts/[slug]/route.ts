import { NextRequest, NextResponse } from 'next/server';
import {
  updatePost,
  deletePost,
  type PostStatus,
  type UpdatePostData,
} from '@/services/posts';

// Mock auth middleware - in real app, use JWT verification
function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { title, content, excerpt, status, publishDate, coverImage, topics } =
      body;

    const updateData: UpdatePostData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (status !== undefined) updateData.status = status as PostStatus;
    if (publishDate !== undefined)
      updateData.publishDate = new Date(publishDate);
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (topics !== undefined) updateData.topics = topics;

    const post = await updatePost(slug, updateData);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const success = await deletePost(slug);

    if (!success) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
