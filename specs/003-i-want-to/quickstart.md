# Quickstart Guide: Blog and Project CRUD Management

**Feature**: Blog and Project CRUD with Metadata Associations  
**Date**: 2025-09-30

## Prerequisites

1. **Database Setup**:

   ```bash
   # Ensure Supabase database is running and accessible
   # DATABASE_URL should be set in .env
   ```

2. **Apply Migrations**:

   ```bash
   cd web
   npm run db:migrate
   ```

3. **Seed Initial Data** (optional):

   ```bash
   npm run db:seed
   ```

4. **Start Development Server**:

   ```bash
   npm run dev
   ```

5. **Login as Super Admin**:
   - Navigate to `/admin/login`
   - Use super admin credentials
   - Verify session is established

## Manual Test Scenarios

### Scenario 1: Create Topics Inline While Creating a Blog

**User Story**: As super admin, I want to create new topics while writing a blog post

**Steps**:

1. Navigate to `/admin/blogs/new`
2. Fill in blog title: "Getting Started with Next.js"
3. Fill in slug: "getting-started-nextjs"
4. Fill in content: (sample content)
5. In **Topics** field:
   - Type "JavaScript" → see existing topics filtered
   - Select "JavaScript" from list
   - Type "Next.js" (new topic) → press Enter
   - Verify "Next.js" appears as selected (created inline)
6. Click "Save as Draft"

**Expected Results**:

- ✅ Blog post created with status=DRAFT
- ✅ Two topics associated: "JavaScript" (existing), "Next.js" (new)
- ✅ New topic "Next.js" visible in topics list (`/api/topics`)
- ✅ Slug auto-generated as "nextjs"

**Verification**:

```bash
# Check database
curl http://localhost:3000/api/blog/{blog-id}
# Should show both topics in response

curl http://localhost:3000/api/topics
# Should include "Next.js" topic
```

---

### Scenario 2: Create Hashtags Inline While Creating a Blog

**User Story**: As super admin, I want to add hashtags to a blog post, creating new ones as needed

**Steps**:

1. Navigate to `/admin/blogs/{id}` (edit existing blog from Scenario 1)
2. In **Hashtags** field:
   - Type "tutorial" → press Enter (new hashtag)
   - Type "beginner" → press Enter (new hashtag)
   - Type "webdev" → select if exists, or create new
3. Click "Save"

**Expected Results**:

- ✅ Blog post updated
- ✅ Three hashtags associated (all newly created)
- ✅ Hashtags visible in hashtags list (`/api/hashtags`)

**Verification**:

```bash
curl http://localhost:3000/api/blog/{blog-id}
# Should show all hashtags in response
```

---

### Scenario 3: Create a Project with Technologies

**User Story**: As super admin, I want to create a portfolio project with associated technologies

**Steps**:

1. Navigate to `/admin/projects/new`
2. Fill in project details:
   - Title: "Portfolio Website"
   - Slug: "portfolio-website"
   - Description: "Personal portfolio built with modern web technologies"
   - Status: DRAFT
3. Add images:
   - Image 1: "https://example.com/screenshot1.png"
   - Image 2: "https://example.com/screenshot2.png"
4. Fill in URLs:
   - GitHub URL: "https://github.com/user/portfolio"
   - Live URL: "https://portfolio.example.com"
5. Set dates:
   - Start Date: 2024-01-01
   - End Date: 2024-03-01
6. In **Technologies** field:
   - Type "React" → create new
   - Type "TypeScript" → create new
   - Type "Tailwind CSS" → create new
7. Click "Save as Draft"

**Expected Results**:

- ✅ Project created with status=DRAFT
- ✅ Three technologies created and associated
- ✅ Technologies visible in technologies list (`/api/technologies`)
- ✅ Images stored as JSON array

**Verification**:

```bash
curl http://localhost:3000/api/projects/{project-id}
# Should show all technologies and images
```

---

### Scenario 4: Publish a Blog Post

**User Story**: As super admin, I want to publish a draft blog post

**Steps**:

1. Navigate to `/admin/blogs` (list view)
2. Click on draft blog from Scenario 1
3. Change status from DRAFT to PUBLISHED
4. Set publish date to today
5. Click "Save"

**Expected Results**:

- ✅ Blog post status updated to PUBLISHED
- ✅ Publish date set to current timestamp
- ✅ Blog appears in public listing (`/api/blog?status=PUBLISHED`)
- ✅ Blog NOT visible in draft listing

**Verification**:

```bash
# Should appear in public list
curl http://localhost:3000/api/blog?status=PUBLISHED

# Should NOT appear in draft list
curl http://localhost:3000/api/blog?status=DRAFT
```

---

### Scenario 5: Filter Blogs by Topic

**User Story**: As a visitor, I want to filter blog posts by topic

**Steps**:

1. Navigate to `/blog` (public view)
2. Click on topic filter "JavaScript"
3. Verify only blogs with JavaScript topic are shown

**Expected Results**:

- ✅ Only blogs tagged with "JavaScript" appear
- ✅ Blog from Scenario 1/4 should appear
- ✅ Other blogs without JavaScript topic filtered out

**Verification**:

```bash
# Get topic ID first
curl http://localhost:3000/api/topics

# Filter by topic
curl http://localhost:3000/api/blog?topicId={javascript-topic-id}
# Should return filtered list
```

---

### Scenario 6: Filter Projects by Technology

**User Story**: As a visitor, I want to filter projects by technology

**Steps**:

1. Navigate to `/projects` (public view)
2. Click on technology filter "React"
3. Verify only projects using React are shown

**Expected Results**:

- ✅ Only projects with "React" technology appear
- ✅ Project from Scenario 3 should appear (if published)
- ✅ Other projects without React filtered out

**Verification**:

```bash
# Get technology ID first
curl http://localhost:3000/api/technologies

# Filter by technology
curl http://localhost:3000/api/projects?technologyId={react-tech-id}&status=PUBLISHED
```

---

### Scenario 7: Delete a Hashtag (Cascade Behavior)

**User Story**: As super admin, I want to delete a hashtag that's in use

**Steps**:

1. Note the blog from Scenario 2 has 3 hashtags
2. Navigate to `/api/hashtags` to get hashtag ID for "tutorial"
3. Delete hashtag via API:
   ```bash
   curl -X DELETE http://localhost:3000/api/hashtags/{tutorial-id}
   ```
4. Verify blog still exists but hashtag association removed

**Expected Results**:

- ✅ Hashtag deleted successfully (204 response)
- ✅ Blog post still exists
- ✅ Blog now has only 2 hashtags (cascade removed "tutorial")
- ✅ Hashtag "tutorial" no longer appears in hashtags list

**Verification**:

```bash
# Blog should still exist with 2 hashtags
curl http://localhost:3000/api/blog/{blog-id}

# Hashtag should be gone
curl http://localhost:3000/api/hashtags
# "tutorial" should not appear
```

---

### Scenario 8: Delete a Blog Post

**User Story**: As super admin, I want to delete a blog post completely

**Steps**:

1. Navigate to `/admin/blogs/{id}` (from Scenario 1)
2. Click "Delete" button
3. Confirm deletion in modal
4. Verify redirect to blog list
5. Verify blog no longer appears

**Expected Results**:

- ✅ Blog post deleted (204 response)
- ✅ All associations removed (post_topics, post_hashtags entries deleted via cascade)
- ✅ Topics and hashtags still exist (not deleted, just unlinked)
- ✅ Blog not accessible at `/api/blog/{id}` (404 response)

**Verification**:

```bash
# Blog should return 404
curl http://localhost:3000/api/blog/{blog-id}
# Should return 404

# Topics still exist
curl http://localhost:3000/api/topics
# Should still show "JavaScript" and "Next.js"

# Hashtags still exist
curl http://localhost:3000/api/hashtags
# Should still show "beginner" and "webdev"
```

---

### Scenario 9: Update Blog with Multiple Topics and Hashtags

**User Story**: As super admin, I want to modify the topics and hashtags on an existing blog

**Steps**:

1. Create a new blog with 2 topics and 2 hashtags
2. Edit the blog
3. Remove 1 topic, add 1 new topic
4. Remove 1 hashtag, add 2 new hashtags
5. Save changes

**Expected Results**:

- ✅ Blog updated successfully
- ✅ New topic added, old topic removed from associations
- ✅ New hashtags added, old hashtag removed
- ✅ All changes reflected in database

**Verification**:

```bash
curl http://localhost:3000/api/blog/{blog-id}
# Should show updated topics and hashtags
```

---

### Scenario 10: Pagination and Listing

**User Story**: As super admin, I want to view paginated lists of blogs and projects

**Steps**:

1. Create 25 blog posts (can use a script)
2. Navigate to `/api/blog?page=0&limit=20`
3. Verify first 20 blogs shown
4. Navigate to `/api/blog?page=1&limit=20`
5. Verify next 5 blogs shown

**Expected Results**:

- ✅ First page shows 20 items
- ✅ Second page shows 5 items
- ✅ Pagination metadata includes correct totals:
  ```json
  {
    "data": [...],
    "pagination": {
      "page": 0,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
  ```

**Verification**:

```bash
# First page
curl http://localhost:3000/api/blog?page=0&limit=20

# Second page
curl http://localhost:3000/api/blog?page=1&limit=20
```

---

## Performance Validation

### Test Query Performance

1. **Blog List with Joins** (should be < 50ms):

   ```bash
   time curl http://localhost:3000/api/blog?status=PUBLISHED
   ```

2. **Project List with Filters** (should be < 30ms):

   ```bash
   time curl http://localhost:3000/api/projects?technologyId={id}
   ```

3. **Single Blog with Relations** (should be < 20ms):

   ```bash
   time curl http://localhost:3000/api/blog/{id}
   ```

4. **Create Operation** (should be < 100ms):
   ```bash
   time curl -X POST http://localhost:3000/api/blog -d '{...}' -H 'Content-Type: application/json'
   ```

### Check Database Indexes

```sql
-- Verify indexes exist
SELECT * FROM pg_indexes WHERE tablename IN (
  'posts', 'projects', 'hashtags', 'topics', 'technologies',
  'post_topics', 'post_hashtags', 'project_hashtags', 'project_technologies'
);
```

Expected indexes:

- ✅ posts: id (PK), slug (unique), status
- ✅ projects: id (PK), slug (unique), status
- ✅ hashtags: id (PK), name (unique), slug (unique)
- ✅ topics: id (PK), name (unique), slug (unique)
- ✅ technologies: id (PK), name (unique), slug (unique)
- ✅ All junction tables: composite PKs on foreign key pairs

---

## Edge Cases & Error Scenarios

### Duplicate Slug Prevention

```bash
# Try to create two blogs with same slug
curl -X POST http://localhost:3000/api/blog -d '{
  "title": "Test 1",
  "slug": "duplicate-slug",
  ...
}'

curl -X POST http://localhost:3000/api/blog -d '{
  "title": "Test 2",
  "slug": "duplicate-slug",
  ...
}'
# Second request should return 409 Conflict
```

### Unauthorized Access

```bash
# Try to create blog without authentication
curl -X POST http://localhost:3000/api/blog -d '{...}'
# Should return 401 Unauthorized
```

### Invalid Data

```bash
# Try to create blog with invalid slug
curl -X POST http://localhost:3000/api/blog -d '{
  "title": "Test",
  "slug": "Invalid Slug With Spaces!",
  ...
}'
# Should return 400 Bad Request with validation error
```

### Nonexistent Resource

```bash
# Try to get blog that doesn't exist
curl http://localhost:3000/api/blog/00000000-0000-0000-0000-000000000000
# Should return 404 Not Found
```

---

## Cleanup

After testing, clean up test data:

```sql
-- Delete test blogs (cascade will remove associations)
DELETE FROM posts WHERE title LIKE 'Test%';

-- Delete test projects
DELETE FROM projects WHERE title LIKE 'Test%';

-- Delete orphaned metadata (optional)
DELETE FROM hashtags WHERE id NOT IN (
  SELECT hashtag_id FROM post_hashtags
  UNION
  SELECT hashtag_id FROM project_hashtags
);

DELETE FROM technologies WHERE id NOT IN (
  SELECT technology_id FROM project_technologies
);
```

---

## Success Criteria Checklist

- [ ] All 10 scenarios pass
- [ ] Performance targets met (< 200ms p95 for all operations)
- [ ] No N+1 query issues detected
- [ ] Cascade deletion works correctly
- [ ] Inline creation UX functional
- [ ] Filtering and pagination working
- [ ] Error scenarios handled gracefully
- [ ] Database indexes present and used
- [ ] TypeScript types compile without errors
- [ ] No linter errors or warnings

---

**Notes**:

- Run these scenarios in order for best results
- Some scenarios depend on data from previous scenarios
- Performance timings should be measured under realistic network conditions
- Admin authentication required for mutation operations
