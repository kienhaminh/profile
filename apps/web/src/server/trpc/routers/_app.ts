import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import type { Tag } from '@/types/tag';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Define the appRouter
export const appRouter = router({
  // Health check procedure
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: Date.now() };
  }),
  
  // Blog router
  blog: router({
    posts: publicProcedure
      .input(
        z
          .object({
            topic: z.string().optional(),
            limit: z.number().optional(),
          })
          .optional()
      )
      .query(
        async (): Promise<
          Array<{
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        publishDate: string | null;
        topics: Array<{ id: string; name: string }>;
          }>
        > => {
        // For now, return empty array
        // TODO: Implement actual blog fetching logic
        return [];
        }
      ),
  }),

  // Projects router
  projects: router({
    byId: publicProcedure.input(z.object({ id: z.string() })).query(
      async (): Promise<{
        id: string;
        title: string;
        slug: string;
        description: string;
        status: string;
        images: string[];
        githubUrl: string | null;
        liveUrl: string | null;
        startDate: string | null;
        endDate: string | null;
        isOngoing: boolean;
        tags: Tag[];
      } | null> => {
        // For now, return null
        // TODO: Implement actual project fetching logic
        return null;
      }
    ),
  }),

  // Tags router
  tags: router({
    list: publicProcedure.query(
      async (): Promise<
        Array<{
          id: string;
          slug: string;
          label: string;
          description: string | null;
        }>
      > => {
        // TODO: Implement actual tags fetching logic
        return [];
      }
    ),
    create: publicProcedure
      .input(z.object({ label: z.string(), slug: z.string() }))
      .mutation(
        async (): Promise<{
          id: string;
          slug: string;
          label: string;
          description: string | null;
        }> => {
          // TODO: Implement actual tag creation logic
          throw new Error('Not implemented');
        }
      ),
  }),
});

// Export type for client
export type AppRouter = typeof appRouter;
