# Feature Specification: Supabase Migration + Blog & Project CRUD

**Feature Branch**: `002-supabase-and-crud`  
**Created**: September 30, 2025  
**Status**: Complete - Ready for Planning  
**Input**: Combined features: "Migrate to Supabase + Add blog and project CRUD management"

**Merged From**:

- Feature 002: Database migration (Docker → Supabase)
- Feature 003: Blog and Project CRUD with metadata

---

## Summary

This feature combines database infrastructure migration with new functionality in a single implementation:

1. **Phase A - Infrastructure**: Migrate from local Docker PostgreSQL to Supabase (all environments)
2. **Phase B - Functionality**: Add comprehensive blog and project CRUD with metadata (topics, hashtags, technologies)

**Why Merge**: Feature 003 assumes Supabase is already established. Implementing both together ensures:

- Single deployment cycle
- No intermediate migration state
- Cleaner git history
- Faster delivery

---

## Clarifications

### Session 2025-09-30 (Database Migration)

- Q: How should Supabase database credentials be managed? → A: Environment variables only (`.env` files, not committed to git)
- Q: What should happen if database migrations fail during application startup? → A: Do not need migration database. Just seed again
- Q: Should the Supabase database connection use SSL/TLS encryption? → A: Yes for production, optional for development
- Q: What is the acceptable database connection timeout duration? → A: 5 seconds (balance between responsiveness and reliability)
- Q: What should happen to the existing `docker-compose.yml` file? → A: Remove entirely (no Docker needed)

### Session 2025-09-30 (Blog & Project CRUD)

- Q: How does "blog" relate to the existing "posts" table? → A: Blogs = posts (enhance existing table)
- Q: Are "categories" the same as "topics" table? → A: Yes, categories = topics
- Q: How should hashtags be implemented? → A: Managed entities with separate hashtags table (shared)
- Q: What are the required fields for Project entity? → A: Title, description, images, GitHub URL, live URL, tech stack, dates
- Q: Can a blog have multiple topics? → A: Yes, many-to-many via existing post_topics table
- Q: Can admins create topics/hashtags inline? → A: Yes, inline creation while editing content
- Q: Are topics flat or hierarchical? → A: Start flat; hierarchical deferred to future
- Q: Are there limits on topics/hashtags per item? → A: Unlimited initially
- Q: Who can perform CRUD operations? → A: Only super admin
- Q: What validation rules? → A: Minimal validation (start simple)
- Q: Tech stack as managed entity or array? → A: Managed entity table
- Q: What happens when deleting metadata in use? → A: Cascade delete (auto-remove associations)

---

## User Scenarios & Testing

### Part A: Database Migration Scenarios

**A1. Database Connection**

**Given** the application currently uses local Docker PostgreSQL  
**When** the database connection is changed to Supabase URL  
**Then** the application must connect successfully and perform all operations

**A2. Schema Seeding**

**Given** an empty Supabase database  
**When** the database is seeded  
**Then** existing schema (posts, topics, authorProfiles, adminUsers) must be established

**A3. Docker Cleanup**

**Given** Supabase is configured and working  
**When** docker-compose.yml is removed  
**Then** application runs without Docker dependencies

### Part B: Blog & Project CRUD Scenarios

**B1. Create Blog with Inline Metadata**

**Given** I am super admin  
**When** I create a blog with topics (selecting existing + creating new inline) and hashtags  
**Then** blog is saved with all associations

**B2. Create Project with Technologies**

**Given** I am super admin  
**When** I create a project with title, description, images, URLs, technologies, and dates  
**Then** project is saved with all metadata

**B3. Update Blog Metadata**

**Given** an existing blog  
**When** I add/remove topics and hashtags  
**Then** associations are updated correctly

**B4. Delete Metadata (Cascade)**

**Given** a hashtag is used by multiple blogs  
**When** I delete the hashtag  
**Then** hashtag is removed and all associations cascade-deleted (blogs remain)

**B5. Filter Blogs by Topic**

**Given** multiple published blogs  
**When** visitor filters by topic "JavaScript"  
**Then** only blogs with that topic are displayed

**B6. Filter Projects by Technology**

**Given** multiple published projects  
**When** visitor filters by technology "React"  
**Then** only projects using React are displayed

---

## Requirements

### Part A: Database Migration Requirements

- **FR-A1**: System MUST connect to Supabase-hosted PostgreSQL using connection URL from environment variables
- **FR-A2**: System MUST support environment-specific configurations (dev, staging, prod) via .env files
- **FR-A3**: System MUST require SSL/TLS for production connections; optional for development
- **FR-A4**: System MUST use 5-second connection timeout
- **FR-A5**: System MUST seed database schema (not migrate) to initialize Supabase
- **FR-A6**: System MUST remove Docker infrastructure (docker-compose.yml, Dockerfiles)
- **FR-A7**: System MUST maintain all existing tables: posts, topics, post_topics, authorProfiles, adminUsers

### Part B: Blog & Project CRUD Requirements

**Blog CRUD:**

- **FR-B1**: System MUST restrict blog CRUD to super administrator only
- **FR-B2**: System MUST allow assigning multiple topics (many-to-many via post_topics)
- **FR-B3**: System MUST allow adding multiple hashtags (many-to-many via post_hashtags)
- **FR-B4**: System MUST support draft and published states for blogs
- **FR-B5**: System MUST allow inline creation of topics and hashtags

**Project CRUD:**

- **FR-B6**: System MUST restrict project CRUD to super administrator only
- **FR-B7**: System MUST support project fields: title, description, images, githubUrl, liveUrl, technologies, dates
- **FR-B8**: System MUST allow adding multiple technologies (many-to-many via project_technologies)
- **FR-B9**: System MUST allow optional hashtags for projects
- **FR-B10**: System MUST support draft and published states for projects

**Metadata Management:**

- **FR-B11**: System MUST provide managed hashtags table (shared between blogs/projects)
- **FR-B12**: System MUST provide managed technologies table
- **FR-B13**: System MUST allow super admin to create/edit/delete topics, hashtags, technologies
- **FR-B14**: System MUST use cascade deletion (auto-remove associations when metadata deleted)
- **FR-B15**: System MUST allow visitors to filter blogs by topics/hashtags/titles
- **FR-B16**: System MUST allow visitors to filter projects by technologies

**Validation:**

- **FR-B17**: System MUST validate unique slugs for blogs, projects, topics, hashtags, technologies
- **FR-B18**: System MUST validate URL formats (GitHub URL, live URL, images)
- **FR-B19**: System MUST use minimal validation rules (start simple, add as needed)

---

## Key Entities

### Existing (Enhanced)

- **posts** (blogs): Existing table, add hashtag relationships
- **topics** (categories): Existing table, already has post_topics junction
- **authorProfiles**: Existing, unchanged
- **adminUsers**: Existing, unchanged

### New Tables

- **hashtags**: Tags for blogs and projects (flat structure)
- **technologies**: Tech stack items for projects (flat structure)
- **projects**: Portfolio projects entity
- **post_hashtags**: Junction table (posts ↔ hashtags)
- **project_hashtags**: Junction table (projects ↔ hashtags, optional)
- **project_technologies**: Junction table (projects ↔ technologies)

---

## Implementation Sequence

### Sequence 1: Database Migration (Phase A)

1. Set up Supabase project and get connection URL
2. Update environment variables (DATABASE_URL in .env)
3. Modify database connection config for Supabase
4. Create seed script for existing schema (posts, topics, authorProfiles, adminUsers)
5. Test connection and basic operations
6. Remove docker-compose.yml and Dockerfiles
7. Update documentation

### Sequence 2: Add New Functionality (Phase B)

1. Create new database tables (hashtags, technologies, projects, junctions)
2. Implement service layer for CRUD operations
3. Build API endpoints
4. Create admin UI components
5. Build admin pages
6. Add visitor filtering capabilities
7. Integration testing

---

## Decisions Made

**Database Infrastructure:**

1. Supabase for all environments (dev, staging, prod)
2. Environment variables for credentials (.env files, not in git)
3. SSL/TLS required for production
4. 5-second connection timeout
5. Database seeding (not migrations)
6. Remove all Docker infrastructure

**Blog & Project Features:**

1. Blogs use existing posts table
2. Categories use existing topics table
3. New managed tables: hashtags, technologies, projects
4. Many-to-many relationships for all metadata
5. Flat structure initially (hierarchical deferred)
6. Super admin only access
7. Inline creation for metadata
8. Unlimited associations (no limits)
9. Minimal validation
10. Cascade deletion for associations

---

## Review & Acceptance Checklist

- [x] All clarifications resolved (17 total)
- [x] Requirements testable and unambiguous
- [x] Success criteria measurable
- [x] Scope clearly bounded
- [x] Dependencies identified
- [x] No implementation details in spec

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] All ambiguities resolved
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed - **READY FOR PLANNING**

---
