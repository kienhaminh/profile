import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  json,
  primaryKey,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// UUID generation function that works in Edge Runtime
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const postStatusEnum = pgEnum('post_status', ['DRAFT', 'PUBLISHED']);
export const projectStatusEnum = pgEnum('project_status', [
  'DRAFT',
  'PUBLISHED',
]);

export const posts = pgTable('posts', {
  id: text('id').primaryKey().$defaultFn(generateUUID),
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
  id: text('id').primaryKey().$defaultFn(generateUUID),
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
  id: text('id').primaryKey().$defaultFn(generateUUID),
  name: text('name').notNull(),
  bio: text('bio'),
  avatar: text('avatar'),
  socialLinks: json('social_links'),
  email: text('email'),
});

export const adminUsers = pgTable('admin_users', {
  id: text('id').primaryKey().$defaultFn(generateUUID),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('admin'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  lastLogin: timestamp('last_login', { mode: 'date' }),
});

// New metadata tables
export const hashtags = pgTable('hashtags', {
  id: text('id').primaryKey().$defaultFn(generateUUID),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

export const technologies = pgTable('technologies', {
  id: text('id').primaryKey().$defaultFn(generateUUID),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
});

export const projects = pgTable('projects', {
  id: text('id').primaryKey().$defaultFn(generateUUID),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  status: projectStatusEnum('status').notNull().default('DRAFT'),
  description: text('description').notNull(),
  images: json('images').$type<string[]>().notNull().default([]),
  githubUrl: text('github_url'),
  liveUrl: text('live_url'),
  startDate: timestamp('start_date', { mode: 'date' }),
  endDate: timestamp('end_date', { mode: 'date' }),
  isOngoing: boolean('is_ongoing').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// New junction tables
export const postHashtags = pgTable(
  'post_hashtags',
  {
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    hashtagId: text('hashtag_id')
      .notNull()
      .references(() => hashtags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.hashtagId] }),
  })
);

export const projectHashtags = pgTable(
  'project_hashtags',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    hashtagId: text('hashtag_id')
      .notNull()
      .references(() => hashtags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.hashtagId] }),
  })
);

export const projectTechnologies = pgTable(
  'project_technologies',
  {
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    technologyId: text('technology_id')
      .notNull()
      .references(() => technologies.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.technologyId] }),
  })
);

// Relations
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(authorProfiles, {
    fields: [posts.authorId],
    references: [authorProfiles.id],
  }),
  postTopics: many(postTopics),
  postHashtags: many(postHashtags),
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

// New relations for metadata tables
export const hashtagsRelations = relations(hashtags, ({ many }) => ({
  postHashtags: many(postHashtags),
  projectHashtags: many(projectHashtags),
}));

export const technologiesRelations = relations(technologies, ({ many }) => ({
  projectTechnologies: many(projectTechnologies),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  projectHashtags: many(projectHashtags),
  projectTechnologies: many(projectTechnologies),
}));

// Junction table relations
export const postHashtagsRelations = relations(postHashtags, ({ one }) => ({
  post: one(posts, {
    fields: [postHashtags.postId],
    references: [posts.id],
  }),
  hashtag: one(hashtags, {
    fields: [postHashtags.hashtagId],
    references: [hashtags.id],
  }),
}));

export const projectHashtagsRelations = relations(
  projectHashtags,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectHashtags.projectId],
      references: [projects.id],
    }),
    hashtag: one(hashtags, {
      fields: [projectHashtags.hashtagId],
      references: [hashtags.id],
    }),
  })
);

export const projectTechnologiesRelations = relations(
  projectTechnologies,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectTechnologies.projectId],
      references: [projects.id],
    }),
    technology: one(technologies, {
      fields: [projectTechnologies.technologyId],
      references: [technologies.id],
    }),
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

// New types for metadata tables
export type Hashtag = typeof hashtags.$inferSelect;
export type NewHashtag = typeof hashtags.$inferInsert;
export type Technology = typeof technologies.$inferSelect;
export type NewTechnology = typeof technologies.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// Junction table types
export type PostHashtag = typeof postHashtags.$inferSelect;
export type NewPostHashtag = typeof postHashtags.$inferInsert;
export type ProjectHashtag = typeof projectHashtags.$inferSelect;
export type NewProjectHashtag = typeof projectHashtags.$inferInsert;
export type ProjectTechnology = typeof projectTechnologies.$inferSelect;
export type NewProjectTechnology = typeof projectTechnologies.$inferInsert;

// Extended types with relations
export type PostWithRelations = Post & {
  topics: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
  }>;
  hashtags: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
  }>;
  author: AuthorProfile;
};

export type ProjectWithRelations = Project & {
  technologies: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
  }>;
  hashtags: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
  }>;
};
