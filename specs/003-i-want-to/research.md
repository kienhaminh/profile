# Research: Blog and Project CRUD Management

**Date**: 2025-09-30  
**Feature**: Blog and Project CRUD with metadata associations

## Research Decisions

### 1. Database Schema Strategy

**Decision**: Extend existing schema + add new tables

**Rationale**:

- Existing `posts` table already has blog infrastructure (title, content, status, author, timestamps)
- Existing `topics` table already serves as categories with `post_topics` junction
- Adding new tables for hashtags, technologies, and projects is cleaner than retrofitting
- Avoids breaking changes to existing blog functionality

**Alternatives Considered**:

- **Create entirely new blog tables**: Rejected - unnecessary duplication, migration complexity
- **Store hashtags as JSON arrays**: Rejected - no referential integrity, can't filter efficiently
- **Combine hashtags and topics**: Rejected - different semantic meaning and usage patterns

### 2. Many-to-Many Relationships in Drizzle ORM

**Decision**: Use junction tables with foreign key constraints and Drizzle relations API

**Rationale**:

- Drizzle ORM provides `relations()` helper for defining many-to-many relationships
- Junction tables with composite primary keys ensure data integrity
- Foreign key constraints with `ON DELETE CASCADE` handle cleanup automatically
- Type-safe queries with automatic joins via Drizzle's query API

**Implementation Pattern**:

```typescript
// Junction table definition
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

// Relation definition
export const postsRelations = relations(posts, ({ many }) => ({
  hashtags: many(postHashtags),
}));
```

**Alternatives Considered**:

- **Array columns**: Rejected - no foreign keys, complex queries, harder to maintain
- **EAV pattern**: Rejected - overly complex for this use case

### 3. Cascade Deletion Implementation

**Decision**: Use PostgreSQL `ON DELETE CASCADE` constraints on junction tables

**Rationale**:

- Database-level cascade ensures consistency even if application logic fails
- Automatically removes orphaned associations when parent entity is deleted
- No need for application-level cleanup logic
- Atomic operation - either all deletions succeed or transaction rolls back

**Behavior**:

- Delete topic → automatically removes entries from `post_topics` (blogs remain)
- Delete hashtag → automatically removes entries from `post_hashtags` and `project_hashtags`
- Delete technology → automatically removes entries from `project_technologies`
- Delete blog/project → cascade handled by `onDelete: 'cascade'` on junction tables

**Alternatives Considered**:

- **Application-level cascade**: Rejected - error-prone, requires manual transaction management
- **Soft deletes**: Rejected - adds complexity, not required for this use case
- **Prevent deletion if in use**: Rejected - user specified cascade behavior

### 4. Inline Creation UX Pattern

**Decision**: Combobox component with "Create new..." option

**Rationale**:

- Allows selecting existing items or creating new ones without leaving the form
- Common pattern in modern UIs (e.g., GitHub labels, Notion tags)
- Better UX than modal dialogs or separate management pages
- Can be implemented with Radix UI Combobox + optimistic updates

**Component Behavior**:

1. Type to search existing items
2. Select from filtered list OR
3. Type new name and press Enter to create inline
4. Optimistic UI update shows new item immediately
5. Server creates item and returns ID for association

**Alternatives Considered**:

- **Modal dialogs**: Rejected - interrupts flow, more clicks
- **Separate management pages only**: Rejected - poor UX for content creation
- **Auto-create on any unmatched input**: Rejected - too implicit, risk of duplicates

### 5. Super Admin Authentication

**Decision**: Use Next.js middleware with session validation

**Rationale**:

- Existing `adminUsers` table has role field
- Next.js middleware can protect `/api/` routes before they execute
- Session-based auth already established in codebase
- No need for complex role-based permissions (single super admin)

**Implementation**:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = getSession(request);
  if (!session || session.role !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }
}

export const config = {
  matcher: ['/api/blog/:path*', '/api/projects/:path*', '/api/hashtags/:path*', ...],
};
```

**Alternatives Considered**:

- **Route-level checks**: Rejected - duplicated code across all endpoints
- **JWT tokens**: Rejected - session auth already in use
- **No authentication**: Rejected - violates security requirements

### 6. Server-Side Filtering and Pagination

**Decision**: Use Drizzle where clauses + LIMIT/OFFSET pagination

**Rationale**:

- Drizzle ORM provides type-safe query building with where conditions
- LIMIT/OFFSET is simple and sufficient for expected scale (100-200 blogs, 20-50 projects)
- Postgres indexes on slug, status, and foreign keys ensure fast queries
- Can add cursor-based pagination later if needed

**Query Pattern**:

```typescript
// Filter blogs by topic and hashtag
const blogs = await db.query.posts.findMany({
  where: and(
    eq(posts.status, "PUBLISHED"),
    inArray(
      posts.id,
      db
        .select({ id: postTopics.postId })
        .from(postTopics)
        .where(eq(postTopics.topicId, topicId))
    )
  ),
  limit: 20,
  offset: page * 20,
  with: { topics: true, hashtags: true },
});
```

**Performance**:

- Index on `posts.status` for filtering published posts
- Index on `posts.slug` for lookups
- Composite indexes on junction table foreign keys (automatic with FK constraints)

**Alternatives Considered**:

- **Cursor-based pagination**: Rejected - not needed at current scale
- **Full-text search**: Deferred - can add later if needed
- **Elasticsearch**: Rejected - overkill for current requirements

### 7. Image Handling for Projects

**Decision**: Store image URLs as JSON array in `projects.images` column

**Rationale**:

- Projects have multiple images (screenshots, logos, etc.)
- JSON array keeps related images together with the project
- Simpler than separate `project_images` table for this use case
- Can migrate to separate table later if needed (e.g., for ordering, captions)

**Schema**:

```typescript
export const projects = pgTable("projects", {
  // ...other fields
  images: json("images").$type<string[]>().notNull().default([]),
});
```

**Alternatives Considered**:

- **Separate project_images table**: Rejected - adds complexity for simple array storage
- **Single image field**: Rejected - requirements specify multiple images
- **Cloud storage integration**: Deferred - URL storage sufficient for MVP

## Technology Stack Confirmed

| Component      | Technology            | Version  | Justification                             |
| -------------- | --------------------- | -------- | ----------------------------------------- |
| Database       | PostgreSQL (Supabase) | 15+      | Already established, managed service      |
| ORM            | Drizzle ORM           | Latest   | Type-safe, existing in codebase           |
| Backend        | Next.js API Routes    | 14+      | Existing framework, serverless deployment |
| Frontend       | React + Next.js       | 18+, 14+ | Existing stack, SSR capabilities          |
| UI Components  | Radix UI + Tailwind   | Latest   | Existing design system                    |
| Testing (Unit) | Vitest                | Latest   | Fast, ESM support                         |
| Testing (E2E)  | Playwright            | Latest   | Reliable, multi-browser                   |
| Validation     | Zod                   | Latest   | Type-safe schema validation               |

## Performance Considerations

### Database Indexes

Required indexes for optimal query performance:

```sql
-- Existing indexes (verify presence)
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_topics_slug ON topics(slug);

-- New indexes for new tables
CREATE INDEX idx_hashtags_slug ON hashtags(slug);
CREATE INDEX idx_technologies_slug ON technologies(slug);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_status ON projects(status);

-- Junction table indexes (created automatically via FK constraints)
-- post_topics: (post_id, topic_id) composite PK
-- post_hashtags: (post_id, hashtag_id) composite PK
-- project_hashtags: (project_id, hashtag_id) composite PK
-- project_technologies: (project_id, technology_id) composite PK
```

### Query Optimization

1. **Eager loading**: Use Drizzle's `with` option to load associations in single query
2. **N+1 prevention**: Always use joins instead of sequential queries
3. **Pagination**: Default to 20 items per page, configurable up to 100
4. **Caching**: Consider HTTP caching headers for public content (blogs, projects)

### Expected Performance

Based on scale (100-200 blogs, 20-50 projects):

- Blog list with filters: <50ms
- Project list with filters: <30ms
- Single item fetch with associations: <20ms
- Create/update operations: <100ms
- Delete with cascade: <150ms

All well within the <200ms p95 target from constitution.

## Security Considerations

### Input Validation

All endpoints validate input using Zod schemas:

```typescript
const createBlogSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  topicIds: z.array(z.string().uuid()),
  hashtagIds: z.array(z.string().uuid()),
});
```

### Authorization

- All mutation endpoints (POST, PUT, DELETE) require super admin session
- Read endpoints (GET) split:
  - Admin endpoints (`/api/admin/*`): require authentication
  - Public endpoints (`/api/blog`, `/api/projects`): open, filter by status=PUBLISHED

### SQL Injection Prevention

- Drizzle ORM uses parameterized queries automatically
- No raw SQL in application code
- Foreign key constraints prevent orphaned references

## Deployment Considerations

### Database Migrations

Use Drizzle Kit for schema migrations:

```bash
# Generate migration
npx drizzle-kit generate:pg

# Apply migration
npx drizzle-kit push:pg
```

Migrations tracked in `drizzle/` directory, applied during deployment pipeline.

### Rollback Strategy

For safe rollback:

1. Database migrations are additive (new tables/columns only)
2. Old code ignores new tables (no breaking changes)
3. Can rollback code without rolling back DB
4. Cascade deletes ensure no orphaned data

### Environment Variables

Required for deployment:

```env
DATABASE_URL=<supabase-postgres-url>
NEXT_PUBLIC_SITE_URL=<production-url>
```

## Open Questions (Non-Blocking)

Minor details that can be resolved during implementation:

1. **Required fields validation**: Which blog fields are strictly required? (Spec says "minimal validation" - can add as needed)
2. **Concurrent edit handling**: How to handle when admin edits same item twice? (Optimistic locking, last-write-wins, or ignore for single admin)
3. **Image upload flow**: How are images uploaded for projects? (URL input, file upload, or external service)

These don't block design/development and can be decided during implementation based on actual usage patterns.

## References

- [Drizzle ORM Relations Documentation](https://orm.drizzle.team/docs/rls)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [PostgreSQL CASCADE Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Radix UI Combobox](https://www.radix-ui.com/primitives/docs/components/combobox)
