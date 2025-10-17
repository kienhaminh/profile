import { NextRequest, NextResponse } from 'next/server';
import { createBlog } from '@/services/blog';
import { db } from '@/db';
import { authorProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createBlogSchema } from '@/lib/validation';
import { ensureAdminOrThrow, UnauthorizedError } from '@/lib/admin-auth';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    await ensureAdminOrThrow(request);
    const body = await request.json();
    const data = createBlogSchema.parse(body);

    // In tests or when not provided, create or use a default author
    // Resolve authorId: use provided one, else find or create a default author
    let authorId = data.authorId || '';
    if (!authorId) {
      const existing = await db
        .select()
        .from(authorProfiles)
        .where(eq(authorProfiles.email, 'default@example.com'))
        .limit(1);

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
          .onConflictDoNothing()
          .returning();

        if (created) {
          authorId = created.id;
        } else {
          // Conflict occurred, fetch the existing one
          const [existingAfterConflict] = await db
            .select()
            .from(authorProfiles)
            .where(eq(authorProfiles.email, 'default@example.com'))
            .limit(1);

          if (!existingAfterConflict) {
            throw new Error('Failed to find or create default author profile');
          }

          authorId = existingAfterConflict.id;
        }
      }
    }
    const blog = await createBlog(data, authorId);
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: error.issues },
        { status: 400 }
      );
    }
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred';

    // Check for PostgreSQL unique constraint violation (error code 23505)
    const isUniqueConstraintViolation =
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === '23505';

    if (isUniqueConstraintViolation) {
      return NextResponse.json(
        { error: 'Conflict', message: errorMessage },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error', message: errorMessage },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
