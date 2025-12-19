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

// Chat sessions table
export const chatSessions = pgTable(
  'chat_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    visitorId: text('visitor_id'), // Optional identifier for tracking visitors
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    createdAtIdx: index('chat_sessions_created_at_idx').on(table.createdAt),
    visitorIdIdx: index('chat_sessions_visitor_id_idx').on(table.visitorId),
  })
);

// Chat messages table
export const chatMessages = pgTable(
  'chat_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => chatSessions.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // 'user' | 'assistant'
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    sessionIdIdx: index('chat_messages_session_id_idx').on(table.sessionId),
    createdAtIdx: index('chat_messages_created_at_idx').on(table.createdAt),
  })
);

// Chat sessions relations
export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
  messages: many(chatMessages),
}));

// Chat messages relations
export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

// Knowledge Extraction table
export const knowledgeEntries = pgTable(
  'knowledge_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    sourceType: text('source_type').notNull(), // 'url' | 'document' | 'image'
    sourceUrl: text('source_url'),
    fileName: text('file_name'),
    fileSize: integer('file_size'), // in bytes
    mimeType: text('mime_type'),
    extractedData: jsonb('extracted_data')
      .$type<{
        summary?: string;
        keyPoints?: string[];
        keywords?: string[];
        entities?: { name: string; type: string }[];
        rawText?: string;
        metadata?: Record<string, string | number | boolean | string[]>;
      }>()
      .notNull(),
    status: text('status').notNull().default('completed'), // 'processing' | 'completed' | 'failed'
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    sourceTypeIdx: index('knowledge_entries_source_type_idx').on(
      table.sourceType
    ),
    statusIdx: index('knowledge_entries_status_idx').on(table.status),
    createdAtIdx: index('knowledge_entries_created_at_idx').on(table.createdAt),
  })
);

// Knowledge entries relations
export const knowledgeEntriesRelations = relations(
  knowledgeEntries,
  ({}) => ({})
);

// Vocabularies table
export const vocabularies = pgTable(
  'vocabularies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    word: text('word').notNull(),
    meaning: text('meaning').notNull(),
    partOfSpeech: text('part_of_speech'),
    language: text('language').notNull().default('en'), // 'en' | 'ko' | 'zh'
    example: text('example'),
    pronunciation: text('pronunciation'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    wordIdx: index('vocabularies_word_idx').on(table.word),
    languageIdx: index('vocabularies_language_idx').on(table.language),
  })
);

// Vocabulary Relations table
export const vocabularyRelations = pgTable(
  'vocabulary_relations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceId: uuid('source_id')
      .notNull()
      .references(() => vocabularies.id, { onDelete: 'cascade' }),
    targetId: uuid('target_id')
      .notNull()
      .references(() => vocabularies.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // 'derivative' | 'synonym' | 'antonym' | 'root'
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    sourceIdIdx: index('vocabulary_relations_source_id_idx').on(table.sourceId),
    targetIdIdx: index('vocabulary_relations_target_id_idx').on(table.targetId),
  })
);

// Vocabulary Relations
export const vocabulariesRelations = relations(vocabularies, ({ many }) => ({
  outgoingRelations: many(vocabularyRelations, { relationName: 'source' }),
  incomingRelations: many(vocabularyRelations, { relationName: 'target' }),
}));

export const vocabularyRelationsRelations = relations(
  vocabularyRelations,
  ({ one }) => ({
    source: one(vocabularies, {
      fields: [vocabularyRelations.sourceId],
      references: [vocabularies.id],
      relationName: 'source',
    }),
    target: one(vocabularies, {
      fields: [vocabularyRelations.targetId],
      references: [vocabularies.id],
      relationName: 'target',
    }),
  })
);

// Flashcards table
export const flashcards = pgTable(
  'flashcards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    language: text('language').notNull(), // 'en' | 'ko' | 'zh'
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    languageIdx: index('flashcards_language_idx').on(table.language),
    isActiveIdx: index('flashcards_is_active_idx').on(table.isActive),
    createdAtIdx: index('flashcards_created_at_idx').on(table.createdAt),
  })
);

// Flashcard-Vocabulary junction table
export const flashcardVocabularies = pgTable(
  'flashcard_vocabularies',
  {
    flashcardId: uuid('flashcard_id')
      .notNull()
      .references(() => flashcards.id, { onDelete: 'cascade' }),
    vocabularyId: uuid('vocabulary_id')
      .notNull()
      .references(() => vocabularies.id, { onDelete: 'cascade' }),
    addedAt: timestamp('added_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.flashcardId, table.vocabularyId] }),
    flashcardIdIdx: index('flashcard_vocabularies_flashcard_id_idx').on(
      table.flashcardId
    ),
    vocabularyIdIdx: index('flashcard_vocabularies_vocabulary_id_idx').on(
      table.vocabularyId
    ),
  })
);

// Practice Sessions table
export const practiceSessions = pgTable(
  'practice_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    flashcardId: uuid('flashcard_id')
      .notNull()
      .references(() => flashcards.id, { onDelete: 'cascade' }),
    vocabularyId: uuid('vocabulary_id')
      .notNull()
      .references(() => vocabularies.id, { onDelete: 'cascade' }),
    wasCorrect: boolean('was_correct').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    flashcardIdIdx: index('practice_sessions_flashcard_id_idx').on(
      table.flashcardId
    ),
    vocabularyIdIdx: index('practice_sessions_vocabulary_id_idx').on(
      table.vocabularyId
    ),
    createdAtIdx: index('practice_sessions_created_at_idx').on(table.createdAt),
  })
);

// Flashcard Relations
export const flashcardsRelations = relations(flashcards, ({ many }) => ({
  vocabularies: many(flashcardVocabularies),
  practiceSessions: many(practiceSessions),
}));

export const flashcardVocabulariesRelations = relations(
  flashcardVocabularies,
  ({ one }) => ({
    flashcard: one(flashcards, {
      fields: [flashcardVocabularies.flashcardId],
      references: [flashcards.id],
    }),
    vocabulary: one(vocabularies, {
      fields: [flashcardVocabularies.vocabularyId],
      references: [vocabularies.id],
    }),
  })
);

export const practiceSessionsRelations = relations(
  practiceSessions,
  ({ one }) => ({
    flashcard: one(flashcards, {
      fields: [practiceSessions.flashcardId],
      references: [flashcards.id],
    }),
    vocabulary: one(vocabularies, {
      fields: [practiceSessions.vocabularyId],
      references: [vocabularies.id],
    }),
  })
);

// History Events table
export const historyEvents = pgTable(
  'history_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description'),
    occurredAt: text('occurred_at'), // Text to allow flexible dates like "Spring 2024" or "Circa 1000"
    year: integer('year'), // For sorting/filtering
    sourceUrl: text('source_url'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    yearIdx: index('history_events_year_idx').on(table.year),
    createdAtIdx: index('history_events_created_at_idx').on(table.createdAt),
  })
);

// Folktales table (Vietnamese fairy tales, fables, and legends)
export const folktales = pgTable(
  'folktales',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    content: text('content'), // Full story content
    summary: text('summary'), // Short summary/excerpt
    category: text('category'), // e.g., 'fairy_tale', 'fable', 'legend', 'myth'
    characters: jsonb('characters').$type<string[]>().default([]), // Key characters
    moral: text('moral'), // Moral of the story (for fables)
    sourceUrl: text('source_url'),
    crawledAt: timestamp('crawled_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    titleIdx: index('folktales_title_idx').on(table.title),
    categoryIdx: index('folktales_category_idx').on(table.category),
    createdAtIdx: index('folktales_created_at_idx').on(table.createdAt),
  })
);

// Shortlinks table (URL shortener)
export const shortlinks = pgTable(
  'shortlinks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(), // Short code (e.g., "abc123")
    destinationUrl: text('destination_url').notNull(),
    title: text('title'), // Optional friendly name
    isActive: boolean('is_active').notNull().default(true),
    clickCount: integer('click_count').notNull().default(0),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    password: text('password'), // Optional password protection (hashed)
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugIdx: index('shortlinks_slug_idx').on(table.slug),
    isActiveIdx: index('shortlinks_is_active_idx').on(table.isActive),
    createdAtIdx: index('shortlinks_created_at_idx').on(table.createdAt),
  })
);
