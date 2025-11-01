import { z, type ZodType } from 'zod';

export interface User {
  id: string;
  username: string;
  email: string | null;
  role: string;
  createdAt: string;
  lastLogin: string | null;
}

export const userSchema: ZodType<User> = z.object({
  id: z.string().uuid(),
  username: z.string().min(1),
  email: z.string().email().nullable().default(null),
  role: z.string().min(1),
  createdAt: z.string().min(1),
  lastLogin: z.string().nullable().default(null),
});

// Input/output DTOs
export interface CreateUserInput {
  username: string;
  email?: string | null;
  password: string;
  role?: string;
}

export const createUserInputSchema = z.object({
  username: z.string().min(1),
  email: z.string().email().nullable().optional(),
  password: z.string().min(8),
  role: z.string().optional(),
});

export interface UpdateUserInput {
  username?: string;
  email?: string | null;
  password?: string;
  role?: string;
  lastLogin?: string;
}

export const updateUserInputSchema = z.object({
  username: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  password: z.string().min(8).optional(),
  role: z.string().optional(),
  lastLogin: z.string().optional(),
});
