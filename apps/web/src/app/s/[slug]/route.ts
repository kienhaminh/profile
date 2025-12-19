/**
 * Public Shortlink Redirect Route
 *
 * Handles public access to shortlinks. Validates the slug, checks if active
 * and not expired, increments click count, and redirects to destination URL.
 */

import { redirect } from 'next/navigation';
import { resolveShortlink, incrementClickCount } from '@/actions/shortlinks';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Resolve the shortlink
  const result = await resolveShortlink(slug);

  if (!result.success) {
    // Return 404 for invalid, inactive, or expired links
    return new Response(result.error || 'Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Handle password-protected links (redirect to password page)
  if (result.requiresPassword) {
    return redirect(`/s/${slug}/verify`);
  }

  // Increment click count (fire and forget)
  incrementClickCount(slug);

  // Redirect to destination
  return redirect(result.destinationUrl!);
}
