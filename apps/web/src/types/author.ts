import { z, type ZodType } from 'zod';

export interface Author {
  id: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  socialLinks: Record<string, string>;
  email: string | null;
}

const socialLinksSchema = z
  .record(z.string(), z.string())
  .default({})
  .transform((links) => links ?? {});

export const authorSchema: ZodType<Author> = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  bio: z.string().nullable().default(null),
  avatar: z.string().nullable().default(null),
  socialLinks: socialLinksSchema,
  email: z.string().email().nullable().default(null),
});
