# Data Model: Blog and Project CRUD Management

**Feature**: Blog and Project CRUD with Metadata Associations  
**Date**: 2025-09-30

## Entity Relationship Diagram

```
┌─────────────────┐       ┌──────────────┐       ┌──────────────┐
│   posts (Blog)  │──────<│ post_topics  │>──────│    topics    │
│  (existing)     │       │  (existing)  │       │  (existing)  │
└─────────────────┘       └──────────────┘       └──────────────┘
         │
         │
         ├──────<┌───────────────┐>─────────┐
         │       │ post_hashtags │          │
         │       │     (new)     │          │
         │       └───────────────┘          │
         │                                  │
         │                                  ▼
         │                          ┌──────────────┐
         │                          │   hashtags   │
         │                          │     (new)    │
         │                          └──────────────┘
         │                                  ▲
┌─────────────────┐                        │
│    projects     │                        │
│      (new)      │────────────────────────┘
└─────────────────┘
         │
         │
         ├──────<┌──────────────────┐
         │       │project_hashtags  │
         │       │      (new)       │
         │       └──────────────────┘
         │
         └──────<┌───────────────────┐>────┐
                 │project_technologies│     │
                 │       (new)        │     │
                 └───────────────────┘     │
                                           ▼
                                   ┌──────────────┐
                                   │ technologies │
                                   │     (new)    │
                                   └──────────────┘
```

## Core Entities

### 1. BlogPost (posts table - existing, enhanced)

**Purpose**: Represents a blog article/post

**Schema**:

```typescript
export const posts = pgTable("posts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  status: postStatusEnum("status").notNull().default("DRAFT"), // 'DRAFT' | 'PUBLISHED'
  publishDate: timestamp("publish_date", { mode: "date" }),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  readTime: integer("read_time"),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  authorId: text("author_id")
    .notNull()
    .references(() => authorProfiles.id),
});
```

**Relationships**:

- Many-to-many with `topics` via `post_topics` (existing)
- Many-to-many with `hashtags` via `post_hashtags` (new)
- Many-to-one with `authorProfiles` (existing)

**Constraints**:

- `slug` must be unique across all posts
- `title`, `content`, `authorId` are required
- `status` defaults to 'DRAFT'

**Indexes**:

- Primary key on `id`
- Unique index on `slug`
- Index on `status` (for filtering published posts)
- Foreign key index on `authorId`

---

### 2. Project (new table)

**Purpose**: Represents a portfolio project

**Schema**:

```typescript
export const projectStatusEnum = pgEnum("project_status", [
  "DRAFT",
  "PUBLISHED",
]);

export const projects = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  status: projectStatusEnum("status").notNull().default("DRAFT"),
  description: text("description").notNull(),
  images: json("images").$type<string[]>().notNull().default([]), // Array of image URLs
  githubUrl: text("github_url"),
  liveUrl: text("live_url"),
  startDate: timestamp("start_date", { mode: "date" }),
  endDate: timestamp("end_date", { mode: "date" }),
  isOngoing: boolean("is_ongoing").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
```

**Relationships**:

- Many-to-many with `technologies` via `project_technologies` (new)
- Many-to-many with `hashtags` via `project_hashtags` (new, optional)

**Constraints**:

- `slug` must be unique across all projects
- `title`, `description` are required
- `status` defaults to 'DRAFT'
- Either `endDate` is set OR `isOngoing` is true (application-level validation)

**Indexes**:

- Primary key on `id`
- Unique index on `slug`
- Index on `status` (for filtering published projects)

---

### 3. Topic (topics table - existing)

**Purpose**: Categorizes blog posts (flat hierarchy)

**Schema**:

```typescript
export const topics = pgTable("topics", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
});
```

**Relationships**:

- Many-to-many with `posts` via `post_topics` (existing)

**Constraints**:

- `name` and `slug` must be unique
- `name` is required

**Indexes**:

- Primary key on `id`
- Unique index on `name`
- Unique index on `slug`

---

### 4. Hashtag (new table)

**Purpose**: Tags for content discovery (shared between blogs and projects)

**Schema**:

```typescript
export const hashtags = pgTable("hashtags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
```

**Relationships**:

- Many-to-many with `posts` via `post_hashtags` (new)
- Many-to-many with `projects` via `project_hashtags` (new)

**Constraints**:

- `name` and `slug` must be unique
- `name` is required

**Indexes**:

- Primary key on `id`
- Unique index on `name`
- Unique index on `slug`

---

### 5. Technology (new table)

**Purpose**: Tech stack items for projects (e.g., "React", "PostgreSQL")

**Schema**:

```typescript
export const technologies = pgTable("technologies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
```

**Relationships**:

- Many-to-many with `projects` via `project_technologies` (new)

**Constraints**:

- `name` and `slug` must be unique
- `name` is required

**Indexes**:

- Primary key on `id`
- Unique index on `name`
- Unique index on `slug`

---

## Junction Tables

### 1. post_topics (existing)

**Purpose**: Links posts to topics (many-to-many)

**Schema**:

```typescript
export const postTopics = pgTable(
  "post_topics",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.topicId] }),
  })
);
```

**Constraints**:

- Composite primary key on `(postId, topicId)` prevents duplicates
- Foreign key to `posts` with `ON DELETE CASCADE`
- Foreign key to `topics` with `ON DELETE CASCADE`

**Behavior**:

- Delete post → removes all associations
- Delete topic → removes associations, posts remain

---

### 2. post_hashtags (new)

**Purpose**: Links posts to hashtags (many-to-many)

**Schema**:

```typescript
export const postHashtags = pgTable(
  "post_hashtags",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    hashtagId: text("hashtag_id")
      .notNull()
      .references(() => hashtags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.hashtagId] }),
  })
);
```

**Constraints**:

- Composite primary key on `(postId, hashtagId)` prevents duplicates
- Foreign key to `posts` with `ON DELETE CASCADE`
- Foreign key to `hashtags` with `ON DELETE CASCADE`

**Behavior**:

- Delete post → removes all hashtag associations
- Delete hashtag → removes associations from all posts, posts remain

---

### 3. project_hashtags (new)

**Purpose**: Links projects to hashtags (many-to-many, optional)

**Schema**:

```typescript
export const projectHashtags = pgTable(
  "project_hashtags",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    hashtagId: text("hashtag_id")
      .notNull()
      .references(() => hashtags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.hashtagId] }),
  })
);
```

**Constraints**:

- Composite primary key on `(projectId, hashtagId)` prevents duplicates
- Foreign key to `projects` with `ON DELETE CASCADE`
- Foreign key to `hashtags` with `ON DELETE CASCADE`

**Behavior**:

- Delete project → removes all hashtag associations
- Delete hashtag → removes associations from all projects, projects remain

---

### 4. project_technologies (new)

**Purpose**: Links projects to technologies (many-to-many)

**Schema**:

```typescript
export const projectTechnologies = pgTable(
  "project_technologies",
  {
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    technologyId: text("technology_id")
      .notNull()
      .references(() => technologies.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.technologyId] }),
  })
);
```

**Constraints**:

- Composite primary key on `(projectId, technologyId)` prevents duplicates
- Foreign key to `projects` with `ON DELETE CASCADE`
- Foreign key to `technologies` with `ON DELETE CASCADE`

**Behavior**:

- Delete project → removes all technology associations
- Delete technology → removes associations from all projects, projects remain

---

## Drizzle Relations

### Posts Relations

```typescript
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(authorProfiles, {
    fields: [posts.authorId],
    references: [authorProfiles.id],
  }),
  postTopics: many(postTopics),
  postHashtags: many(postHashtags),
}));
```

### Projects Relations

```typescript
export const projectsRelations = relations(projects, ({ many }) => ({
  projectHashtags: many(projectHashtags),
  projectTechnologies: many(projectTechnologies),
}));
```

### Topics Relations

```typescript
export const topicsRelations = relations(topics, ({ many }) => ({
  postTopics: many(postTopics),
}));
```

### Hashtags Relations

```typescript
export const hashtagsRelations = relations(hashtags, ({ many }) => ({
  postHashtags: many(postHashtags),
  projectHashtags: many(projectHashtags),
}));
```

### Technologies Relations

```typescript
export const technologiesRelations = relations(technologies, ({ many }) => ({
  projectTechnologies: many(projectTechnologies),
}));
```

---

## TypeScript Types

### Inferred Select Types

```typescript
export type Post = typeof posts.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type Hashtag = typeof hashtags.$inferSelect;
export type Technology = typeof technologies.$inferSelect;
```

### Inferred Insert Types

```typescript
export type NewPost = typeof posts.$inferInsert;
export type NewProject = typeof projects.$inferInsert;
export type NewTopic = typeof topics.$inferInsert;
export type NewHashtag = typeof hashtags.$inferInsert;
export type NewTechnology = typeof technologies.$inferInsert;
```

### Extended Types with Relations

```typescript
export type PostWithRelations = Post & {
  topics: Topic[];
  hashtags: Hashtag[];
  author: AuthorProfile;
};

export type ProjectWithRelations = Project & {
  technologies: Technology[];
  hashtags: Hashtag[];
};
```

---

## Validation Rules

### Slug Generation

All entities with slugs follow the same pattern:

- Lowercase alphanumeric characters and hyphens only
- Generated from `name` or `title` field
- Uniqueness enforced at database level
- Regex: `^[a-z0-9-]+$`

### Required Fields

**BlogPost**:

- `title`, `slug`, `content`, `authorId` are required
- `status` defaults to 'DRAFT'
- `publishDate` required when status changes to 'PUBLISHED'

**Project**:

- `title`, `slug`, `description` are required
- `status` defaults to 'DRAFT'
- Either `endDate` or `isOngoing` must be set

**Topic/Hashtag/Technology**:

- `name` and `slug` are required
- `description` is optional

### URL Validation

- `githubUrl` and `liveUrl` in projects must be valid HTTP/HTTPS URLs
- `images` array must contain valid URLs

---

## Migration Scripts

### 1. Create New Tables

```sql
-- Hashtags table
CREATE TABLE hashtags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Technologies table
CREATE TABLE technologies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Projects table
CREATE TYPE project_status AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status project_status NOT NULL DEFAULT 'DRAFT',
  description TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  github_url TEXT,
  live_url TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_ongoing BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 2. Create Junction Tables

```sql
-- Post-Hashtags junction
CREATE TABLE post_hashtags (
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  hashtag_id TEXT NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, hashtag_id)
);

-- Project-Hashtags junction
CREATE TABLE project_hashtags (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  hashtag_id TEXT NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, hashtag_id)
);

-- Project-Technologies junction
CREATE TABLE project_technologies (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  technology_id TEXT NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, technology_id)
);
```

### 3. Create Indexes

```sql
CREATE INDEX idx_hashtags_slug ON hashtags(slug);
CREATE INDEX idx_technologies_slug ON technologies(slug);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_status ON projects(status);
```

---

## Query Examples

### Fetch blog with all relations

```typescript
const blog = await db.query.posts.findFirst({
  where: eq(posts.slug, "my-blog-post"),
  with: {
    author: true,
    postTopics: {
      with: { topic: true },
    },
    postHashtags: {
      with: { hashtag: true },
    },
  },
});
```

### Fetch projects filtered by technology

```typescript
const reactProjects = await db.query.projects.findMany({
  where: and(
    eq(projects.status, "PUBLISHED"),
    inArray(
      projects.id,
      db
        .select({ id: projectTechnologies.projectId })
        .from(projectTechnologies)
        .innerJoin(
          technologies,
          eq(projectTechnologies.technologyId, technologies.id)
        )
        .where(eq(technologies.slug, "react"))
    )
  ),
  with: {
    projectTechnologies: { with: { technology: true } },
    projectHashtags: { with: { hashtag: true } },
  },
});
```

### Create blog with topics and hashtags

```typescript
// 1. Create blog post
const [post] = await db
  .insert(posts)
  .values({
    title: "New Blog Post",
    slug: "new-blog-post",
    content: "...",
    authorId: authorId,
  })
  .returning();

// 2. Associate topics
await db
  .insert(postTopics)
  .values(topicIds.map((topicId) => ({ postId: post.id, topicId })));

// 3. Associate hashtags
await db
  .insert(postHashtags)
  .values(hashtagIds.map((hashtagId) => ({ postId: post.id, hashtagId })));
```

---

## Data Integrity Rules

1. **Cascade Deletion**: All foreign keys use `ON DELETE CASCADE` to maintain referential integrity
2. **Unique Constraints**: Slugs are unique within their entity type
3. **Non-null Constraints**: Required fields enforced at database level
4. **Type Safety**: Drizzle ORM ensures type-safe queries at compile time
5. **Transaction Boundary**: Create operations with associations wrapped in database transactions
