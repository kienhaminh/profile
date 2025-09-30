import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../../src/db';
import {
  projects,
  technologies,
  hashtags,
  projectTechnologies,
  projectHashtags,
} from '../../src/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Contract tests for Project API
 * These tests verify the API endpoints match the OpenAPI specification
 *
 * CRITICAL: These tests MUST FAIL until the implementation is complete
 */

describe('Project API Contract Tests', () => {
  let testTechnologyId: string;
  let testHashtagId: string;
  let testProjectId: string;

  beforeAll(async () => {
    // Setup test data
    const [technology] = await db
      .insert(technologies)
      .values({
        name: 'Test Technology',
        slug: 'test-technology',
        description: 'Test description',
      })
      .returning();
    testTechnologyId = technology.id;

    const [hashtag] = await db
      .insert(hashtags)
      .values({
        name: 'Test Project Hashtag',
        slug: 'test-project-hashtag',
        description: 'Test description',
      })
      .returning();
    testHashtagId = hashtag.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await db.delete(technologies).where(eq(technologies.id, testTechnologyId));
    await db.delete(hashtags).where(eq(hashtags.id, testHashtagId));
  });

  describe('GET /api/projects', () => {
    it('should return a paginated list of projects', async () => {
      const response = await fetch(
        'http://localhost:3000/api/projects?page=0&limit=20'
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

    it('should filter projects by status', async () => {
      const response = await fetch(
        'http://localhost:3000/api/projects?status=PUBLISHED'
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(
        data.data.every((project: any) => project.status === 'PUBLISHED')
      ).toBe(true);
    });

    it('should filter projects by technology ID', async () => {
      const response = await fetch(
        `http://localhost:3000/api/projects?technologyId=${testTechnologyId}`
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should filter projects by hashtag ID', async () => {
      const response = await fetch(
        `http://localhost:3000/api/projects?hashtagId=${testHashtagId}`
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should search projects by title and description', async () => {
      const response = await fetch(
        'http://localhost:3000/api/projects?search=test'
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('POST /api/projects', () => {
    it('should create a new project with technologies and hashtags', async () => {
      const newProject = {
        title: 'Test Project',
        slug: 'test-project',
        description: 'This is a test project description',
        status: 'DRAFT',
        images: ['https://example.com/image1.png'],
        githubUrl: 'https://github.com/user/test-project',
        liveUrl: 'https://test-project.example.com',
        isOngoing: false,
        technologyIds: [testTechnologyId],
        hashtagIds: [testHashtagId],
      };

      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.title).toBe(newProject.title);
      expect(data.slug).toBe(newProject.slug);
      expect(data.description).toBe(newProject.description);
      expect(data.status).toBe(newProject.status);
      expect(data.technologies).toBeDefined();
      expect(data.hashtags).toBeDefined();
      expect(Array.isArray(data.technologies)).toBe(true);
      expect(Array.isArray(data.hashtags)).toBe(true);
      expect(Array.isArray(data.images)).toBe(true);

      testProjectId = data.id;
    });

    it('should return 400 for invalid project data', async () => {
      const invalidProject = {
        title: '', // Invalid: empty title
        slug: 'invalid slug with spaces', // Invalid: spaces in slug
        description: '',
      };

      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidProject),
      });

      expect(response.status).toBe(400);
    });

    it('should return 409 for duplicate slug', async () => {
      const project1 = {
        title: 'First Project',
        slug: 'duplicate-project-slug',
        description: 'Description',
        status: 'DRAFT',
      };

      await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project1),
      });

      const project2 = {
        title: 'Second Project',
        slug: 'duplicate-project-slug', // Same slug
        description: 'Description',
        status: 'DRAFT',
      };

      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project2),
      });

      expect(response.status).toBe(409);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return a single project with relations', async () => {
      const response = await fetch(
        `http://localhost:3000/api/projects/${testProjectId}`
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('title');
      expect(data).toHaveProperty('slug');
      expect(data).toHaveProperty('description');
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('technologies');
      expect(data).toHaveProperty('hashtags');
      expect(data).toHaveProperty('images');
      expect(Array.isArray(data.technologies)).toBe(true);
      expect(Array.isArray(data.hashtags)).toBe(true);
      expect(Array.isArray(data.images)).toBe(true);
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(
        `http://localhost:3000/api/projects/${fakeId}`
      );
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update an existing project', async () => {
      const updates = {
        title: 'Updated Test Project',
        description: 'Updated description',
        status: 'PUBLISHED',
      };

      const response = await fetch(
        `http://localhost:3000/api/projects/${testProjectId}`,
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
      expect(data.description).toBe(updates.description);
      expect(data.status).toBe(updates.status);
    });

    it('should update project technologies and hashtags', async () => {
      const updates = {
        technologyIds: [],
        hashtagIds: [],
      };

      const response = await fetch(
        `http://localhost:3000/api/projects/${testProjectId}`,
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
      expect(data.technologies).toHaveLength(0);
      expect(data.hashtags).toHaveLength(0);
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(
        `http://localhost:3000/api/projects/${fakeId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Updated' }),
        }
      );

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete a project and cascade associations', async () => {
      const response = await fetch(
        `http://localhost:3000/api/projects/${testProjectId}`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(204);

      // Verify project is deleted
      const getResponse = await fetch(
        `http://localhost:3000/api/projects/${testProjectId}`
      );
      expect(getResponse.status).toBe(404);

      // Verify cascade: associations should be removed
      const techAssociations = await db
        .select()
        .from(projectTechnologies)
        .where(eq(projectTechnologies.projectId, testProjectId));
      expect(techAssociations).toHaveLength(0);

      const hashtagAssociations = await db
        .select()
        .from(projectHashtags)
        .where(eq(projectHashtags.projectId, testProjectId));
      expect(hashtagAssociations).toHaveLength(0);

      // Technologies and hashtags should still exist
      const technology = await db
        .select()
        .from(technologies)
        .where(eq(technologies.id, testTechnologyId));
      expect(technology).toHaveLength(1);

      const hashtag = await db
        .select()
        .from(hashtags)
        .where(eq(hashtags.id, testHashtagId));
      expect(hashtag).toHaveLength(1);
    });

    it('should return 404 for non-existent project', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await fetch(
        `http://localhost:3000/api/projects/${fakeId}`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(404);
    });
  });
});
