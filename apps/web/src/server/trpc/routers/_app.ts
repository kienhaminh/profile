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
import {
  createChatSession,
  getChatSession,
  getChatMessages,
  processChatMessage,
  getRecentChatSessions,
} from '@/services/chat';

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

  // Chat router
  chat: router({
    // Create a new chat session
    createSession: publicProcedure
      .input(
        z.object({
          visitorId: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          return await createChatSession(input.visitorId);
        } catch (error) {
          logger.error('Error in chat.createSession mutation', {
            error,
            input,
          });
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to create chat session',
            cause: error,
          });
        }
      }),

    // Get a chat session by ID
    getSession: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
        })
      )
      .query(async ({ input }) => {
        try {
          const session = await getChatSession(input.sessionId);
          if (!session) {
            throw new NotFoundError('Chat session not found');
          }
          return session;
        } catch (error) {
          if (error instanceof NotFoundError) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Chat session not found',
              cause: error,
            });
          }
          logger.error('Error in chat.getSession query', { error, input });
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to get chat session',
            cause: error,
          });
        }
      }),

    // Get messages for a session
    getMessages: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          limit: z.number().min(1).max(200).default(100),
        })
      )
      .query(async ({ input }) => {
        try {
          return await getChatMessages(input.sessionId, input.limit);
        } catch (error) {
          logger.error('Error in chat.getMessages query', { error, input });
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to get chat messages',
            cause: error,
          });
        }
      }),

    // Send a message and get AI response
    sendMessage: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          message: z.string().min(1).max(2000),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const response = await processChatMessage(
            input.sessionId,
            input.message
          );
          return { response };
        } catch (error) {
          logger.error('Error in chat.sendMessage mutation', { error, input });
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to process chat message',
            cause: error,
          });
        }
      }),

    // Get recent chat sessions (for admin/analytics)
    getRecentSessions: publicProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(50).default(10),
        })
      )
      .query(async ({ input }) => {
        try {
          return await getRecentChatSessions(input.limit);
        } catch (error) {
          logger.error('Error in chat.getRecentSessions query', {
            error,
            input,
          });
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message:
              error instanceof Error
                ? error.message
                : 'Failed to get recent chat sessions',
            cause: error,
          });
        }
      }),
  }),
});

// Export type for client
export type AppRouter = typeof appRouter;
