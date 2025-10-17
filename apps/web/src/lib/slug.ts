import slugify from 'slugify';

/**
 * Generates a URL-safe slug from a given string using transliteration
 *
 * @param input - The string to convert to a slug
 * @param options - Options for slug generation
 * @returns A URL-safe slug string
 */
export function generateSlug(
  input: string,
  options: {
    /** Whether to allow empty slugs (for backend generation) */
    allowEmpty?: boolean;
  } = {}
): string {
  const { allowEmpty = false } = options;

  if (!input || typeof input !== 'string') {
    return allowEmpty ? '' : 'untitled';
  }

  // First try: Use slugify with transliteration for non-Latin characters
  let slug = slugify(input, {
    lower: true,
    strict: true,
    locale: 'en',
    trim: true,
  });

  // If slug is empty after transliteration, try basic fallback
  if (!slug.trim()) {
    // Basic fallback: replace spaces with dashes and remove non-alphanumeric chars
    slug = input
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\s-]/g, '') // Keep letters, numbers, spaces, and dashes
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/-+/g, '-') // Replace multiple dashes with single dash
      .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
  }

  // Final fallback: if still empty, use 'untitled' or return empty based on allowEmpty
  if (!slug.trim()) {
    return allowEmpty ? '' : 'untitled';
  }

  return slug;
}

/**
 * Validates if a slug is valid (non-empty and contains only allowed characters)
 *
 * @param slug - The slug to validate
 * @returns True if the slug is valid
 */
export function isValidSlug(slug: string): boolean {
  return Boolean(slug && /^[a-z0-9-]+$/.test(slug));
}
