# Implementation Plan: Supabase Migration + Blog & Project CRUD

**Branch**: `002-supabase-and-crud` | **Date**: 2025-09-30 | **Spec**: [spec.md](./spec.md)

**Merged From**:

- Feature 002: Database migration (Docker → Supabase)
- Feature 003: Blog and Project CRUD

---

## Summary

Combined implementation that migrates database infrastructure to Supabase THEN adds new blog/project CRUD functionality. This approach ensures:

- Single deployment cycle
- Supabase foundation ready before adding new tables
- Cleaner implementation sequence
- Faster overall delivery

**Technical Approach**:

1. **Phase A**: Migrate to Supabase, seed existing schema, remove Docker
2. **Phase B**: Add new tables (hashtags, technologies, projects) + CRUD functionality

---

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+  
**Primary Dependencies**: Next.js 14+, React, Drizzle ORM, PostgreSQL (Supabase)  
**Storage**: PostgreSQL (Supabase) - NEW (migrating from Docker)  
**Testing**: Vitest for unit tests, Playwright for E2E tests  
**Target Platform**: Web (SSR + Client-side React)  
**Project Type**: web (Next.js full-stack application)  
**Performance Goals**: <200ms API response time, <2.5s LCP  
**Constraints**: Super admin only, cascade deletion, minimal validation

---

## Constitution Check

**Status**: ✅ **PASS** (No violations)

All constitutional principles verified for both phases.

---

## Implementation Sequence

### Phase A: Supabase Migration (Foundation)

**Tasks A1-A5: Database Infrastructure**

1. **A1**: Create Supabase project and configure connection

   - Set up Supabase project
   - Get DATABASE_URL connection string
   - Configure SSL certificates

2. **A2**: Update environment configuration

   - Create `.env.local`, `.env.staging`, `.env.production`
   - Add DATABASE_URL to each environment
   - Document environment variables

3. **A3**: Modify database connection in `web/src/db/index.ts`

   - Update connection config to use Supabase URL
   - Add SSL/TLS settings (required for prod, optional for dev)
   - Set 5-second connection timeout

4. **A4**: Create seed script for existing schema

   - Script to create: posts, topics, post_topics, authorProfiles, adminUsers
   - Include sample data for testing
   - Add admin user seed

5. **A5**: Test Supabase connection

   - Verify all existing queries work
   - Test CRUD operations
   - Confirm SSL/TLS working in production

6. **A6**: Remove Docker infrastructure
   - Delete `docker-compose.yml`
   - Delete any Dockerfiles
   - Update documentation (README)

### Phase B: Blog & Project CRUD (New Functionality)

**Tasks B1-B3: Database Schema** [AFTER Phase A complete]

1. **B1**: Create migration for new core tables

   - Create: hashtags, technologies, projects tables
   - Add status enum for projects
   - Include all constraints and indexes

2. **B2**: Create migration for junction tables

   - Create: post_hashtags, project_hashtags, project_technologies
   - Add cascade delete constraints
   - Composite primary keys

3. **B3**: Update Drizzle schema with relations
   - Define all relations in schema.ts
   - Add TypeScript types
   - Export relation helpers

**Tasks B4-B9: Service Layer (TDD)**

4. **B4**: Write contract tests for blog API [P]
5. **B5**: Write contract tests for project API [P]
6. **B6**: Write contract tests for metadata APIs [P]
7. **B7**: Implement blog service (make tests pass)
8. **B8**: Implement project service (make tests pass)
9. **B9**: Implement metadata services (make tests pass)

**Tasks B10-B13: API Routes**

10. **B10**: Implement blog API routes
11. **B11**: Implement project API routes
12. **B12**: Implement metadata API routes
13. **B13**: Add super admin authentication middleware

**Tasks B14-B18: UI Components**

14. **B14**: Create HashtagSelect component (inline creation) [P]
15. **B15**: Create TopicSelect component (inline creation) [P]
16. **B16**: Create TechnologySelect component (inline creation) [P]
17. **B17**: Create BlogForm component
18. **B18**: Create ProjectForm component

**Tasks B19-B22: Admin Pages**

19. **B19**: Build blog list admin page
20. **B20**: Build blog create/edit admin pages
21. **B21**: Build project list admin page
22. **B22**: Build project create/edit admin pages

**Tasks B23-B28: Testing & Validation**

23. **B23**: Write integration test for blog CRUD flow
24. **B24**: Write integration test for project CRUD flow
25. **B25**: Write integration test for visitor filtering
26. **B26**: Run all tests and fix failures
27. **B27**: Execute quickstart.md manual scenarios
28. **B28**: Performance validation (measure API latencies)

---

## Task Count Summary

- **Phase A (Supabase Migration)**: 6 tasks (A1-A6)
- **Phase B (Blog/Project CRUD)**: 22 tasks (B1-B28)
- **Total**: 28 tasks

**Estimated Timeline**:

- Phase A: 1-2 days (foundation)
- Phase B: 5-7 days (new functionality)
- **Total**: 6-9 days

---

## Dependencies

**Phase A Dependencies**:

- Supabase account and project
- Production environment variables
- SSL certificates (provided by Supabase)

**Phase B Dependencies**:

- Phase A must be complete and deployed
- Supabase connection working in all environments

**Critical Path**:

```
A1 → A2 → A3 → A4 → A5 → A6 (Phase A complete)
  ↓
B1 → B2 → B3 (Database schema)
  ↓
B4,B5,B6 (Tests - parallel)
  ↓
B7,B8,B9 (Services)
  ↓
B10,B11,B12 → B13 (API routes)
  ↓
B14,B15,B16 (Components - parallel) → B17,B18 (Forms)
  ↓
B19,B20,B21,B22 (Admin pages)
  ↓
B23,B24,B25 (Integration tests) → B26,B27,B28 (Validation)
```

---

## Rollback Strategy

**If Phase A fails**:

- Revert to Docker setup (git revert)
- No data loss (fresh Supabase database)
- Quick rollback (< 5 minutes)

**If Phase B fails**:

- Phase A (Supabase) remains intact
- Roll back new tables only
- Existing functionality unaffected

**Advantage of Merging**:

- Single atomic deployment
- No intermediate unstable state
- Clear rollback boundaries

---

## Artifacts

### From Feature 002 (Supabase Migration)

- Environment variable documentation
- Supabase connection configuration
- Seed scripts

### From Feature 003 (Blog/Project CRUD)

- [data-model.md](./data-model.md) - Database schema for new tables
- [contracts/](./contracts/) - API specifications
- [quickstart.md](./quickstart.md) - Manual testing guide
- [research.md](./research.md) - Technical decisions

**Note**: Artifacts copied from original specs/003-i-want-to/

---

## Success Criteria

**Phase A Success**:

- ✅ Application connects to Supabase (all environments)
- ✅ Existing schema seeded successfully
- ✅ All existing queries work
- ✅ Docker files removed
- ✅ SSL/TLS working in production
- ✅ Connection timeout set to 5 seconds

**Phase B Success**:

- ✅ All 28 tasks complete
- ✅ Blog and project CRUD functional
- ✅ Inline metadata creation working
- ✅ Visitor filtering operational
- ✅ Cascade deletion verified
- ✅ Performance targets met (<200ms p95)
- ✅ All tests passing (unit, contract, integration)

---

## Progress Tracking

**Phase Status**:

- [ ] Phase A: Supabase migration complete (6 tasks)
- [ ] Phase B: Blog/Project CRUD complete (22 tasks)
- [ ] Integration testing complete
- [ ] Performance validation complete
- [ ] Deployment to production complete

---

**Next Step**: Run `/tasks` to generate detailed task breakdown for implementation

---

_Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`_
