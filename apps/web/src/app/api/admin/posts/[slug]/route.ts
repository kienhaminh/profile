import { NextRequest, NextResponse } from 'next/server';
import { ZodError, type ZodIssue } from 'zod';
import {
  updatePost,
  deletePost,
  type PostStatus,
  type UpdatePostData,
} from '@/services/posts';
import { ensureAdminOrThrow } from '@/lib/admin-auth';
import { updatePostSchema } from '@/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Ensure admin authentication and authorization
    await ensureAdminOrThrow(request);

    const { slug } = await params;
    const body = await request.json();

    // Validate the request body using Zod schema
    let validatedData;
    try {
      validatedData = updatePostSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            details: (error as ZodError).issues.map((err: ZodIssue) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Build updateData from validated values with proper type conversion
    const updateData: UpdatePostData = {};
    if (validatedData.title !== undefined)
      updateData.title = validatedData.title;
    if (validatedData.content !== undefined)
      updateData.content = validatedData.content;
    if (validatedData.excerpt !== undefined)
      updateData.excerpt = validatedData.excerpt;
    if (validatedData.status !== undefined) {
      // Runtime validation: ensure status is one of the allowed PostStatus values
      const validStatuses = ['draft', 'published', 'archived'] as const;
      if (!validStatuses.includes(validatedData.status)) {
        return NextResponse.json(
          {
            error:
              'Invalid status value. Must be one of: draft, published, archived',
          },
          { status: 400 }
        );
      }
      updateData.status = validatedData.status as PostStatus;
    }
    if (validatedData.publishDate !== undefined) {
      updateData.publishDate = new Date(validatedData.publishDate);
    }
    if (validatedData.coverImage !== undefined)
      updateData.coverImage = validatedData.coverImage;
    if (validatedData.topics !== undefined)
      updateData.topics = validatedData.topics;

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
    // Ensure admin authentication and authorization
    await ensureAdminOrThrow(request);

    const { slug } = await params;
    const success = await deletePost(slug);

    if (!success) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
