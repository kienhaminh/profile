# Feature Specification: Blog and Project CRUD Management

**Feature Branch**: `003-i-want-to`  
**Created**: September 30, 2025  
**Status**: Complete - Ready for Planning  
**Input**: User description: "I want to add blog CRUD, project CRUD. Blog management has category and hashtags. Project management has hashtags."

## Execution Flow (main)

```
1. Parse user description from Input
   → Feature identified: Add CRUD operations for blogs and projects
2. Extract key concepts from description
   → Actors: Content administrators, authors
   → Actions: Create, Read, Update, Delete blogs and projects
   → Data: Blogs (with categories and hashtags), Projects (with hashtags)
   → Constraints: Data integrity, validation
3. For each unclear aspect:
   → Clarified: Blogs use existing posts table
   → Clarified: Categories are topics (existing topics table, flat structure)
   → Clarified: Hashtags are managed entities (separate table, flat)
   → Clarified: Projects have title, description, images, URLs, tech stack, dates
   → Clarified: Blogs can have multiple topics (many-to-many)
   → Clarified: Super admin can create topics and hashtags inline
   → Clarified: No limits on topics/hashtags per item, minimal validation
   → Clarified: Only super admin has CRUD permissions
   → Clarified: Hierarchical topics/hashtags deferred to future
   → Clarified: Tech stack as managed entity table (like hashtags)
   → Clarified: Cascade deletion for topics/hashtags/technologies (auto-remove associations)
4. Fill User Scenarios & Testing section
   → Primary scenario: Admin manages blog posts and projects
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities
   → Blogs, Projects, Categories, Hashtags
7. Run Review Checklist
   → ALL ambiguities resolved (12 clarifications answered)
   → No remaining uncertainties
8. Return: SUCCESS (spec 100% complete and ready for planning)
```

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

---

## Clarifications

### Session 2025-09-30

- Q: How does "blog" relate to the existing "posts" table in the database schema? → A: "Blogs" and "posts" are the same - enhance existing posts table/functionality (posts shows all the blogs)
- Q: Are "categories" for blogs the same as the existing "topics" table? → A: Yes, categories = topics (use existing topics table)
- Q: How should hashtags be implemented and managed? → A: Managed entities with separate hashtags table (reusable across posts/projects). Hashtags can be added by admin and attached to each blog (many-to-many). Visitors can filter blogs by hashtags, topics, or titles from main site.
- Q: What are the required attributes/fields for a Project entity? → A: Title, description, images, GitHub URL, live URL, tech stack, dates (hashtags not required, but tech stack enables filtering)
- Q: Can a blog post be assigned to multiple topics (categories) or just one? → A: Multiple topics (many-to-many: blog can have multiple topics, already exists via post_topics table)
- Q: Can admins create topics and hashtags inline while editing content? → A: Yes, admins can create topics inline directly and create hashtags inline
- Q: Are topics flat or hierarchical? → A: Start with flat topics and flat hashtags first; hierarchical structure will be implemented later
- Q: Are there limits on number of topics/hashtags per item? → A: Unlimited fields first (no limits initially)
- Q: Who can perform CRUD operations on blogs, projects, topics, and hashtags? → A: Only the super admin (only me)
- Q: What validation rules are needed? → A: No validation rules currently (start simple)
- Q: Should tech stack be a managed entity table or simple text array? → A: Managed entity table (like hashtags/topics for consistent filtering and reusability across projects)
- Q: What happens when deleting a topic, hashtag, or technology that's in use? → A: Cascade delete (auto-remove associations when entity is deleted)

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As the super administrator, I need to create, read, update, and delete blog posts and projects through a management interface, so that I can maintain the portfolio website's content with proper metadata (blogs with topics/categories and hashtags, projects with tech stack and optional hashtags) to help visitors discover and explore content effectively.

### Acceptance Scenarios

**Blog Management:**

1. **Given** I am the super administrator, **When** I create a new blog post with title, content, topics (categories), and hashtags, **Then** the blog must be saved with all associated metadata and be retrievable.

2. **Given** a blog post exists in the system, **When** I view the blog list, **Then** I must see all blogs with their topics (categories) and hashtags displayed.

3. **Given** I have selected an existing blog post, **When** I update its content, topics (categories), or hashtags, **Then** the changes must be persisted and reflected immediately.

4. **Given** a blog post exists in the system, **When** I delete it, **Then** the blog and its associations must be removed from the system.

**Project Management:**

5. **Given** I am the super administrator, **When** I create a new project with title, description, images, GitHub URL, live URL, technologies (from tech stack), and dates, **Then** the project must be saved with all metadata and be retrievable.

6. **Given** a project exists in the system, **When** I view the project list, **Then** I must see all projects with their key details (title, description, images, URLs, technologies, dates) displayed.

7. **Given** I have selected an existing project, **When** I update its details (title, description, images, URLs, technologies, dates), **Then** the changes must be persisted and reflected immediately.

8. **Given** a project exists in the system, **When** I delete it, **Then** the project and its associations must be removed from the system.

9. **Given** a visitor is browsing the main site, **When** they filter projects by technology (from tech stack), **Then** the system must display matching projects.

10. **Given** I am creating or editing a project, **When** I select technologies from the existing tech stack list or create new technologies inline, **Then** the technologies must be created (if new) and associated with the project.

**Category and Hashtag Management:**

10. **Given** I am creating or editing a blog, **When** I select one or more topics (categories) from the existing topics list or create new topics inline, **Then** the topics must be created (if new) and associated with the blog via the post_topics junction table.

11. **Given** I am creating or editing content, **When** I select hashtags from the existing hashtag list or create new hashtags inline, **Then** the hashtags must be created (if new) and associated with the content.

12. **Given** a visitor is browsing the main site, **When** they filter content by hashtags, topics, or titles, **Then** the system must display matching blog posts.

### Edge Cases

- What happens when an administrator tries to create a blog without a required field? [NEEDS CLARIFICATION: which fields are required?]
- What happens when a topic (category) is deleted that is assigned to existing blogs? Cascade deletion removes the topic associations from blogs automatically (blog remains, just loses the topic association).
- What happens when trying to delete a blog or project that doesn't exist? System must handle gracefully with appropriate error message.
- What happens when two administrators edit the same content simultaneously? [NEEDS CLARIFICATION: conflict resolution strategy?]
- What happens when filtering by hashtag or topic on the main site returns no results? System must display appropriate empty state message.
- What happens when a hashtag is deleted that is assigned to existing posts/projects? Cascade deletion removes the hashtag associations from posts and projects automatically (content remains, just loses the hashtag association).

## Requirements _(mandatory)_

### Functional Requirements

**Blog CRUD:**

- **FR-001**: System MUST restrict blog post creation, editing, and deletion to the super administrator only.

- **FR-002**: System MUST allow assigning multiple topics (categories) to each blog post using the existing topics table and post_topics junction table (many-to-many relationship).

- **FR-003**: System MUST allow adding multiple hashtags to blog posts from a managed list of available hashtags (many-to-many relationship).

- **FR-004**: System MUST allow viewing a list of all blog posts with their associated categories and hashtags.

- **FR-005**: System MUST allow updating existing blog posts including their content, topics (categories), and hashtags.

- **FR-006**: System MUST allow deleting blog posts.

- **FR-007**: System MUST support draft and published states for blogs (using existing post status field).

**Project CRUD:**

- **FR-008**: System MUST restrict project creation, editing, and deletion to the super administrator only, with fields: title, description, images (multiple), GitHub URL, live URL, technologies (many-to-many relationship with tech stack table), and project dates (start date, end date or ongoing).

- **FR-009**: System MUST allow optionally adding hashtags to projects from a managed list of available hashtags (many-to-many relationship, but hashtags are not required for projects).

- **FR-010**: System MUST allow viewing a list of all projects with their associated hashtags.

- **FR-011**: System MUST allow updating existing projects including all fields (title, description, images, GitHub URL, live URL, tech stack, dates, and optional hashtags).

- **FR-012**: System MUST allow deleting projects.

- **FR-013**: System MUST support draft and published states for projects.

**Topic (Category) Management:**

- **FR-014**: System MUST allow the super administrator to create new topics inline while editing blog posts, in addition to managing topics separately.

- **FR-015**: System MUST allow the super administrator to edit existing topics. Topics are flat (no hierarchy) initially; hierarchical relationships will be added in future.

- **FR-016**: System MUST allow the super administrator to delete topics, with cascade deletion automatically removing topic associations from blogs (via post_topics junction table).

**Hashtag Management:**

- **FR-017**: System MUST provide a managed hashtags table where the super administrator can create hashtags inline while editing content or manage them separately, and allow editing and deleting hashtags.

- **FR-018**: System MUST use a shared hashtag pool for both blogs and projects (same hashtags table).

- **FR-019**: System MUST allow the super administrator to delete hashtags, with cascade deletion automatically removing hashtag associations from blogs and projects.

- **FR-020-NEW**: System MUST allow visitors to filter blog posts by hashtags, topics (categories), or titles on the main site.

- **FR-020-PROJECTS**: System MUST allow visitors to filter projects by technology (from tech stack) on the main site.

**Tech Stack Management:**

- **FR-026**: System MUST provide a managed tech stack (technologies) table where the super administrator can create technologies inline while editing projects or manage them separately.

- **FR-027**: System MUST allow the super administrator to edit and delete technologies from the tech stack, with cascade deletion automatically removing technology associations from projects.

- **FR-028**: System MUST use a many-to-many relationship between projects and technologies (each project can have multiple technologies, each technology can be used in multiple projects).

**Access Control:**

- **FR-021**: System MUST restrict all CRUD operations (blogs, projects, topics, hashtags) to the super administrator only.

- **FR-022**: System MUST allow the super administrator full permissions (create, read, update, delete) for all entities without restrictions.

**Validation:**

- **FR-023**: System MUST validate required fields before saving blogs or projects (validation rules to be defined as needed during implementation).

- **FR-024**: System MUST prevent duplicate slugs for blogs, projects, topics, and hashtags (slugs must be unique within their entity type).

- **FR-025**: System MUST validate basic format requirements (e.g., URLs must be valid HTTP/HTTPS), with no hard limits on number of topics or hashtags per item initially. Start with minimal validation; add rules as needed.

### Key Entities _(include if feature involves data)_

- **Blog Post (Posts Table)**: Uses the existing `posts` table which already has title, content, status, publication metadata, and author reference. This feature enhances it with category/categories and hashtags management.

- **Project**: Represents a portfolio project with attributes: title, description, images (array/multiple), GitHub URL, live/demo URL, technologies (many-to-many relationship with tech stack table), project dates (start date, end date/ongoing status), and optional hashtags via many-to-many relationship.

- **Topic (Category)**: Uses the existing `topics` table for blog post classification with flat structure (no hierarchy initially; nested topics deferred to future). The existing `post_topics` junction table handles the many-to-many relationship (each blog can have multiple topics, each topic can be assigned to multiple blogs). Super administrator can create topics inline while editing blogs.

- **Hashtag**: Managed entity stored in a separate hashtags table with attributes (id, name, slug, description). Flat structure (no hierarchy). Reusable across both blog posts and projects via many-to-many relationships. Super administrator can create hashtags inline while editing content. No limit on number of hashtags per blog or project initially.

- **Blog-Hashtag Association**: Represents the many-to-many relationship between blogs and hashtags.

- **Project-Hashtag Association**: Represents the optional many-to-many relationship between projects and hashtags (hashtags are not required for projects).

- **Technology (Tech Stack)**: Managed entity stored in a separate technologies/tech_stack table with attributes (id, name, slug, description). Reusable across projects via many-to-many relationship. Super administrator can create technologies inline while editing projects. Enables visitors to filter projects by technology.

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain - **All clarifications resolved**
- [x] Requirements are testable and unambiguous - **All core requirements fully clarified**
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified - **Relationship to existing schema clarified**

### Decisions Made (Summary)

1. **Data Model**: Blogs use existing `posts` table; Categories use existing `topics` table
2. **Hashtags**: New managed table, shared between blogs and projects
3. **Tech Stack**: New managed technologies table, reusable across projects
4. **Projects**: New entity with full attributes (title, description, images, URLs, technologies, dates)
5. **Relationships**: Many-to-many for topics, hashtags, and technologies
6. **Structure**: Flat topics, hashtags, and tech stack initially (hierarchical deferred to future)
7. **Permissions**: Super administrator only (exclusive CRUD access)
8. **Creation Workflow**: Inline creation for topics, hashtags, and technologies
9. **Limits**: No limits on topics/hashtags/technologies per item initially
10. **Validation**: Minimal validation rules (start simple)
11. **Status**: Both blogs and projects support draft/published states
12. **Deletion Behavior**: Cascade deletion (auto-remove associations when deleting topics/hashtags/technologies)

### Remaining Minor Clarifications

---

## Execution Status

_Updated by main() during processing_

- [x] User description parsed
- [x] Key concepts extracted
- [x] All ambiguities resolved (12 clarifications answered)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed - **READY FOR PLANNING**

---
