import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPost } from '@/services/posts';
import { ensureAdminOrThrow, verifyAdminToken } from '@/lib/admin-auth';
import { type PostStatus } from '@/types/enums';

/**
 * Extracts the admin ID from the request token
 */
function getAdminIdFromRequest(request: NextRequest): string {
  // First, try to get token from httpOnly cookie (preferred method)
  const cookieToken = request.cookies.get('admin-token')?.value || '';

  // Fallback to Authorization header for backward compatibility
  const headerAuth = request.headers.get('authorization') || '';
  const headerToken = request.headers.get('x-admin-token') || '';

  const bearerToken = headerAuth.toLowerCase().startsWith('bearer ')
    ? headerAuth.slice(7)
    : '';

  const token = cookieToken || bearerToken || headerToken;
  const configuredToken = process.env.ADMIN_API_TOKEN || '';

  // Allow either a configured static token, or a mock token returned by /api/admin/login
  if (!token) {
    throw new Error('Missing admin token');
  }

  if (configuredToken && token === configuredToken) {
    // For configured static tokens, we can't determine the admin ID from the token
    // This should not happen in normal operation since ensureAdminOrThrow would have failed
    throw new Error('Cannot determine admin ID from static token');
  }

  // Verify JWT token and extract admin ID
  const decoded = verifyAdminToken(token);
  return decoded.adminId;
}

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
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

export async function POST(request: NextRequest) {
  try {
    // Ensure admin authentication and authorization
    await ensureAdminOrThrow(request);

    // Get the admin ID from the request token
    const adminId = getAdminIdFromRequest(request);

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

export const runtime = 'nodejs';
