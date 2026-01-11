/**
 * Admin Shortlinks API Route
 *
 * GET /api/admin/shortlinks - Get all shortlinks
 * POST /api/admin/shortlinks - Create a new shortlink
 *
 * Replaces server actions for client-side fetching.
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractAdminTokenFromHeaders, verifyAdminToken } from '@/lib/auth';
import { db } from '@/db/client';
import { shortlinks } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const token = extractAdminTokenFromHeaders(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      verifyAdminToken(token);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allShortlinks = await db
      .select()
      .from(shortlinks)
      .orderBy(desc(shortlinks.createdAt));

    return NextResponse.json({ shortlinks: allShortlinks });
  } catch (error) {
    console.error('Error fetching shortlinks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shortlinks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const token = extractAdminTokenFromHeaders(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      verifyAdminToken(token);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { slug, destinationUrl, title, password, expiresAt, isActive } = body;

    // Generate slug if not provided
    const finalSlug = slug || nanoid(6);

    // Check if slug already exists
    const existing = await db
      .select()
      .from(shortlinks)
      .where(eq(shortlinks.slug, finalSlug))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const [newShortlink] = await db
      .insert(shortlinks)
      .values({
        slug: finalSlug,
        destinationUrl,
        title,
        password,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive ?? true,
        clickCount: 0,
      })
      .returning();

    return NextResponse.json({ success: true, shortlink: newShortlink });
  } catch (error) {
    console.error('Error creating shortlink:', error);
    return NextResponse.json(
      { error: 'Failed to create shortlink' },
      { status: 500 }
    );
  }
}
