import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  listBlogs,
  getBlog,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  NotFoundError,
  ConflictError,
} from '@/services/blog';
import {
  blogFilterSchema,
  createBlogSchema,
  updateBlogSchema,
} from '@/lib/validation';
import { getPosts, POST_STATUS, POST_STATUS_VALUES } from '@/services/posts';
import { adminProcedure, publicProcedure, router } from '../init';

const blogListInput = z
  .object({
    page: z.number().int().min(0).optional(),
    limit: z.number().int().min(1).max(100).optional(),
    status: z.enum(POST_STATUS_VALUES as [string, ...string[]]).optional(),
    topicId: z.string().uuid().optional(),
    hashtagId: z.string().uuid().optional(),
    search: z.string().optional(),
  })
  .optional();

export const blogRouter = router({
  list: publicProcedure.input(blogListInput).query(async ({ input }) => {
    const filters = blogFilterSchema.parse({
      page: input?.page ?? 0,
      limit: input?.limit ?? 20,
      status: input?.status ?? POST_STATUS.PUBLISHED,
      topicId: input?.topicId,
      hashtagId: input?.hashtagId,
      search: input?.search,
    });

    return listBlogs(filters);
  }),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const blog = await getBlog(input.slug);
      if (!blog) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Blog post not found',
        });
      }
      return blog;
    }),
  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      try {
        return await getBlogById(input.id);
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch blog post',
        });
      }
    }),
  create: adminProcedure
    .input(createBlogSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await createBlog(input, ctx.adminId);
      } catch (error) {
        if (error instanceof ConflictError) {
          throw new TRPCError({ code: 'CONFLICT', message: error.message });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create blog post',
        });
      }
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: updateBlogSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await updateBlog(input.id, input.data);
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
        }
        if (error instanceof ConflictError) {
          throw new TRPCError({ code: 'CONFLICT', message: error.message });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update blog post',
        });
      }
    }),
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      try {
        await deleteBlog(input.id);
        return true;
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete blog post',
        });
      }
    }),
  posts: publicProcedure
    .input(
      z
        .object({
          topic: z.string().optional(),
          limit: z.number().int().min(1).max(100).optional(),
          offset: z.number().int().min(0).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return getPosts({
        status: POST_STATUS.PUBLISHED,
        topic: input?.topic,
        limit: input?.limit,
        offset: input?.offset,
      });
    }),
});
