# Tasks: Supabase Migration + Blog & Project CRUD

**Input**: Design documents from `/specs/002-supabase-and-crud/`  
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

**Branch**: `002-supabase-and-crud`  
**Total Tasks**: 34  
**Estimated Duration**: 6-9 days

---

## Execution Flow Summary

```
Phase A: Supabase Migration (T001-T006) → 1-2 days
  ↓
Phase B: Blog & Project CRUD (T007-T034) → 5-7 days
  - Database Schema (T007-T009)
  - Tests First/TDD (T010-T015) ⚠️ MUST FAIL
  - Service Layer (T016-T021)
  - API Routes (T022-T025)
  - UI Components (T026-T029)
  - Admin Pages (T030-T031)
  - Integration & Polish (T032-T034)
```

---

## PHASE A: Supabase Migration (Foundation)

**Prerequisites**: Supabase account, production credentials ready

### A.1: Environment & Configuration

- [ ] **T001** Create Supabase project and obtain connection credentials

  - Sign up/login to Supabase
  - Create new project: "portfolio-production"
  - Copy DATABASE_URL from project settings
  - Note down SSL certificate requirements
  - **Output**: DATABASE_URL for all environments

- [ ] **T002** Create environment configuration files

  - Create `web/.env.local` with Supabase DATABASE_URL
  - Create `web/.env.staging` with staging DATABASE_URL
  - Create `web/.env.production` with production DATABASE_URL
  - Add `.env.*` to `.gitignore` if not already present
  - Document environment variables in `web/README.md`
  - **Files**: `web/.env.local`, `web/.env.staging`, `web/.env.production`

- [ ] **T003** Update database connection configuration
  - Modify `web/src/db/index.ts` to use environment-based DATABASE_URL
  - Add SSL/TLS configuration (required for production, optional for dev)
  - Set connection timeout to 5 seconds
  - Update pool config if needed for Supabase
  - Remove Docker-specific connection logic
  - **File**: `web/src/db/index.ts`

### A.2: Database Initialization

- [ ] **T004** Create database seed script for existing schema

  - Create `web/scripts/seed-supabase.ts`
  - Add table creation for: posts, topics, post_topics, authorProfiles, adminUsers
  - Include sample data for testing (optional)
  - Add admin user seed
  - Make script idempotent (check if tables exist)
  - **File**: `web/scripts/seed-supabase.ts`

- [ ] **T005** Test Supabase connection and verify existing functionality
  - Run seed script: `npm run db:seed`
  - Verify connection works in all environments
  - Test existing CRUD operations on posts
  - Confirm SSL/TLS is working in production
  - Check connection timeout behavior
  - **Validation**: All existing queries work with Supabase

### A.3: Cleanup

- [ ] **T006** Remove Docker infrastructure
  - Delete `docker-compose.yml`
  - Delete any Dockerfiles (e.g., `web/Dockerfile.dev`)
  - Remove Docker-related npm scripts from `package.json`
  - Update `README.md` to remove Docker setup instructions
  - Add Supabase setup instructions to `README.md`
  - **Files**: Delete `docker-compose.yml`, update `README.md`

---

## PHASE B: Blog & Project CRUD (New Functionality)

**Prerequisites**: Phase A complete, Supabase connection working

### B.1: Database Schema

- [ ] **T007** [P] Create migration for new core tables (hashtags, technologies, projects)

  - Create migration file: `web/drizzle/0001_add_blog_project_metadata.sql`
  - Define hashtags table (id, name, slug, description, createdAt)
  - Define technologies table (id, name, slug, description, createdAt)
  - Define projects table (id, title, slug, status, description, images, githubUrl, liveUrl, startDate, endDate, isOngoing, createdAt, updatedAt)
  - Add status enum for projects: `CREATE TYPE project_status AS ENUM ('DRAFT', 'PUBLISHED')`
  - Add unique constraints on slugs
  - Add indexes on slug and status fields
  - **File**: `web/drizzle/0001_add_blog_project_metadata.sql`

- [ ] **T008** [P] Create migration for junction tables

  - Create migration file: `web/drizzle/0002_add_junction_tables.sql`
  - Define post_hashtags table with CASCADE delete
  - Define project_hashtags table with CASCADE delete
  - Define project_technologies table with CASCADE delete
  - Add composite primary keys
  - Add foreign key constraints with ON DELETE CASCADE
  - **File**: `web/drizzle/0002_add_junction_tables.sql`

- [ ] **T009** Update Drizzle schema with new tables and relations
  - Update `web/src/db/schema.ts`
  - Add hashtags, technologies, projects table definitions
  - Add junction table definitions (post_hashtags, project_hashtags, project_technologies)
  - Define all Drizzle relations (postsRelations, projectsRelations, etc.)
  - Export TypeScript types (Hashtag, Technology, Project, etc.)
  - Add extended types with relations (ProjectWithRelations, etc.)
  - **File**: `web/src/db/schema.ts`

### B.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE B.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY service/API implementation**

- [X] **T010** [P] Contract tests for Blog API

  - Create `web/tests/contract/blog-api.test.ts`
  - Test GET /api/blog (list with pagination)
  - Test GET /api/blog/:id (single blog with relations)
  - Test POST /api/blog (create with topics and hashtags)
  - Test PUT /api/blog/:id (update)
  - Test DELETE /api/blog/:id
  - **File**: `web/tests/contract/blog-api.test.ts`
  - **Status**: Tests MUST FAIL initially

- [X] **T011** [P] Contract tests for Project API

  - Create `web/tests/contract/project-api.test.ts`
  - Test GET /api/projects (list with filters)
  - Test GET /api/projects/:id (single project with relations)
  - Test POST /api/projects (create with technologies)
  - Test PUT /api/projects/:id (update)
  - Test DELETE /api/projects/:id
  - **File**: `web/tests/contract/project-api.test.ts`
  - **Status**: Tests MUST FAIL initially

- [X] **T012** [P] Contract tests for Metadata APIs (hashtags, topics, technologies)

  - Create `web/tests/contract/metadata-api.test.ts`
  - Test GET/POST /api/hashtags
  - Test PUT/DELETE /api/hashtags/:id
  - Test GET/POST /api/topics
  - Test PUT/DELETE /api/topics/:id
  - Test GET/POST /api/technologies
  - Test PUT/DELETE /api/technologies/:id
  - **File**: `web/tests/contract/metadata-api.test.ts`
  - **Status**: Tests MUST FAIL initially

- [X] **T013** [P] Integration test for blog CRUD flow

  - Create `web/tests/integration/blog-crud.test.ts`
  - Test complete flow: create blog → add topics inline → add hashtags → update → delete
  - Verify cascade deletion (delete topic, blog should lose association)
  - Test draft/published status transitions
  - **File**: `web/tests/integration/blog-crud.test.ts`
  - **Status**: Tests MUST FAIL initially

- [X] **T014** [P] Integration test for project CRUD flow

  - Create `web/tests/integration/project-crud.test.ts`
  - Test complete flow: create project → add technologies → update → delete
  - Verify cascade deletion (delete technology, project should lose association)
  - Test draft/published status transitions
  - **File**: `web/tests/integration/project-crud.test.ts`
  - **Status**: Tests MUST FAIL initially

- [X] **T015** [P] Integration test for visitor filtering
  - Create `web/tests/integration/filtering.test.ts`
  - Test filter blogs by topic
  - Test filter blogs by hashtag
  - Test filter projects by technology
  - Test search by title
  - Test pagination
  - **File**: `web/tests/integration/filtering.test.ts`
  - **Status**: Tests MUST FAIL initially

### B.3: Service Layer (ONLY after B.2 tests are failing)

- [X] **T016** [P] Implement blog service with pure functions

  - Create `web/src/services/blog.ts`
  - Functions: createBlog, getBlog, listBlogs, updateBlog, deleteBlog
  - Handle topic and hashtag associations
  - Use transactions for create/update with associations
  - All functions pure (no mutations, explicit I/O)
  - **File**: `web/src/services/blog.ts`

- [X] **T017** [P] Implement project service with pure functions

  - Create `web/src/services/project.ts`
  - Functions: createProject, getProject, listProjects, updateProject, deleteProject
  - Handle technology and hashtag associations
  - Use transactions for create/update with associations
  - All functions pure (no mutations, explicit I/O)
  - **File**: `web/src/services/project.ts`

- [X] **T018** [P] Implement hashtag service

  - Create `web/src/services/hashtag.ts`
  - Functions: createHashtag, listHashtags, updateHashtag, deleteHashtag
  - Validate unique name/slug
  - **File**: `web/src/services/hashtag.ts`

- [X] **T019** [P] Implement topic service

  - Create `web/src/services/topic.ts`
  - Functions: createTopic, listTopics, updateTopic, deleteTopic
  - Validate unique name/slug
  - **File**: `web/src/services/topic.ts`

- [X] **T020** [P] Implement technology service

  - Create `web/src/services/technology.ts`
  - Functions: createTechnology, listTechnologies, updateTechnology, deleteTechnology
  - Validate unique name/slug
  - **File**: `web/src/services/technology.ts`

- [X] **T021** Create Zod validation schemas
  - Create `web/src/lib/validation.ts`
  - Schema for CreateBlogRequest, UpdateBlogRequest
  - Schema for CreateProjectRequest, UpdateProjectRequest
  - Schema for CreateHashtagRequest, CreateTopicRequest, CreateTechnologyRequest
  - Validate slugs (pattern: ^[a-z0-9-]+$)
  - Validate URLs (GitHub, live URLs, images)
  - **File**: `web/src/lib/validation.ts`

### B.4: API Routes

- [X] **T022** Implement Blog API routes

  - Create `web/src/app/api/blog/route.ts` (GET list, POST create)
  - Create `web/src/app/api/blog/[id]/route.ts` (GET single, PUT update, DELETE)
  - Call blog service functions (no business logic in routes)
  - Use Zod schemas for validation
  - Return appropriate HTTP status codes
  - **Files**: `web/src/app/api/blog/route.ts`, `web/src/app/api/blog/[id]/route.ts`

- [X] **T023** Implement Project API routes

  - Create `web/src/app/api/projects/route.ts` (GET list, POST create)
  - Create `web/src/app/api/projects/[id]/route.ts` (GET single, PUT update, DELETE)
  - Call project service functions
  - Use Zod schemas for validation
  - Return appropriate HTTP status codes
  - **Files**: `web/src/app/api/projects/route.ts`, `web/src/app/api/projects/[id]/route.ts`

- [X] **T024** Implement Metadata API routes (hashtags, topics, technologies)

  - Create `web/src/app/api/hashtags/route.ts` and `web/src/app/api/hashtags/[id]/route.ts`
  - Create `web/src/app/api/topics/route.ts` and `web/src/app/api/topics/[id]/route.ts`
  - Create `web/src/app/api/technologies/route.ts` and `web/src/app/api/technologies/[id]/route.ts`
  - Call respective service functions
  - Use Zod schemas for validation
  - **Files**: 6 route files for metadata APIs

- [ ] **T025** Add super admin authentication middleware
  - Create or update `web/src/middleware.ts`
  - Protect all mutation endpoints (POST, PUT, DELETE) on /api/blog, /api/projects, /api/hashtags, /api/topics, /api/technologies
  - Verify admin session and role
  - Return 401 Unauthorized if not authenticated
  - **File**: `web/src/middleware.ts`

### B.5: UI Components

- [ ] **T026** [P] Create HashtagSelect component with inline creation

  - Create `web/src/components/admin/HashtagSelect.tsx`
  - Combobox with search/filter functionality
  - Allow selecting multiple existing hashtags
  - Allow creating new hashtag inline (type + Enter)
  - Optimistic UI updates
  - **File**: `web/src/components/admin/HashtagSelect.tsx`

- [ ] **T027** [P] Create TopicSelect component with inline creation

  - Create `web/src/components/admin/TopicSelect.tsx`
  - Combobox with search/filter functionality
  - Allow selecting multiple existing topics
  - Allow creating new topic inline (type + Enter)
  - Optimistic UI updates
  - **File**: `web/src/components/admin/TopicSelect.tsx`

- [ ] **T028** [P] Create TechnologySelect component with inline creation

  - Create `web/src/components/admin/TechnologySelect.tsx`
  - Combobox with search/filter functionality
  - Allow selecting multiple existing technologies
  - Allow creating new technology inline (type + Enter)
  - Optimistic UI updates
  - **File**: `web/src/components/admin/TechnologySelect.tsx`

- [ ] **T029** Create BlogForm component

  - Create `web/src/components/admin/BlogForm.tsx`
  - Form fields: title, slug, content, excerpt, coverImage, status
  - Integrate TopicSelect and HashtagSelect components
  - Handle create and edit modes
  - Form validation
  - **File**: `web/src/components/admin/BlogForm.tsx`
  - **Depends**: T026, T027

- [ ] **T030** Create ProjectForm component
  - Create `web/src/components/admin/ProjectForm.tsx`
  - Form fields: title, slug, description, images, githubUrl, liveUrl, startDate, endDate, isOngoing, status
  - Integrate TechnologySelect and HashtagSelect components
  - Handle create and edit modes
  - Form validation
  - **File**: `web/src/components/admin/ProjectForm.tsx`
  - **Depends**: T026, T028

### B.6: Admin Pages

- [ ] **T031** Build blog admin pages

  - Create `web/src/app/admin/blogs/page.tsx` (list view with filters)
  - Create `web/src/app/admin/blogs/new/page.tsx` (create form)
  - Create `web/src/app/admin/blogs/[id]/page.tsx` (edit form)
  - Display blogs with topics and hashtags
  - Add pagination
  - **Files**: 3 page files for blog management
  - **Depends**: T029

- [ ] **T032** Build project admin pages
  - Create `web/src/app/admin/projects/page.tsx` (list view with filters)
  - Create `web/src/app/admin/projects/new/page.tsx` (create form)
  - Create `web/src/app/admin/projects/[id]/page.tsx` (edit form)
  - Display projects with technologies
  - Add pagination
  - **Files**: 3 page files for project management
  - **Depends**: T030

### B.7: Integration & Polish

- [ ] **T033** Run all tests and fix failures

  - Run contract tests: `npm run test:contract`
  - Run integration tests: `npm run test:integration`
  - Fix any failing tests
  - Verify all tests pass
  - Check test coverage (target: 85%+ for new code)
  - **Validation**: All tests green

- [ ] **T034** Execute manual testing scenarios from quickstart.md
  - Follow all 10 scenarios in `specs/002-supabase-and-crud/quickstart.md`
  - Verify inline creation works for topics, hashtags, technologies
  - Verify cascade deletion behavior
  - Test filtering on public site
  - Measure API response times (target: <200ms p95)
  - **Validation**: All quickstart scenarios pass, performance targets met

---

## Dependencies

### Critical Path

```
T001 → T002 → T003 → T004 → T005 → T006 (Phase A complete)
  ↓
T007, T008 (parallel) → T009 (schema complete)
  ↓
T010, T011, T012, T013, T014, T015 (parallel - all tests written)
  ↓
T016, T017, T018, T019, T020 (parallel - services) → T021 (validation)
  ↓
T022, T023, T024 (parallel - APIs) → T025 (auth middleware)
  ↓
T026, T027, T028 (parallel - select components)
  ↓
T029 (BlogForm), T030 (ProjectForm) in parallel
  ↓
T031 (blog pages), T032 (project pages) in parallel
  ↓
T033 (tests) → T034 (manual validation)
```

### Task Blockers

- **Phase B cannot start until Phase A is complete** (T007 blocked by T006)
- **Services blocked by tests** (T016-T020 blocked by T010-T015)
- **APIs blocked by services** (T022-T024 blocked by T021)
- **Forms blocked by select components** (T029 blocked by T026+T027, T030 blocked by T026+T028)
- **Pages blocked by forms** (T031 blocked by T029, T032 blocked by T030)

---

## Parallel Execution Examples

### Phase A - Sequential

```bash
# Phase A tasks must be sequential (environment setup)
T001 → T002 → T003 → T004 → T005 → T006
```

### Phase B - Database Schema (Parallel where possible)

```bash
# T007 and T008 can run in parallel (different migration files)
Task: "Create migration for core tables in web/drizzle/0001_add_blog_project_metadata.sql"
Task: "Create migration for junction tables in web/drizzle/0002_add_junction_tables.sql"
```

### Phase B - Tests (All Parallel)

```bash
# T010-T015 can ALL run in parallel (different test files, no dependencies)
Task: "Contract tests for Blog API in web/tests/contract/blog-api.test.ts"
Task: "Contract tests for Project API in web/tests/contract/project-api.test.ts"
Task: "Contract tests for Metadata APIs in web/tests/contract/metadata-api.test.ts"
Task: "Integration test blog CRUD in web/tests/integration/blog-crud.test.ts"
Task: "Integration test project CRUD in web/tests/integration/project-crud.test.ts"
Task: "Integration test filtering in web/tests/integration/filtering.test.ts"
```

### Phase B - Services (All Parallel)

```bash
# T016-T020 can ALL run in parallel (different service files)
Task: "Implement blog service in web/src/services/blog.ts"
Task: "Implement project service in web/src/services/project.ts"
Task: "Implement hashtag service in web/src/services/hashtag.ts"
Task: "Implement topic service in web/src/services/topic.ts"
Task: "Implement technology service in web/src/services/technology.ts"
```

### Phase B - UI Components (Parallel)

```bash
# T026-T028 can run in parallel (different component files)
Task: "Create HashtagSelect in web/src/components/admin/HashtagSelect.tsx"
Task: "Create TopicSelect in web/src/components/admin/TopicSelect.tsx"
Task: "Create TechnologySelect in web/src/components/admin/TechnologySelect.tsx"
```

---

## Validation Checklist

**Before marking Phase A complete**:

- [ ] Supabase project created and accessible
- [ ] All environment files created with correct DATABASE_URL
- [ ] Connection works in all environments (dev, staging, prod)
- [ ] SSL/TLS verified in production
- [ ] Existing schema seeded successfully
- [ ] Docker files removed
- [ ] README updated with Supabase setup

**Before marking Phase B complete**:

- [ ] All 6 new tables created (hashtags, technologies, projects, 3 junctions)
- [ ] All tests written and passing
- [ ] All 5 services implemented (blog, project, hashtag, topic, technology)
- [ ] All API routes functional (blog, projects, metadata)
- [ ] Admin authentication working
- [ ] All UI components functional with inline creation
- [ ] Admin pages working for blogs and projects
- [ ] Manual testing scenarios pass
- [ ] Performance targets met (<200ms p95)

**Constitution Compliance**:

- [ ] All business logic in services (pure functions)
- [ ] No logic in API routes (delegation only)
- [ ] Strict TypeScript typing throughout
- [ ] TDD followed (tests before implementation)
- [ ] 85%+ test coverage for new code
- [ ] No N+1 queries (proper joins via Drizzle)

---

## Notes

- **[P] marker**: Tasks can run in parallel (different files, no shared state)
- **TDD Critical**: T010-T015 MUST fail before implementing T016-T024
- **Commit Strategy**: Commit after each task completion
- **Phase Gate**: Do NOT start Phase B until Phase A is deployed and verified
- **Rollback Plan**: Each phase can be rolled back independently
- **Performance**: Measure API latencies in T034, must be <200ms p95

---

**Total Estimated Effort**: 6-9 days  
**Phase A**: 1-2 days  
**Phase B**: 5-7 days

**Ready for execution**: Yes ✅  
**Prerequisites met**: Supabase account required, admin credentials ready
