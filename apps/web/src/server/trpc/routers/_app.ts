import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import type { BlogListItem } from '@/types/blog';
import { listBlogsInputSchema } from '@/types/blog';
import { createTagInputSchema } from '@/types/tag';
import type { Project } from '@/types/project';
import { getAllTags, createTag } from '@/services/tags';
import { listBlogs } from '@/services/blog';
import { getProjectById } from '@/services/projects';
import { POST_STATUS } from '@/types/enums';
import { NotFoundError } from '@/lib/errors';
import { logger } from '@/lib/logger';

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        code: shape.data.code,
      },
    };
  },
});

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
      .input(listBlogsInputSchema)
      .query(async (opts): Promise<BlogListItem[]> => {
        try {
          const { input } = opts;
          // Always filter to show only published posts on the public blog page
          const blogsPage = await listBlogs(POST_STATUS.PUBLISHED, {
            page: 1,
            limit: input?.limit,
          });
          const blogs = blogsPage.data;

          // Transform blogs to match expected return type
          return blogs.map((blog) => ({
            id: blog.id,
            title: blog.title,
            slug: blog.slug,
            status: blog.status,
            publishDate: blog.publishDate,
            excerpt: blog.excerpt,
            readTime: blog.readTime,
            coverImage: blog.coverImage,
            author: blog.author,
            tags: blog.tags.map((tag) => ({
              id: tag.id,
              slug: tag.slug,
              label: tag.label,
              description: tag.description,
              createdAt: tag.createdAt,
              updatedAt: tag.updatedAt,
            })),
          }));
        } catch (error) {
          logger.error('Error in blog.posts query', { error });
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to fetch blog posts',
            cause: error,
          });
        }
      }),
  }),

  // Projects router
  projects: router({
    byId: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async (opts): Promise<Project | null> => {
        const { input } = opts;
        try {
          return await getProjectById(input.id);
        } catch (error) {
          // If project not found, return null instead of throwing
          if (error instanceof NotFoundError) {
            return null;
          }
          throw error;
        }
      }),
  }),

  // Tags router
  tags: router({
    list: publicProcedure.query(async () => {
      try {
        return await getAllTags();
      } catch (error) {
        logger.error('Error in tags.list query', { error });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            error instanceof Error ? error.message : 'Failed to fetch tags',
          cause: error,
        });
      }
    }),
    create: publicProcedure
      .input(createTagInputSchema)
      .mutation(async ({ input }) => {
        try {
          return await createTag(input);
        } catch (error) {
          logger.error('Error in tags.create mutation', { error, input });
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              error instanceof Error ? error.message : 'Failed to create tag',
            cause: error,
          });
        }
      }),
  }),
});

// Export type for client
export type AppRouter = typeof appRouter;
