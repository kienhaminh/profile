import slugify from 'slugify';

/**
 * Generates a URL-safe slug from a string
 */
export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
}

/**
 * Validates if a string is a valid slug
 */
export function isValidSlug(slug: string): boolean {
  // A valid slug contains only lowercase letters, numbers, and hyphens
  // Must not start or end with a hyphen
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length > 0;
}
