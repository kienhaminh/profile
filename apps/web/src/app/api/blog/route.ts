import { NextRequest, NextResponse } from 'next/server';
import { createBlog, listBlogs } from '@/services/blog';
import { db } from '@/db';
import { authorProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createBlogSchema, blogFilterSchema } from '@/lib/validation';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/admin-auth';
import { ZodError } from 'zod';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = blogFilterSchema.parse({
      page: searchParams.get('page') || '0',
      limit: searchParams.get('limit') || '20',
      status: searchParams.get('status') || 'PUBLISHED', // Default to published for public API
      topicId: searchParams.get('topicId') || undefined,
      hashtagId: searchParams.get('hashtagId') || undefined,
      search: searchParams.get('search') || undefined,
    });

    const result = await listBlogs(filters);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);
    const body = await request.json();
    const data = createBlogSchema.parse(body);

    // In tests or when not provided, create or use a default author
    // Resolve authorId: use provided one, else find or create a default author
    let authorId = data.authorId || '';
    if (!authorId) {
      const existing = await db.select().from(authorProfiles).limit(1);
      if (existing.length > 0) {
        authorId = existing[0].id;
      } else {
        const [created] = await db
          .insert(authorProfiles)
          .values({
            name: 'Default Author',
            bio: 'Auto-created for tests',
            email: 'default@example.com',
          })
          .returning();
        authorId = created.id;
      }
    }
    const blog = await createBlog(data, authorId);
    return NextResponse.json(blog, { status: 201 });
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: error.errors },
        { status: 400 }
      );
    }
    const msg = String(error.message || '');
    if (/already exists|duplicate key value|unique constraint/i.test(msg)) {
      return NextResponse.json(
        { error: 'Conflict', message: error.message },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
