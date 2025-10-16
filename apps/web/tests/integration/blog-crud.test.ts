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
 * Integration test for complete blog CRUD workflow
 * Tests the full lifecycle including associations and cascade behavior
 *
 * CRITICAL: These tests MUST FAIL until the implementation is complete
 */

describe('Blog CRUD Integration Tests', () => {
  let authorId: string;
  let topicId1: string;
  let topicId2: string;
  let hashtagId1: string;
  let hashtagId2: string;
  let blogId: string;

  beforeAll(async () => {
    // Setup test author
    const [author] = await db
      .insert(authorProfiles)
      .values({
        name: 'Integration Test Author',
        bio: 'Test bio',
        email: 'integration@example.com',
      })
      .returning();
    authorId = author.id;

    // Setup test topics
    const [topic1] = await db
      .insert(topics)
      .values({
        name: 'Integration Topic 1',
        slug: 'integration-topic-1',
      })
      .returning();
    topicId1 = topic1.id;

    const [topic2] = await db
      .insert(topics)
      .values({
        name: 'Integration Topic 2',
        slug: 'integration-topic-2',
      })
      .returning();
    topicId2 = topic2.id;

    // Setup test hashtags
    const [hashtag1] = await db
      .insert(hashtags)
      .values({
        name: 'Integration Hashtag 1',
        slug: 'integration-hashtag-1',
      })
      .returning();
    hashtagId1 = hashtag1.id;

    const [hashtag2] = await db
      .insert(hashtags)
      .values({
        name: 'Integration Hashtag 2',
        slug: 'integration-hashtag-2',
      })
      .returning();
    hashtagId2 = hashtag2.id;
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(authorProfiles).where(eq(authorProfiles.id, authorId));
    await db.delete(topics).where(eq(topics.id, topicId1));
    await db.delete(topics).where(eq(topics.id, topicId2));
    await db.delete(hashtags).where(eq(hashtags.id, hashtagId1));
    await db.delete(hashtags).where(eq(hashtags.id, hashtagId2));
  });

  it('should complete full blog CRUD lifecycle', { timeout: 15000 }, async () => {
    // 1. CREATE: Create blog with topics and hashtags
    const createResponse = await fetch('http://localhost:3000/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Integration Test Blog',
        slug: 'integration-test-blog',
        content: 'Full integration test content',
        status: 'DRAFT',
        excerpt: 'Test excerpt',
        topicIds: [topicId1, topicId2],
        hashtagIds: [hashtagId1],
      }),
    });

    expect(createResponse.status).toBe(201);
    const createdBlog = await createResponse.json();
    expect(createdBlog).toHaveProperty('id');
    expect(createdBlog.topics).toHaveLength(2);
    expect(createdBlog.hashtags).toHaveLength(1);
    blogId = createdBlog.id;

    // 2. READ: Verify blog can be retrieved with all relations
    const readResponse = await fetch(
      `http://localhost:3000/api/blog/${blogId}`
    );
    expect(readResponse.status).toBe(200);
    const readBlog = await readResponse.json();
    expect(readBlog.id).toBe(blogId);
    expect(readBlog.topics).toHaveLength(2);
    expect(readBlog.hashtags).toHaveLength(1);

    // 3. UPDATE: Add hashtag, remove one topic
    const updateResponse = await fetch(
      `http://localhost:3000/api/blog/${blogId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Updated Integration Test Blog',
          topicIds: [topicId1], // Remove topic2
          hashtagIds: [hashtagId1, hashtagId2], // Add hashtag2
        }),
      }
    );

    expect(updateResponse.status).toBe(200);
    const updatedBlog = await updateResponse.json();
    expect(updatedBlog.title).toBe('Updated Integration Test Blog');
    expect(updatedBlog.topics).toHaveLength(1);
    expect(updatedBlog.hashtags).toHaveLength(2);

    // 4. PUBLISH: Change status to published
    const publishResponse = await fetch(
      `http://localhost:3000/api/blog/${blogId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PUBLISHED',
          publishDate: new Date().toISOString(),
        }),
      }
    );

    expect(publishResponse.status).toBe(200);
    const publishedBlog = await publishResponse.json();
    expect(publishedBlog.status).toBe('PUBLISHED');
    expect(publishedBlog.publishDate).toBeDefined();

    // 5. DELETE: Remove blog and verify cascade
    const deleteResponse = await fetch(
      `http://localhost:3000/api/blog/${blogId}`,
      {
        method: 'DELETE',
      }
    );

    expect(deleteResponse.status).toBe(204);

    // Verify blog is gone
    const verifyDeleteResponse = await fetch(
      `http://localhost:3000/api/blog/${blogId}`
    );
    expect(verifyDeleteResponse.status).toBe(404);

    // Verify associations are removed (cascade delete)
    const remainingTopicAssociations = await db
      .select()
      .from(postTopics)
      .where(eq(postTopics.postId, blogId));
    expect(remainingTopicAssociations).toHaveLength(0);

    const remainingHashtagAssociations = await db
      .select()
      .from(postHashtags)
      .where(eq(postHashtags.postId, blogId));
    expect(remainingHashtagAssociations).toHaveLength(0);

    // Verify topics and hashtags still exist
    const topic1Still = await db
      .select()
      .from(topics)
      .where(eq(topics.id, topicId1));
    expect(topic1Still).toHaveLength(1);

    const hashtag1Still = await db
      .select()
      .from(hashtags)
      .where(eq(hashtags.id, hashtagId1));
    expect(hashtag1Still).toHaveLength(1);
  });

  it('should handle cascade deletion when topic is deleted', async () => {
    // Create blog with a topic
    const createResponse = await fetch('http://localhost:3000/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Cascade Test Blog',
        slug: 'cascade-test-blog',
        content: 'Testing cascade behavior',
        status: 'DRAFT',
        topicIds: [topicId1],
      }),
    });

    const createdBlog = await createResponse.json();
    const testBlogId = createdBlog.id;

    // Verify association exists
    const associations = await db
      .select()
      .from(postTopics)
      .where(eq(postTopics.postId, testBlogId));
    expect(associations).toHaveLength(1);

    // Delete the topic
    await fetch(`http://localhost:3000/api/topics/${topicId1}`, {
      method: 'DELETE',
    });

    // Verify association is removed due to CASCADE
    const remainingAssociations = await db
      .select()
      .from(postTopics)
      .where(eq(postTopics.postId, testBlogId));
    expect(remainingAssociations).toHaveLength(0);

    // Verify blog still exists
    const blogResponse = await fetch(
      `http://localhost:3000/api/blog/${testBlogId}`
    );
    expect(blogResponse.status).toBe(200);

    // Cleanup
    await fetch(`http://localhost:3000/api/blog/${testBlogId}`, {
      method: 'DELETE',
    });

    // Recreate topic1 for other tests
    const [topic] = await db
      .insert(topics)
      .values({
        name: 'Integration Topic 1',
        slug: 'integration-topic-1',
      })
      .returning();
    topicId1 = topic.id;
  });

  it('should handle draft to published status transitions', async () => {
    // Create draft blog
    const createResponse = await fetch('http://localhost:3000/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Status Transition Blog',
        slug: 'status-transition-blog',
        content: 'Testing status transitions',
        status: 'DRAFT',
      }),
    });

    const draftBlog = await createResponse.json();

    // Draft should not have publish date
    expect(draftBlog.status).toBe('DRAFT');
    expect(draftBlog.publishDate).toBeNull();

    // Publish the blog
    const publishResponse = await fetch(
      `http://localhost:3000/api/blog/${draftBlog.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PUBLISHED',
          publishDate: new Date().toISOString(),
        }),
      }
    );

    const publishedBlog = await publishResponse.json();
    expect(publishedBlog.status).toBe('PUBLISHED');
    expect(publishedBlog.publishDate).toBeDefined();

    // Verify published blog appears in published list
    const listResponse = await fetch(
      'http://localhost:3000/api/blog?status=PUBLISHED'
    );
    const listData = await listResponse.json();
    const foundBlog = listData.data.find((b: any) => b.id === publishedBlog.id);
    expect(foundBlog).toBeDefined();

    // Cleanup
    await fetch(`http://localhost:3000/api/blog/${draftBlog.id}`, {
      method: 'DELETE',
    });
  });
});
