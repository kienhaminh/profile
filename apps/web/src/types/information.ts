import { z, type ZodType } from 'zod';

// Information is a singleton entity storing owner/site parameters
export interface Information {
  id: string;
  parameters: Record<string, unknown>;
  updatedAt: string;
}

export const informationSchema: ZodType<Information> = z.object({
  id: z.string().uuid(),
  parameters: z.record(z.string(), z.unknown()),
  updatedAt: z.string().min(1),
});

// Input/output DTOs
export interface UpdateInformationInput {
  parameters: Record<string, unknown>;
}

export const updateInformationInputSchema = z.object({
  parameters: z.record(z.string(), z.unknown()),
});
