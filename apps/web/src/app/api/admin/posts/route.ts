import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPosts, createPost, type PostStatus } from '@/services/posts';
import { ensureAdminOrThrow } from '@/lib/admin-auth';

// Zod schema for post validation
const postSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase and contain only letters, numbers, and hyphens'
    ),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  coverImage: z
    .string()
    .url('Cover image must be a valid URL')
    .optional()
    .or(z.literal('')),
  topics: z.array(z.string()).optional().default([]),
  publishDate: z
    .string()
    .datetime('Publish date must be a valid datetime')
    .optional()
    .or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']),
});

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

export async function POST(request: NextRequest) {
  try {
    // Ensure admin authentication and authorization
    await ensureAdminOrThrow(request);

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Validate request body with Zod schema
    const validationResult = postSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const {
      title,
      slug,
      content,
      excerpt,
      status,
      publishDate,
      coverImage,
      topics,
    } = validationResult.data;

    // Parse and validate publishDate if provided
    let validatedPublishDate: Date | undefined;
    if (publishDate) {
      const date = new Date(publishDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Invalid publishDate format. Please provide a valid date.' },
          { status: 400 }
        );
      }
      validatedPublishDate = date;
    }

    const post = await createPost({
      title,
      slug,
      content,
      excerpt,
      status: status as PostStatus,
      publishDate: validatedPublishDate,
      coverImage,
      topics: topics || [],
      authorId: adminId,
    });

    return NextResponse.json(post, { status: 201 });
  } catch {
    console.error('Error creating post');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
