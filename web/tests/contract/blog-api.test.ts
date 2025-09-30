import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../../src/db';
import {
  posts,
  topics,
  hashtags,
  authorProfiles,
  postTopics,
  postHashtags,
} from '../../src/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Contract tests for Blog API
 * These tests verify the API endpoints match the OpenAPI specification
 *
 * CRITICAL: These tests MUST FAIL until the implementation is complete
 */

describe('Blog API Contract Tests', () => {
  let testAuthorId: string;
  let testTopicId: string;
  let testHashtagId: string;
  let testBlogId: string;

  beforeAll(async () => {
    // Setup test data
    const [author] = await db
      .insert(authorProfiles)
      .values({
        name: 'Test Author',
        bio: 'Test bio',
        email: 'test@example.com',
      })
      .returning();
    testAuthorId = author.id;

    const [topic] = await db
      .insert(topics)
      .values({
        name: 'Test Topic',
        slug: 'test-topic',
        description: 'Test description',
      })
      .returning();
    testTopicId = topic.id;

    const [hashtag] = await db
      .insert(hashtags)
      .values({
        name: 'Test Hashtag',
        slug: 'test-hashtag',
        description: 'Test description',
      })
      .returning();
    testHashtagId = hashtag.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await db.delete(posts).where(eq(posts.authorId, testAuthorId));
    await db.delete(authorProfiles).where(eq(authorProfiles.id, testAuthorId));
    await db.delete(topics).where(eq(topics.id, testTopicId));
    await db.delete(hashtags).where(eq(hashtags.id, testHashtagId));
  });

  describe('GET /api/blog', () => {
    it('should return a paginated list of blog posts', async () => {
      const response = await fetch(
        'http://localhost:3000/api/blog?page=0&limit=20'
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('limit');
      expect(data.pagination).toHaveProperty('total');
      expect(data.pagination).toHaveProperty('totalPages');
    });

    it('should filter blogs by status', async () => {
      const response = await fetch(
        'http://localhost:3000/api/blog?status=PUBLISHED'
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data.every((post: any) => post.status === 'PUBLISHED')).toBe(
        true
      );
    });

    it('should filter blogs by topic ID', async () => {
      const response = await fetch(
        `http://localhost:3000/api/blog?topicId=${testTopicId}`
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter blogs by hashtag ID', async () => {
      const response = await fetch(
        `http://localhost:3000/api/blog?hashtagId=${testHashtagId}`
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should search blogs by title and content', async () => {
      const response = await fetch(
        'http://localhost:3000/api/blog?search=test'
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('POST /api/blog', () => {
    it('should create a new blog post with topics and hashtags', async () => {
      const newBlog = {
        title: 'Test Blog Post',
        slug: 'test-blog-post',
        content: 'This is a test blog post content',
        status: 'DRAFT',
        excerpt: 'Test excerpt',
        topicIds: [testTopicId],
        hashtagIds: [testHashtagId],
      };

      const response = await fetch('http://localhost:3000/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBlog),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.title).toBe(newBlog.title);
      expect(data.slug).toBe(newBlog.slug);
      expect(data.content).toBe(newBlog.content);
      expect(data.status).toBe(newBlog.status);
      expect(data.topics).toBeDefined();
      expect(data.hashtags).toBeDefined();
      expect(Array.isArray(data.topics)).toBe(true);
      expect(Array.isArray(data.hashtags)).toBe(true);

      testBlogId = data.id;
    });

    it('should return 400 for invalid blog data', async () => {
      const invalidBlog = {
        title: '', // Invalid: empty title
        slug: 'invalid slug with spaces', // Invalid: spaces in slug
        content: '',
      };

      const response = await fetch('http://localhost:3000/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidBlog),
      });

      expect(response.status).toBe(400);
    });

    it('should return 409 for duplicate slug', async () => {
      const blog1 = {
        title: 'First Blog',
        slug: 'duplicate-slug-test',
        content: 'Content',
        status: 'DRAFT',
      };

      await fetch('http://localhost:3000/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blog1),
      });

      const blog2 = {
        title: 'Second Blog',
        slug: 'duplicate-slug-test', // Same slug
        content: 'Content',
        status: 'DRAFT',
      };

      const response = await fetch('http://localhost:3000/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blog2),
      });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/blog/:id', () => {
    it('should return a single blog post with relations', async () => {
      const response = await fetch(
        `http://localhost:3000/api/blog/${testBlogId}`
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('title');
      expect(data).toHaveProperty('slug');
      expect(data).toHaveProperty('content');
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('topics');
      expect(data).toHaveProperty('hashtags');
      expect(Array.isArray(data.topics)).toBe(true);
      expect(Array.isArray(data.hashtags)).toBe(true);
    });

    it('should return 404 for non-existent blog', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(`http://localhost:3000/api/blog/${fakeId}`);
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/blog/:id', () => {
    it('should update an existing blog post', async () => {
      const updates = {
        title: 'Updated Test Blog Post',
        content: 'Updated content',
        status: 'PUBLISHED',
      };

      const response = await fetch(
        `http://localhost:3000/api/blog/${testBlogId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.title).toBe(updates.title);
      expect(data.content).toBe(updates.content);
      expect(data.status).toBe(updates.status);
    });

    it('should update blog topics and hashtags', async () => {
      const updates = {
        topicIds: [],
        hashtagIds: [],
      };

      const response = await fetch(
        `http://localhost:3000/api/blog/${testBlogId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.topics).toHaveLength(0);
      expect(data.hashtags).toHaveLength(0);
    });

    it('should return 404 for non-existent blog', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(`http://localhost:3000/api/blog/${fakeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated' }),
      });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/blog/:id', () => {
    it('should delete a blog post and cascade associations', async () => {
      const response = await fetch(
        `http://localhost:3000/api/blog/${testBlogId}`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(204);

      // Verify blog is deleted
      const getResponse = await fetch(
        `http://localhost:3000/api/blog/${testBlogId}`
      );
      expect(getResponse.status).toBe(404);

      // Verify cascade: associations should be removed
      const topicAssociations = await db
        .select()
        .from(postTopics)
        .where(eq(postTopics.postId, testBlogId));
      expect(topicAssociations).toHaveLength(0);

      const hashtagAssociations = await db
        .select()
        .from(postHashtags)
        .where(eq(postHashtags.postId, testBlogId));
      expect(hashtagAssociations).toHaveLength(0);

      // Topics and hashtags should still exist
      const topic = await db
        .select()
        .from(topics)
        .where(eq(topics.id, testTopicId));
      expect(topic).toHaveLength(1);

      const hashtag = await db
        .select()
        .from(hashtags)
        .where(eq(hashtags.id, testHashtagId));
      expect(hashtag).toHaveLength(1);
    });

    it('should return 404 for non-existent blog', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(`http://localhost:3000/api/blog/${fakeId}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(404);
    });
  });
});
