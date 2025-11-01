import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (single admin account)
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    usernameIdx: index('users_username_idx').on(table.username),
  })
);

// Posts table (blog posts/articles)
export const posts = pgTable(
  'posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    status: text('status').notNull().default('DRAFT'), // DRAFT | PUBLISHED | ARCHIVED
    publishDate: timestamp('publish_date', { withTimezone: true }),
    content: text('content').notNull(),
    excerpt: text('excerpt'),
    readTime: integer('read_time'),
    coverImage: text('cover_image'),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugIdx: index('posts_slug_idx').on(table.slug),
    statusIdx: index('posts_status_idx').on(table.status),
    createdAtIdx: index('posts_created_at_idx').on(table.createdAt),
    publishDateIdx: index('posts_publish_date_idx').on(table.publishDate),
  })
);

// Tags table (unified taxonomy for posts and projects)
export const tags = pgTable(
  'tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    label: text('label').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugIdx: index('tags_slug_idx').on(table.slug),
  })
);

// Post-Tag junction table
export const postTags = pgTable(
  'post_tags',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.tagId] }),
    postIdIdx: index('post_tags_post_id_idx').on(table.postId),
    tagIdIdx: index('post_tags_tag_id_idx').on(table.tagId),
  })
);

// Projects table
export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    status: text('status').notNull().default('DRAFT'), // DRAFT | PUBLISHED
    description: text('description').notNull(),
    images: jsonb('images').$type<string[]>().notNull().default([]),
    githubUrl: text('github_url'),
    liveUrl: text('live_url'),
    startDate: timestamp('start_date', { withTimezone: true }),
    endDate: timestamp('end_date', { withTimezone: true }),
    isOngoing: boolean('is_ongoing').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugIdx: index('projects_slug_idx').on(table.slug),
    statusIdx: index('projects_status_idx').on(table.status),
    createdAtIdx: index('projects_created_at_idx').on(table.createdAt),
  })
);

// Project-Tag junction table
export const projectTags = pgTable(
  'project_tags',
  {
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.tagId] }),
    projectIdIdx: index('project_tags_project_id_idx').on(table.projectId),
    tagIdIdx: index('project_tags_tag_id_idx').on(table.tagId),
  })
);

// Config table (key-value pairs for site configuration)
export const configs = pgTable('configs', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  postTags: many(postTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
  projectTags: many(projectTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  projectTags: many(projectTags),
}));

export const projectTagsRelations = relations(projectTags, ({ one }) => ({
  project: one(projects, {
    fields: [projectTags.projectId],
    references: [projects.id],
  }),
  tag: one(tags, {
    fields: [projectTags.tagId],
    references: [tags.id],
  }),
}));
