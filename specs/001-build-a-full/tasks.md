# Tasks: Developer Portfolio Website with Blog

**Input**: Design documents from `/specs/001-build-a-full/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, API routes
   → Integration: DB, logging, GA4, Ads
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
9. Return: SUCCESS (tasks ready for execution)
```

## Path Conventions

- Next.js App Router project under repository root (to be scaffolded)
- Use `src/app/` for routing and `src/app/api` for route handlers
- Business logic in `src/services/` as pure functions
- Database access via Drizzle ORM: schema in `src/db/schema.ts`, client in `src/db/index.ts`, and service/DAL adapters in `src/services/db/*`
- Tests under `tests/`

## Phase 3.1: Setup

- [x] T001 Initialize Next.js (App Router) project in repo root
- [x] T002 Add Tailwind CSS and configure shadcn/ui
- [x] T003 Configure ESLint/Prettier with strict TypeScript rules
- [x] T004 [P] Add docker-compose support (web + Postgres)
- [x] T005 Configure env handling: `.env.local`, `DATABASE_URL`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

- [x] T006 [P] Contract test admin login per `contracts/openapi.yaml`
- [x] T007 [P] Contract test admin list/create posts
- [x] T008 [P] Contract test admin update/delete post
- [x] T009 [P] Contract test public list posts (topic filter)
- [x] T010 [P] Contract test public get post by slug
- [x] T011 [P] Integration test: admin creates draft, publishes, visible on blog
- [x] T012 [P] Integration test: GA4 metrics visible in dashboard

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [x] T013 [P] Define Drizzle schema for Post, Topic, AuthorProfile, AdminUser (`src/db/schema.ts`)
- [x] T014 [P] Configure Drizzle (drizzle-kit) migrations for PostgreSQL and baseline migration
- [x] T015 [P] Implement post services using Drizzle (CRUD, publish/unpublish)
- [x] T016 [P] Implement topic services using Drizzle (list/assign)
- [x] T017 [P] Admin auth (local) with Drizzle queries + password hashing
- [x] T018 [P] API route: POST `/api/admin/login`
- [x] T019 API routes: GET/POST `/api/admin/posts`
- [x] T020 API routes: PATCH/DELETE `/api/admin/posts/{slug}`
- [x] T021 API route: GET `/api/blog/posts`
- [x] T022 API route: GET `/api/blog/posts/{slug}`
- [x] T023 [P] CMS dashboard pages under `src/app/admin/*`
- [x] T024 [P] Public pages: home, projects, blog index, blog post

## Phase 3.4: Integration

- [x] T025 Configure Drizzle connection pooling (pg `Pool`) and run migrations in dev/CI
- [x] T026 GA4 integration and admin dashboard KPIs
- [x] T027 Google Ads integration on blog pages
- [x] T028 Structured logging and error boundaries
- [x] T029 Security headers and basic rate limiting

## Phase 3.D: Replace Prisma with Drizzle (MANDATORY rework)

- [x] T034 Remove Prisma from project
  - Delete: `/Users/kien.ha/Code/porfolio/web/prisma/schema.prisma`
  - Delete: `/Users/kien.ha/Code/porfolio/web/src/lib/db.ts`
  - Update `/Users/kien.ha/Code/porfolio/web/package.json`: remove `prisma`, `@prisma/client`, prisma scripts
- [x] T035 Add Drizzle dependencies and config
  - Install (in `/Users/kien.ha/Code/porfolio/web`): `drizzle-orm`, `drizzle-kit`, `pg`, `dotenv`
  - Create `/Users/kien.ha/Code/porfolio/web/drizzle.config.ts` (schema: `src/db/schema.ts`, out: `drizzle/`)
  - Update `/Users/kien.ha/Code/porfolio/web/package.json` scripts: `db:generate`, `db:migrate`, `db:seed`
- [x] T036 Create Drizzle schema
  - New file: `/Users/kien.ha/Code/porfolio/web/src/db/schema.ts` (tables: posts, topics, post_topics, author_profiles, admin_users; enum PostStatus)
- [x] T037 Create Drizzle client
  - New file: `/Users/kien.ha/Code/porfolio/web/src/db/index.ts` (pg `Pool` + `drizzle` export `db`)
- [x] T038 Generate initial migration from schema
  - Run (in `/Users/kien.ha/Code/porfolio/web`): `npm run db:generate` → outputs under `/Users/kien.ha/Code/porfolio/web/drizzle/`
- [x] T039 Apply migrations to Postgres
  - Run (in `/Users/kien.ha/Code/porfolio/web`): `npm run db:migrate` (requires database running)
- [x] T040 Seed admin user
  - New file: `/Users/kien.ha/Code/porfolio/web/scripts/seed-admin.ts` (hash password, upsert admin)
  - Run: `npm run db:seed` (after migrations)
- [x] T041 Refactor services to Drizzle
  - Update: `/Users/kien.ha/Code/porfolio/web/src/services/posts.ts`
  - Update: `/Users/kien.ha/Code/porfolio/web/src/services/topics.ts`
  - Update: `/Users/kien.ha/Code/porfolio/web/src/services/auth.ts`
- [x] T042 Verify API routes with Drizzle services
  - Validate handlers compile/run under `/Users/kien.ha/Code/porfolio/web/src/app/api/**`
- [x] T043 [P] Run tests and fix type errors
  - Commands (in `/Users/kien.ha/Code/porfolio/web`): `npm run lint`, `npm run build`, `npm run test:run`
- [x] T044 [P] Update docker/dev flow to run migrations automatically (optional)
  - Pre-dev script to call `db:migrate` if pending
- [x] T045 Cleanup and docs
  - Remove remaining Prisma mentions/files; update quickstart/README with Drizzle commands

## Phase 3.5: Polish

- [x] T030 [P] Unit tests for services and helpers
- [x] T031 Performance checks (LCP, TTI, CLS); JS budget enforcement
- [x] T032 [P] Accessibility pass (WCAG 2.1 AA basics)
- [x] T033 [P] Update docs: quickstart, README, API usage

## Dependencies

- Tests (T006–T012) before implementation (T013–T024)
- Models/migrations (T013–T014) before services/endpoints (T015–T022)
- Auth (T017) before admin routes (T018–T020)
- Public data routes (T021–T022) depend on posts services
- GA4/Ads (T026–T027) depend on pages existing

## Parallel Example

```
# Launch T006–T010 together:
/specify tasks run T006
/specify tasks run T007
/specify tasks run T008
/specify tasks run T009
/specify tasks run T010
```
