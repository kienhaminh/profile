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
  pgEnum,
  decimal,
  date,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const financeTransactionTypeEnum = pgEnum('finance_transaction_type', [
  'income',
  'expense',
]);
export const financePriorityEnum = pgEnum('finance_priority', [
  'must_have',
  'nice_to_have',
  'waste',
]);
export const currencyEnum = pgEnum('currency', ['KRW', 'VND']);
export const loanTypeEnum = pgEnum('loan_type', ['borrow', 'lend']);
export const loanStatusEnum = pgEnum('loan_status', ['active', 'settled']);
export const investmentStatusEnum = pgEnum('investment_status', [
  'active',
  'sold',
  'matured',
]);

export const financeFrequencyEnum = pgEnum('finance_frequency', [
  'monthly',
  'yearly',
]);

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

// Blog Series table (for organizing posts into series)
export const blogSeries = pgTable(
  'blog_series',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').notNull().default('DRAFT'), // DRAFT | PUBLISHED | ARCHIVED
    coverImage: text('cover_image'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    slugIdx: index('blog_series_slug_idx').on(table.slug),
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
    seriesId: uuid('series_id').references(() => blogSeries.id, {
      onDelete: 'set null',
    }),
    seriesOrder: integer('series_order'),
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
    seriesIdIdx: index('posts_series_id_idx').on(table.seriesId),
    seriesIdOrderIdx: index('posts_series_id_series_order_idx').on(
      table.seriesId,
      table.seriesOrder
    ),
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

export const blogSeriesRelations = relations(blogSeries, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  series: one(blogSeries, {
    fields: [posts.seriesId],
    references: [blogSeries.id],
  }),
  postTags: many(postTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
  projectTags: many(projectTags),
  favoriteTags: many(favoriteTags),
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

// Visitor Sessions - tracks overall visits to the site
export const visitorSessions = pgTable(
  'visitor_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    visitorId: text('visitor_id').notNull(), // UUID stored in localStorage
    userAgent: text('user_agent'),
    referrer: text('referrer'),
    device: text('device'), // 'desktop' | 'tablet' | 'mobile'
    country: text('country'),
    startedAt: timestamp('started_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    totalDuration: integer('total_duration'), // seconds
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    visitorIdIdx: index('visitor_sessions_visitor_id_idx').on(table.visitorId),
    startedAtIdx: index('visitor_sessions_started_at_idx').on(table.startedAt),
    createdAtIdx: index('visitor_sessions_created_at_idx').on(table.createdAt),
  })
);

// Page Visits - tracks time spent on each page
export const pageVisits = pgTable(
  'page_visits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => visitorSessions.id, { onDelete: 'cascade' }),
    pagePath: text('page_path').notNull(),
    pageTitle: text('page_title'),
    enteredAt: timestamp('entered_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    exitedAt: timestamp('exited_at', { withTimezone: true }),
    duration: integer('duration'), // seconds
    scrollDepth: integer('scroll_depth'), // percentage 0-100
  },
  (table) => ({
    sessionIdIdx: index('page_visits_session_id_idx').on(table.sessionId),
    pagePathIdx: index('page_visits_page_path_idx').on(table.pagePath),
    enteredAtIdx: index('page_visits_entered_at_idx').on(table.enteredAt),
  })
);

// Visitor Sessions relations
export const visitorSessionsRelations = relations(
  visitorSessions,
  ({ many }) => ({
    pageVisits: many(pageVisits),
  })
);

// Page Visits relations
export const pageVisitsRelations = relations(pageVisits, ({ one }) => ({
  session: one(visitorSessions, {
    fields: [pageVisits.sessionId],
    references: [visitorSessions.id],
  }),
}));

// Finance Categories table
export const financeCategories = pgTable('finance_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: financeTransactionTypeEnum('type').default('expense'), // 'income' | 'expense'
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Finance Transactions table
export const financeTransactions = pgTable(
  'finance_transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    type: financeTransactionTypeEnum('type').notNull(),
    amount: decimal('amount').notNull(),
    currency: currencyEnum('currency').notNull().default('KRW'),
    categoryId: uuid('category_id').references(() => financeCategories.id),
    priority: financePriorityEnum('priority'),
    description: text('description'),
    date: date('date').notNull(),
  },
  (table) => ({
    dateIdx: index('finance_transactions_date_idx').on(table.date),
    typeIdx: index('finance_transactions_type_idx').on(table.type),
  })
);

// Finance Relations
export const financeCategoriesRelations = relations(
  financeCategories,
  ({ many }) => ({
    transactions: many(financeTransactions),
    budgets: many(financeBudgets),
  })
);

export const financeTransactionsRelations = relations(
  financeTransactions,
  ({ one }) => ({
    category: one(financeCategories, {
      fields: [financeTransactions.categoryId],
      references: [financeCategories.id],
    }),
  })
);

// Finance Budgets table
export const financeBudgets = pgTable(
  'finance_budgets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    categoryId: uuid('category_id')
      .references(() => financeCategories.id)
      .notNull(),
    amount: decimal('amount').notNull(),
    currency: currencyEnum('currency').notNull().default('KRW'),
    month: date('month').notNull(), // First day of the month (YYYY-MM-01)
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    categoryMonthIdx: index('finance_budgets_category_month_idx').on(
      table.categoryId,
      table.month
    ),
  })
);

export const financeBudgetsRelations = relations(financeBudgets, ({ one }) => ({
  category: one(financeCategories, {
    fields: [financeBudgets.categoryId],
    references: [financeCategories.id],
  }),
}));

// Finance Exchange transactions table
export const financeExchanges = pgTable(
  'finance_exchanges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fromCurrency: currencyEnum('from_currency').notNull(),
    toCurrency: currencyEnum('to_currency').notNull(),
    fromAmount: decimal('from_amount').notNull(),
    toAmount: decimal('to_amount').notNull(),
    rate: decimal('rate').notNull(),
    date: date('date').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    dateIdx: index('finance_exchanges_date_idx').on(table.date),
  })
);

// Finance Loans table
export const financeLoans = pgTable(
  'finance_loans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: loanTypeEnum('type').notNull(), // 'borrow' or 'lend'
    counterparty: text('counterparty').notNull(), // Who you borrowed from / lent to
    amount: decimal('amount').notNull(),
    currency: currencyEnum('currency').notNull().default('KRW'),
    status: loanStatusEnum('status').notNull().default('active'),
    date: date('date').notNull(), // When the loan started
    dueDate: date('due_date'), // Optional expected repayment date
    settledDate: date('settled_date'), // When actually settled
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    dateIdx: index('finance_loans_date_idx').on(table.date),
    statusIdx: index('finance_loans_status_idx').on(table.status),
  })
);

// Finance Investments table
export const financeInvestments = pgTable(
  'finance_investments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(), // Investment name/ticker
    type: text('type'), // 'stock', 'crypto', 'fund', 'savings', etc.
    amount: decimal('amount').notNull(), // Initial investment amount
    currentValue: decimal('current_value'), // Optional current value
    currency: currencyEnum('currency').notNull().default('VND'),
    status: investmentStatusEnum('status').notNull().default('active'),
    date: date('date').notNull(), // Purchase date
    soldDate: date('sold_date'), // When sold/matured
    soldAmount: decimal('sold_amount'), // Sale proceeds
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    dateIdx: index('finance_investments_date_idx').on(table.date),
    statusIdx: index('finance_investments_status_idx').on(table.status),
  })
);

// Favorite Categories table (for organizing favorites by type)
export const favoriteCategories = pgTable('favorite_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(), // e.g., "Restaurant", "Movie", "Song"
  icon: text('icon'), // Optional icon name (e.g., "utensils", "film", "music")
  color: text('color'), // Optional color for UI display
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Favorites table (individual favorite items)
export const favorites = pgTable(
  'favorites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => favoriteCategories.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // Name of the favorite item
    description: text('description'), // Optional description
    rating: integer('rating'), // Optional rating (1-5)
    imageUrl: text('image_url'), // Optional image URL
    externalUrl: text('external_url'), // Optional link to the item
    metadata: jsonb('metadata').$type<Record<string, string>>(), // Flexible metadata
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    categoryIdIdx: index('favorites_category_id_idx').on(table.categoryId),
    createdAtIdx: index('favorites_created_at_idx').on(table.createdAt),
  })
);

// Favorite Categories Relations
export const favoriteCategoriesRelations = relations(
  favoriteCategories,
  ({ many }) => ({
    favorites: many(favorites),
  })
);

// Favorites Relations
export const favoritesRelations = relations(favorites, ({ one, many }) => ({
  category: one(favoriteCategories, {
    fields: [favorites.categoryId],
    references: [favoriteCategories.id],
  }),
  favoriteTags: many(favoriteTags),
}));

// Favorite-Tag junction table
export const favoriteTags = pgTable(
  'favorite_tags',
  {
    favoriteId: uuid('favorite_id')
      .notNull()
      .references(() => favorites.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.favoriteId, table.tagId] }),
    favoriteIdIdx: index('favorite_tags_favorite_id_idx').on(table.favoriteId),
    tagIdIdx: index('favorite_tags_tag_id_idx').on(table.tagId),
  })
);

// Favorite Tag Relations
export const favoriteTagsRelations = relations(favoriteTags, ({ one }) => ({
  favorite: one(favorites, {
    fields: [favoriteTags.favoriteId],
    references: [favorites.id],
  }),
  tag: one(tags, {
    fields: [favoriteTags.tagId],
    references: [tags.id],
  }),
}));

// Finance Aggregates table (Cached totals)
export const financeAggregates = pgTable('finance_aggregates', {
  currency: currencyEnum('currency').primaryKey(),
  totalIncome: decimal('total_income').default('0').notNull(),
  totalExpense: decimal('total_expense').default('0').notNull(),
  totalExchangeIn: decimal('total_exchange_in').default('0').notNull(),
  totalExchangeOut: decimal('total_exchange_out').default('0').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Finance Recurring Transactions table (for fixed/recurring income and expenses)
export const financeRecurringTransactions = pgTable(
  'finance_recurring_transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(), // e.g., "Salary", "Rent", "Internet"
    type: financeTransactionTypeEnum('type').notNull(), // 'income' | 'expense'
    amount: decimal('amount').notNull(),
    currency: currencyEnum('currency').notNull().default('KRW'),
    categoryId: uuid('category_id').references(() => financeCategories.id),
    priority: financePriorityEnum('priority'), // For expenses
    frequency: financeFrequencyEnum('frequency').notNull().default('monthly'),
    dayOfMonth: integer('day_of_month').notNull(), // 1-31, day to generate transaction
    monthOfYear: integer('month_of_year'), // 1-12, for yearly frequency
    isActive: boolean('is_active').notNull().default(true),
    description: text('description'),
    lastGeneratedMonth: text('last_generated_month'), // YYYY-MM format to track generation
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    dayOfMonthIdx: index('finance_recurring_day_idx').on(table.dayOfMonth),
    isActiveIdx: index('finance_recurring_is_active_idx').on(table.isActive),
  })
);

// Finance Recurring Transactions Relations
export const financeRecurringTransactionsRelations = relations(
  financeRecurringTransactions,
  ({ one }) => ({
    category: one(financeCategories, {
      fields: [financeRecurringTransactions.categoryId],
      references: [financeCategories.id],
    }),
  })
);
