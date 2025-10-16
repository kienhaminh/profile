import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../../src/db';
import { hashtags, topics, technologies } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Contract tests for Metadata APIs
 * These tests verify the API endpoints match the OpenAPI specification
 *
 * CRITICAL: These tests MUST FAIL until the implementation is complete
 */

describe('Metadata API Contract Tests', () => {
  let testHashtagId: string;
  let testTopicId: string;
  let testTechnologyId: string;
  const testRunId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  beforeAll(async () => {
    // Clean up any existing test data with pattern matching
    await db.delete(hashtags).where(eq(hashtags.slug, 'test-hashtag-unique'));
    await db.delete(hashtags).where(eq(hashtags.slug, 'test-hashtag-update'));
    await db.delete(topics).where(eq(topics.slug, 'test-topic-unique'));
    await db.delete(topics).where(eq(topics.slug, 'test-topic-update'));
    await db
      .delete(technologies)
      .where(eq(technologies.slug, 'test-technology-unique'));

    // Clean up any test data with test run ID patterns
    const { like } = await import('drizzle-orm');
    await db
      .delete(hashtags)
      .where(like(hashtags.slug, 'test-hashtag-unique-%'));
    await db.delete(topics).where(like(topics.slug, 'test-topic-unique-%'));
  });

  afterAll(async () => {
    // Clean up test data
    if (testHashtagId) {
      await db.delete(hashtags).where(eq(hashtags.id, testHashtagId));
    }
    if (testTopicId) {
      await db.delete(topics).where(eq(topics.id, testTopicId));
    }
    if (testTechnologyId) {
      await db
        .delete(technologies)
        .where(eq(technologies.id, testTechnologyId));
    }
  });

  describe('Hashtags API', () => {
    describe('GET /api/hashtags', () => {
      it('should return a list of all hashtags', async () => {
        const response = await fetch('http://localhost:3000/api/hashtags');
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
      });
    });

    describe('POST /api/hashtags', () => {
      it('should create a new hashtag', async () => {
        const newHashtag = {
          name: 'Test Hashtag',
          slug: `test-hashtag-unique-${testRunId}`,
          description: 'Test description',
        };

        const response = await fetch('http://localhost:3000/api/hashtags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newHashtag),
        });

        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data.name).toBe(newHashtag.name);
        expect(data.slug).toBe(newHashtag.slug);
        expect(data.description).toBe(newHashtag.description);
        expect(data).toHaveProperty('createdAt');

        testHashtagId = data.id;
      });

      it('should return 400 for invalid hashtag data', async () => {
        const invalidHashtag = {
          name: '', // Invalid: empty name
          slug: 'invalid slug!', // Invalid: special characters
        };

        const response = await fetch('http://localhost:3000/api/hashtags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidHashtag),
        });

        expect(response.status).toBe(400);
      });

      it('should return 409 for duplicate name or slug', async () => {
        const duplicateHashtag = {
          name: 'Test Hashtag',
          slug: 'test-hashtag-unique',
        };

        const response = await fetch('http://localhost:3000/api/hashtags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(duplicateHashtag),
        });

        expect(response.status).toBe(409);
      });
    });

    describe('PUT /api/hashtags/:id', () => {
      it('should update an existing hashtag', async () => {
        const updates = {
          name: 'Updated Test Hashtag',
          description: 'Updated description',
        };

        const response = await fetch(
          `http://localhost:3000/api/hashtags/${testHashtagId}`,
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
        expect(data.name).toBe(updates.name);
        expect(data.description).toBe(updates.description);
      });

      it('should return 404 for non-existent hashtag', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await fetch(
          `http://localhost:3000/api/hashtags/${fakeId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Updated' }),
          }
        );

        expect(response.status).toBe(404);
      });
    });

    describe('DELETE /api/hashtags/:id', () => {
      it('should delete a hashtag', async () => {
        const response = await fetch(
          `http://localhost:3000/api/hashtags/${testHashtagId}`,
          {
            method: 'DELETE',
          }
        );

        expect(response.status).toBe(204);

        // Verify hashtag is deleted
        const deletedHashtag = await db
          .select()
          .from(hashtags)
          .where(eq(hashtags.id, testHashtagId));
        expect(deletedHashtag).toHaveLength(0);
      });

      it('should return 404 for non-existent hashtag', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await fetch(
          `http://localhost:3000/api/hashtags/${fakeId}`,
          {
            method: 'DELETE',
          }
        );

        expect(response.status).toBe(404);
      });
    });
  });

  describe('Topics API', () => {
    describe('GET /api/topics', () => {
      it('should return a list of all topics', async () => {
        const response = await fetch('http://localhost:3000/api/topics');
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
      });
    });

    describe('POST /api/topics', () => {
      it('should create a new topic', async () => {
        const newTopic = {
          name: 'Test Topic',
          slug: `test-topic-unique-${testRunId}`,
          description: 'Test description',
        };

        const response = await fetch('http://localhost:3000/api/topics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTopic),
        });

        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data.name).toBe(newTopic.name);
        expect(data.slug).toBe(newTopic.slug);
        expect(data.description).toBe(newTopic.description);

        testTopicId = data.id;
      });

      it('should return 400 for invalid topic data', async () => {
        const invalidTopic = {
          name: '', // Invalid: empty name
          slug: 'invalid slug!', // Invalid: special characters
        };

        const response = await fetch('http://localhost:3000/api/topics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidTopic),
        });

        expect(response.status).toBe(400);
      });

      it('should return 409 for duplicate name or slug', async () => {
        const duplicateTopic = {
          name: 'Test Topic',
          slug: 'test-topic-unique',
        };

        const response = await fetch('http://localhost:3000/api/topics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(duplicateTopic),
        });

        expect(response.status).toBe(409);
      });
    });

    describe('PUT /api/topics/:id', () => {
      it('should update an existing topic', async () => {
        const updates = {
          name: 'Updated Test Topic',
          description: 'Updated description',
        };

        const response = await fetch(
          `http://localhost:3000/api/topics/${testTopicId}`,
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
        expect(data.name).toBe(updates.name);
        expect(data.description).toBe(updates.description);
      });

      it('should return 404 for non-existent topic', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await fetch(
          `http://localhost:3000/api/topics/${fakeId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Updated' }),
          }
        );

        expect(response.status).toBe(404);
      });
    });

    describe('DELETE /api/topics/:id', () => {
      it('should delete a topic', async () => {
        const response = await fetch(
          `http://localhost:3000/api/topics/${testTopicId}`,
          {
            method: 'DELETE',
          }
        );

        expect(response.status).toBe(204);

        // Verify topic is deleted
        const deletedTopic = await db
          .select()
          .from(topics)
          .where(eq(topics.id, testTopicId));
        expect(deletedTopic).toHaveLength(0);
      });

      it('should return 404 for non-existent topic', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await fetch(
          `http://localhost:3000/api/topics/${fakeId}`,
          {
            method: 'DELETE',
          }
        );

        expect(response.status).toBe(404);
      });
    });
  });

  describe('Technologies API', () => {
    describe('GET /api/technologies', () => {
      it('should return a list of all technologies', async () => {
        const response = await fetch('http://localhost:3000/api/technologies');
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(Array.isArray(data)).toBe(true);
      });
    });

    describe('POST /api/technologies', () => {
      it('should create a new technology', async () => {
        const newTechnology = {
          name: 'Test Technology API',
          slug: 'test-technology-api-unique',
          description: 'Test description',
        };

        const response = await fetch('http://localhost:3000/api/technologies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTechnology),
        });

        expect(response.status).toBe(201);

        const data = await response.json();
        expect(data).toHaveProperty('id');
        expect(data.name).toBe(newTechnology.name);
        expect(data.slug).toBe(newTechnology.slug);
        expect(data.description).toBe(newTechnology.description);
        expect(data).toHaveProperty('createdAt');

        testTechnologyId = data.id;
      });

      it('should return 400 for invalid technology data', async () => {
        const invalidTechnology = {
          name: '', // Invalid: empty name
          slug: 'invalid slug!', // Invalid: special characters
        };

        const response = await fetch('http://localhost:3000/api/technologies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidTechnology),
        });

        expect(response.status).toBe(400);
      });

      it('should return 409 for duplicate name or slug', async () => {
        const duplicateTechnology = {
          name: 'Test Technology API',
          slug: 'test-technology-api-unique',
        };

        const response = await fetch('http://localhost:3000/api/technologies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(duplicateTechnology),
        });

        expect(response.status).toBe(409);
      });
    });

    describe('PUT /api/technologies/:id', () => {
      it('should update an existing technology', async () => {
        const updates = {
          name: 'Updated Test Technology',
          description: 'Updated description',
        };

        const response = await fetch(
          `http://localhost:3000/api/technologies/${testTechnologyId}`,
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
        expect(data.name).toBe(updates.name);
        expect(data.description).toBe(updates.description);
      });

      it('should return 404 for non-existent technology', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await fetch(
          `http://localhost:3000/api/technologies/${fakeId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Updated' }),
          }
        );

        expect(response.status).toBe(404);
      });
    });

    describe('DELETE /api/technologies/:id', () => {
      it('should delete a technology', async () => {
        const response = await fetch(
          `http://localhost:3000/api/technologies/${testTechnologyId}`,
          {
            method: 'DELETE',
          }
        );

        expect(response.status).toBe(204);

        // Verify technology is deleted
        const deletedTechnology = await db
          .select()
          .from(technologies)
          .where(eq(technologies.id, testTechnologyId));
        expect(deletedTechnology).toHaveLength(0);
      });

      it('should return 404 for non-existent technology', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const response = await fetch(
          `http://localhost:3000/api/technologies/${fakeId}`,
          {
            method: 'DELETE',
          }
        );

        expect(response.status).toBe(404);
      });
    });
  });
});
