import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createPost,
  deletePost,
  getPostBySlug,
  getPosts,
  updatePost,
  type PostStatus,
  type UpdatePostData,
} from '@/services/posts';
import { updatePostSchema } from '@/lib/validation';
import { adminProcedure, router } from '../init';

const statusEnum = z.enum(['draft', 'published', 'archived']);

const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase and contain only letters, numbers, and hyphens'
    ),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  coverImage: z
    .string()
    .url('Cover image must be a valid URL')
    .optional()
    .or(z.literal('')),
  topics: z.array(z.string()).optional().default([]),
  publishDate: z
    .string()
    .datetime('Publish date must be a valid datetime')
    .optional()
    .or(z.literal('')),
  status: statusEnum,
});

export const adminPostsRouter = router({
  list: adminProcedure
    .input(
      z
        .object({
          status: statusEnum.optional(),
          topic: z.string().optional(),
          limit: z.number().int().min(1).max(100).optional(),
          offset: z.number().int().min(0).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const posts = await getPosts({
        status: input?.status as PostStatus | undefined,
        topic: input?.topic,
        limit: input?.limit,
        offset: input?.offset,
      });
      return posts;
    }),
  bySlug: adminProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const post = await getPostBySlug(input.slug);
      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
      }
      return post;
    }),
  create: adminProcedure
    .input(createPostSchema)
    .mutation(async ({ input, ctx }) => {
      const { publishDate, topics = [], status, ...rest } = input;

      let parsedPublishDate: Date | undefined;
      if (publishDate) {
        const date = new Date(publishDate);
        if (Number.isNaN(date.getTime())) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid publish date',
          });
        }
        parsedPublishDate = date;
      }

      try {
        return await createPost({
          ...rest,
          status: status as PostStatus,
          publishDate: parsedPublishDate,
          topics,
          authorId: ctx.adminId,
        });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create post',
          cause: error instanceof Error ? error : undefined,
        });
      }
    }),
  update: adminProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        data: updatePostSchema,
      })
    )
    .mutation(async ({ input }) => {
      const updateData: UpdatePostData = {};

      if (input.data.title !== undefined) {
        updateData.title = input.data.title;
      }
      if (input.data.content !== undefined) {
        updateData.content = input.data.content;
      }
      if (input.data.excerpt !== undefined) {
        updateData.excerpt = input.data.excerpt;
      }
      if (input.data.status !== undefined) {
        const validStatuses: PostStatus[] = ['draft', 'published', 'archived'];
        if (!validStatuses.includes(input.data.status)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message:
              'Invalid status value. Must be one of: draft, published, archived',
          });
        }
        updateData.status = input.data.status;
      }
      if (input.data.publishDate !== undefined) {
        const date = new Date(input.data.publishDate);
        if (Number.isNaN(date.getTime())) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid publish date',
          });
        }
        updateData.publishDate = date;
      }
      if (input.data.coverImage !== undefined) {
        updateData.coverImage = input.data.coverImage;
      }
      if (input.data.topics !== undefined) {
        updateData.topics = input.data.topics;
      }

      const post = await updatePost(input.slug, updateData);
      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
      }

      return post;
    }),
  delete: adminProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const success = await deletePost(input.slug);
      if (!success) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
      }
      return true;
    }),
});
