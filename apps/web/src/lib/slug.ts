import slugify from 'slugify';

/**
 * Maximum allowed length for generated slugs to prevent excessively long URLs
 */
export const MAX_SLUG_LENGTH = 60;

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

  // Preprocess: Remove ASCII special characters but preserve non-Latin characters for transliteration
  const cleanInput = input
    .replace(/[!@#$%^&*()_+{}|:<>?[\]\\;"',.]/g, '') // Remove ASCII special characters
    .toLowerCase();

  // First try: Use slugify with transliteration for non-Latin characters
  let slug = slugify(cleanInput, {
    lower: true,
    strict: true,
    locale: 'en',
    trim: true,
  });

  // If slug is empty after transliteration, try basic fallback
  if (!slug.trim()) {
    // Basic fallback: replace spaces with dashes and remove non-alphanumeric chars
    slug = cleanInput
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') // Keep letters, numbers, and dashes
      .replace(/-+/g, '-') // Replace multiple dashes with single dash
      .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
  }

  // Final fallback: if still empty, use 'untitled' or return empty based on allowEmpty
  if (!slug.trim()) {
    return allowEmpty ? '' : 'untitled';
  }

  // Truncate to MAX_SLUG_LENGTH and ensure no trailing hyphens
  if (slug.length > MAX_SLUG_LENGTH) {
    slug = slug.substring(0, MAX_SLUG_LENGTH);
    // Remove trailing hyphens that might result from truncation
    slug = slug.replace(/-+$/, '');
    // If truncation resulted in empty string, use fallback
    if (!slug.trim()) {
      slug = allowEmpty ? '' : 'untitled';
    }
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
  return Boolean(slug && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug));
}
/**
 * Generates a unique slug by checking against existing slugs and appending numbers if needed
 *
 * @param input - The string to convert to a slug
 * @param existingSlugs - Array of existing slugs to check against
 * @param options - Options for slug generation
 * @returns A unique URL-safe slug string
 */
export async function generateUniqueSlug(
  input: string,
  existingSlugs: string[] = [],
  options: {
    /** Whether to allow empty slugs (for backend generation) */
    allowEmpty?: boolean;
  } = {}
): Promise<string> {
  const { allowEmpty = false } = options;

  if (!input || typeof input !== 'string') {
    return allowEmpty ? '' : 'untitled';
  }

  // Start with the base slug
  const slug = generateSlug(input, { allowEmpty });

  // If no existing slugs to check against, return the base slug
  if (existingSlugs.length === 0) {
    return slug;
  }

  // Check if the base slug is already taken
  if (!existingSlugs.includes(slug)) {
    return slug;
  }

  // If base slug is taken, try appending numbers until we find a unique one
  let counter = 1;
  let uniqueSlug = `${slug}-${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${slug}-${counter}`;

    // Prevent infinite loops with a reasonable upper limit
    if (counter > 1000) {
      // Fallback: append timestamp for extremely rare edge cases
      uniqueSlug = `${slug}-${Date.now()}`;
      break;
    }
  }

  return uniqueSlug;
}

/**
 * Generates unique slugs for multiple inputs, ensuring no collisions within the batch
 *
 * @param inputs - Array of strings to convert to slugs
 * @param existingSlugs - Array of existing slugs to check against
 * @param options - Options for slug generation
 * @returns Array of unique slug strings in the same order as inputs
 */
export async function generateUniqueSlugs(
  inputs: string[],
  existingSlugs: string[] = [],
  options: {
    /** Whether to allow empty slugs (for backend generation) */
    allowEmpty?: boolean;
  } = {}
): Promise<string[]> {
  const slugs: string[] = [];
  const usedSlugs = new Set(existingSlugs);

  for (const input of inputs) {
    const slug = await generateUniqueSlug(
      input,
      Array.from(usedSlugs),
      options
    );
    slugs.push(slug);
    usedSlugs.add(slug);
  }

  return slugs;
}
