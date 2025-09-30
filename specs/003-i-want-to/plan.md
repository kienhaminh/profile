# Implementation Plan: Blog and Project CRUD Management

**Branch**: `003-i-want-to` | **Date**: 2025-09-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-i-want-to/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path → ✅ DONE
2. Fill Technical Context → ✅ DONE
   → Project Type: web (Next.js frontend + backend)
   → Structure Decision: Web application
3. Fill Constitution Check section → ✅ DONE
4. Evaluate Constitution Check section → ✅ PASS
   → No violations
   → Update Progress Tracking: Initial Constitution Check ✅
5. Execute Phase 0 → research.md → ✅ DONE
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent file → ✅ DONE
7. Re-evaluate Constitution Check section → ✅ PASS
   → No new violations
   → Update Progress Tracking: Post-Design Constitution Check ✅
8. Plan Phase 2 → Describe task generation approach → ✅ DONE
9. STOP - Ready for /tasks command
```

## Summary

Add comprehensive CRUD management for blog posts and portfolio projects with metadata associations (topics, hashtags, technologies). Enhance existing `posts` table for blog management, create new `projects`, `hashtags`, and `technologies` tables with many-to-many relationships. Super administrator can create and manage all content with inline metadata creation. Visitors can filter content by topics, hashtags, and technologies.

**Key Technical Approach**:

- Leverage existing database schema (`posts`, `topics`, `post_topics` tables)
- Add 3 new core tables + 3 junction tables for many-to-many relationships
- Implement cascade deletion for clean association management
- Build admin UI with inline creation capabilities
- Create public filtering APIs for visitor discovery

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Primary Dependencies**: Next.js 14+, React, Drizzle ORM, PostgreSQL (Supabase)  
**Storage**: PostgreSQL (Supabase) - existing connection established  
**Testing**: Vitest for unit tests, Playwright for E2E tests  
**Target Platform**: Web (SSR + Client-side React)  
**Project Type**: web (Next.js full-stack application)  
**Performance Goals**: <200ms API response time for CRUD operations, <2.5s LCP for admin pages  
**Constraints**: Super admin only access, minimal validation (start simple), cascade deletion on associations  
**Scale/Scope**: Single admin user, ~100-200 blog posts, ~20-50 projects expected

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Code Quality (Simplicity, Purity, Maintainability)

- ✅ **Business logic in services**: All CRUD operations implemented in `@/services` as pure functions
- ✅ **Controllers delegate only**: API routes in `app/api/` call service functions, no logic
- ✅ **DRY/KISS/YAGNI**: Reuse existing `posts`/`topics` tables, shared hashtags table, no premature abstractions
- ✅ **Strict typing**: All entities, services, API routes fully typed with TypeScript
- ✅ **Descriptive naming**: Clear entity names (BlogPost, Project, Hashtag, Technology)
- ✅ **Explicit errors**: Service functions throw typed errors, logged before raising
- ✅ **No mutations**: Service functions return new objects, never mutate inputs

### II. Testing Standards (TDD, Determinism, Coverage)

- ✅ **TDD enforced**: Contract tests written first for all API endpoints
- ✅ **Test pyramid**: Unit tests for services, contract tests for APIs, integration tests for user flows
- ✅ **Deterministic**: Database tests use isolated transactions, no shared state
- ✅ **85% coverage minimum**: All new service functions and API routes covered
- ✅ **CI enforcement**: Tests run on PR, blocking merges on failures

### III. User Experience Consistency (Accessibility, Design System, Behavior)

- ✅ **Design system**: Reuse existing admin UI components (forms, tables, modals)
- ✅ **WCAG 2.1 AA**: Keyboard navigation, focus management, ARIA labels on interactive elements
- ✅ **Consistent states**: Loading, empty, error states for all admin views
- ✅ **Responsive**: Admin pages responsive across desktop/tablet breakpoints
- ✅ **Inline creation UX**: Consistent pattern for creating topics/hashtags/technologies inline

### IV. Performance Requirements (Budgets, Monitoring, Optimization Discipline)

- ✅ **Backend p95 < 200ms**: Database queries use proper indexes (slugs, foreign keys)
- ✅ **No N+1 queries**: Use Drizzle ORM joins for loading associations
- ✅ **Frontend LCP < 2.5s**: Server-side rendering for admin pages, code splitting
- ✅ **JS bundle budget**: <200KB gzipped per admin route
- ✅ **Pagination**: List endpoints paginated (20 items per page default)

**Status**: ✅ **PASS** - No constitution violations. Design follows all principles.

## Project Structure

### Documentation (this feature)

```
specs/003-i-want-to/
├── spec.md             # Feature specification (complete)
├── plan.md             # This file (/plan command output)
├── research.md         # Phase 0 output (/plan command) ✅
├── data-model.md       # Phase 1 output (/plan command) ✅
├── quickstart.md       # Phase 1 output (/plan command) ✅
├── contracts/          # Phase 1 output (/plan command) ✅
│   ├── blog-api.yaml
│   ├── project-api.yaml
│   ├── hashtag-api.yaml
│   ├── topic-api.yaml
│   └── technology-api.yaml
└── tasks.md            # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```
web/
├── src/
│   ├── db/
│   │   ├── schema.ts              # Enhanced: Add hashtags, technologies, projects tables
│   │   └── index.ts               # Database connection (existing)
│   ├── services/
│   │   ├── blog.ts                # New: Blog CRUD operations (pure functions)
│   │   ├── project.ts             # New: Project CRUD operations
│   │   ├── hashtag.ts             # New: Hashtag management
│   │   ├── topic.ts               # New: Topic management
│   │   └── technology.ts          # New: Technology management
│   ├── app/
│   │   ├── api/
│   │   │   ├── blog/
│   │   │   │   ├── route.ts       # GET /api/blog (list with filters)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   # GET/PUT/DELETE /api/blog/:id
│   │   │   ├── projects/
│   │   │   │   ├── route.ts       # GET/POST /api/projects
│   │   │   │   └── [id]/route.ts  # GET/PUT/DELETE /api/projects/:id
│   │   │   ├── hashtags/
│   │   │   │   ├── route.ts       # GET/POST /api/hashtags
│   │   │   │   └── [id]/route.ts  # PUT/DELETE /api/hashtags/:id
│   │   │   ├── topics/
│   │   │   │   ├── route.ts       # GET/POST /api/topics
│   │   │   │   └── [id]/route.ts  # PUT/DELETE /api/topics/:id
│   │   │   └── technologies/
│   │   │       ├── route.ts       # GET/POST /api/technologies
│   │   │       └── [id]/route.ts  # PUT/DELETE /api/technologies/:id
│   │   └── admin/
│   │       ├── blogs/
│   │       │   ├── page.tsx       # Admin blog list view
│   │       │   ├── new/page.tsx   # Create blog form
│   │       │   └── [id]/page.tsx  # Edit blog form
│   │       └── projects/
│   │           ├── page.tsx       # Admin project list view
│   │           ├── new/page.tsx   # Create project form
│   │           └── [id]/page.tsx  # Edit project form
│   ├── components/
│   │   └── admin/
│   │       ├── BlogForm.tsx       # Blog create/edit form with inline metadata
│   │       ├── ProjectForm.tsx    # Project create/edit form
│   │       ├── HashtagSelect.tsx  # Multi-select with inline create
│   │       ├── TopicSelect.tsx    # Multi-select with inline create
│   │       └── TechnologySelect.tsx # Multi-select with inline create
│   └── lib/
│       └── validation.ts          # Zod schemas for entities
└── tests/
    ├── contract/
    │   ├── blog-api.test.ts       # Contract tests for blog API
    │   ├── project-api.test.ts    # Contract tests for project API
    │   └── metadata-api.test.ts   # Tests for hashtags/topics/technologies
    ├── integration/
    │   ├── blog-crud.test.ts      # End-to-end blog management flow
    │   ├── project-crud.test.ts   # End-to-end project management flow
    │   └── filtering.test.ts      # Visitor filtering scenarios
    └── unit/
        ├── blog-service.test.ts   # Unit tests for blog service
        ├── project-service.test.ts # Unit tests for project service
        └── validation.test.ts     # Validation schema tests
```

**Structure Decision**: Web application structure selected based on existing Next.js codebase. Follows the established pattern with `web/` as the root, using `src/` for source code, `app/` for Next.js App Router, and `tests/` for test organization.

## Phase 0: Outline & Research

**Output**: [research.md](./research.md) ✅

Key research completed:

1. ✅ Database schema enhancement strategy (extend existing vs new tables)
2. ✅ Many-to-many relationship patterns in Drizzle ORM
3. ✅ Cascade deletion implementation with PostgreSQL constraints
4. ✅ Inline creation UX patterns (combobox with create option)
5. ✅ Next.js API route authentication for super admin only
6. ✅ Server-side filtering and pagination best practices

All technical decisions documented in research.md with rationale.

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_ ✅

**Output**:

- ✅ [data-model.md](./data-model.md) - Complete entity definitions and relationships
- ✅ [contracts/](./contracts/) - OpenAPI schemas for all 5 API groups
- ✅ [quickstart.md](./quickstart.md) - Manual testing scenarios
- ✅ `.cursorrules` - Updated with project context

### Generated Artifacts

1. **Data Model** (data-model.md):

   - 4 core entities: BlogPost (existing posts), Project, Hashtag, Technology
   - 3 junction tables: post_hashtags, project_hashtags, project_technologies
   - All relationships, constraints, and cascade rules defined

2. **API Contracts** (contracts/\*.yaml):

   - 5 OpenAPI 3.0 specifications
   - 23 total endpoints across all APIs
   - Request/response schemas for all operations

3. **Quickstart Guide** (quickstart.md):

   - Setup instructions for local development
   - Manual test scenarios for all user stories
   - Database seeding scripts

4. **Agent Context** (.cursorrules):
   - Updated with data model knowledge
   - Service layer patterns documented
   - Recent changes logged

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

1. **Database Schema Tasks** (execute first):

   - Task 1: Create migration for new tables (hashtags, technologies, projects) [P]
   - Task 2: Create migration for junction tables (post_hashtags, project_hashtags, project_technologies) [P]
   - Task 3: Add cascade delete constraints [depends on 1,2]

2. **Service Layer Tasks** (TDD: tests before implementation):

   - Task 4: Write contract tests for blog API [P]
   - Task 5: Write contract tests for project API [P]
   - Task 6: Write contract tests for metadata APIs (hashtags, topics, technologies) [P]
   - Task 7: Implement blog service (make tests pass) [depends on 3,4]
   - Task 8: Implement project service (make tests pass) [depends on 3,5]
   - Task 9: Implement metadata services (make tests pass) [depends on 3,6]

3. **API Route Tasks** (TDD: contract tests already exist):

   - Task 10: Implement blog API routes [depends on 7]
   - Task 11: Implement project API routes [depends on 8]
   - Task 12: Implement metadata API routes [depends on 9]
   - Task 13: Add super admin authentication middleware [depends on 10,11,12]

4. **UI Component Tasks** (bottom-up, reusable first):

   - Task 14: Create HashtagSelect component with inline creation [P]
   - Task 15: Create TopicSelect component with inline creation [P]
   - Task 16: Create TechnologySelect component with inline creation [P]
   - Task 17: Create BlogForm component [depends on 14,15]
   - Task 18: Create ProjectForm component [depends on 14,16]

5. **Admin Page Tasks**:

   - Task 19: Build blog list admin page [depends on 17]
   - Task 20: Build blog create/edit admin pages [depends on 17]
   - Task 21: Build project list admin page [depends on 18]
   - Task 22: Build project create/edit admin pages [depends on 18]

6. **Integration Test Tasks**:

   - Task 23: Write integration test for blog CRUD flow [depends on 20]
   - Task 24: Write integration test for project CRUD flow [depends on 22]
   - Task 25: Write integration test for visitor filtering [depends on 13]

7. **Validation & Polish Tasks**:
   - Task 26: Run all tests and fix failures [depends on 25]
   - Task 27: Execute quickstart.md manual scenarios [depends on 26]
   - Task 28: Performance validation (measure API latencies) [depends on 27]

**Ordering Strategy**:

- Database first (foundation)
- TDD: Tests before implementation at every layer
- Bottom-up UI: Reusable components before pages
- Integration tests after feature complete
- [P] markers indicate tasks that can run in parallel

**Estimated Output**: ~28 numbered, ordered tasks in tasks.md

**Dependencies**: Tasks use `[P]` for parallel execution and `[depends on X,Y]` for sequential dependencies

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_No constitutional violations - table not needed_

## Progress Tracking

**Phase Status**:

- [x] Phase 0: Research complete (/plan command) ✅
- [x] Phase 1: Design complete (/plan command) ✅
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved ✅
- [x] Complexity deviations documented: N/A ✅

---

_Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`_
