import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  json,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const postStatusEnum = pgEnum('post_status', ['DRAFT', 'PUBLISHED']);

export const posts = pgTable('posts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  status: postStatusEnum('status').notNull().default('DRAFT'),
  publishDate: timestamp('publish_date', { mode: 'date' }),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  readTime: integer('read_time'),
  coverImage: text('cover_image'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  authorId: text('author_id')
    .notNull()
    .references(() => authorProfiles.id),
});

export const topics = pgTable('topics', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
});

export const postTopics = pgTable(
  'post_topics',
  {
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    topicId: text('topic_id')
      .notNull()
      .references(() => topics.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.topicId] }),
  })
);

export const authorProfiles = pgTable('author_profiles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  bio: text('bio'),
  avatar: text('avatar'),
  socialLinks: json('social_links'),
  email: text('email'),
});

export const adminUsers = pgTable('admin_users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('admin'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  lastLogin: timestamp('last_login', { mode: 'date' }),
});

// Relations
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(authorProfiles, {
    fields: [posts.authorId],
    references: [authorProfiles.id],
  }),
  postTopics: many(postTopics),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  postTopics: many(postTopics),
}));

export const postTopicsRelations = relations(postTopics, ({ one }) => ({
  post: one(posts, {
    fields: [postTopics.postId],
    references: [posts.id],
  }),
  topic: one(topics, {
    fields: [postTopics.topicId],
    references: [topics.id],
  }),
}));

export const authorProfilesRelations = relations(
  authorProfiles,
  ({ many }) => ({
    posts: many(posts),
  })
);

// Types
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Topic = typeof topics.$inferSelect;
export type NewTopic = typeof topics.$inferInsert;
export type PostTopic = typeof postTopics.$inferSelect;
export type NewPostTopic = typeof postTopics.$inferInsert;
export type AuthorProfile = typeof authorProfiles.$inferSelect;
export type NewAuthorProfile = typeof authorProfiles.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
