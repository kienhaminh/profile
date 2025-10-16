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
 * Integration test for complete project CRUD workflow
 * Tests the full lifecycle including associations and cascade behavior
 *
 * CRITICAL: These tests MUST FAIL until the implementation is complete
 */

describe('Project CRUD Integration Tests', () => {
  let technologyId1: string;
  let technologyId2: string;
  let hashtagId1: string;
  let hashtagId2: string;
  let projectId: string;

  beforeAll(async () => {
    // Setup test technologies
    const [tech1] = await db
      .insert(technologies)
      .values({
        name: 'Integration Tech 1',
        slug: 'integration-tech-1',
      })
      .returning();
    technologyId1 = tech1.id;

    const [tech2] = await db
      .insert(technologies)
      .values({
        name: 'Integration Tech 2',
        slug: 'integration-tech-2',
      })
      .returning();
    technologyId2 = tech2.id;

    // Setup test hashtags
    const [hashtag1] = await db
      .insert(hashtags)
      .values({
        name: 'Project Integration Hashtag 1',
        slug: 'project-integration-hashtag-1',
      })
      .returning();
    hashtagId1 = hashtag1.id;

    const [hashtag2] = await db
      .insert(hashtags)
      .values({
        name: 'Project Integration Hashtag 2',
        slug: 'project-integration-hashtag-2',
      })
      .returning();
    hashtagId2 = hashtag2.id;
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(technologies).where(eq(technologies.id, technologyId1));
    await db.delete(technologies).where(eq(technologies.id, technologyId2));
    await db.delete(hashtags).where(eq(hashtags.id, hashtagId1));
    await db.delete(hashtags).where(eq(hashtags.id, hashtagId2));
  });

  it('should complete full project CRUD lifecycle', async () => {
    // 1. CREATE: Create project with technologies and hashtags
    const createResponse = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Integration Test Project',
        slug: 'integration-test-project',
        description: 'Full integration test description',
        status: 'DRAFT',
        images: ['https://example.com/image1.png'],
        githubUrl: 'https://github.com/user/integration-test',
        liveUrl: 'https://integration-test.example.com',
        isOngoing: false,
        technologyIds: [technologyId1, technologyId2],
        hashtagIds: [hashtagId1],
      }),
    });

    expect(createResponse.status).toBe(201);
    const createdProject = await createResponse.json();
    expect(createdProject).toHaveProperty('id');
    expect(createdProject.technologies).toHaveLength(2);
    expect(createdProject.hashtags).toHaveLength(1);
    expect(createdProject.images).toHaveLength(1);
    projectId = createdProject.id;

    // 2. READ: Verify project can be retrieved with all relations
    const readResponse = await fetch(
      `http://localhost:3000/api/projects/${projectId}`
    );
    expect(readResponse.status).toBe(200);
    const readProject = await readResponse.json();
    expect(readProject.id).toBe(projectId);
    expect(readProject.technologies).toHaveLength(2);
    expect(readProject.hashtags).toHaveLength(1);

    // 3. UPDATE: Add hashtag, remove one technology, update images
    const updateResponse = await fetch(
      `http://localhost:3000/api/projects/${projectId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Updated Integration Test Project',
          technologyIds: [technologyId1], // Remove tech2
          hashtagIds: [hashtagId1, hashtagId2], // Add hashtag2
          images: [
            'https://example.com/image1.png',
            'https://example.com/image2.png',
          ],
        }),
      }
    );

    expect(updateResponse.status).toBe(200);
    const updatedProject = await updateResponse.json();
    expect(updatedProject.title).toBe('Updated Integration Test Project');
    expect(updatedProject.technologies).toHaveLength(1);
    expect(updatedProject.hashtags).toHaveLength(2);
    expect(updatedProject.images).toHaveLength(2);

    // 4. PUBLISH: Change status to published
    const publishResponse = await fetch(
      `http://localhost:3000/api/projects/${projectId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PUBLISHED',
        }),
      }
    );

    expect(publishResponse.status).toBe(200);
    const publishedProject = await publishResponse.json();
    expect(publishedProject.status).toBe('PUBLISHED');

    // 5. DELETE: Remove project and verify cascade
    const deleteResponse = await fetch(
      `http://localhost:3000/api/projects/${projectId}`,
      {
        method: 'DELETE',
      }
    );

    expect(deleteResponse.status).toBe(204);

    // Verify project is gone
    const verifyDeleteResponse = await fetch(
      `http://localhost:3000/api/projects/${projectId}`
    );
    expect(verifyDeleteResponse.status).toBe(404);

    // Verify associations are removed (cascade delete)
    const remainingTechAssociations = await db
      .select()
      .from(projectTechnologies)
      .where(eq(projectTechnologies.projectId, projectId));
    expect(remainingTechAssociations).toHaveLength(0);

    const remainingHashtagAssociations = await db
      .select()
      .from(projectHashtags)
      .where(eq(projectHashtags.projectId, projectId));
    expect(remainingHashtagAssociations).toHaveLength(0);

    // Verify technologies and hashtags still exist
    const tech1Still = await db
      .select()
      .from(technologies)
      .where(eq(technologies.id, technologyId1));
    expect(tech1Still).toHaveLength(1);

    const hashtag1Still = await db
      .select()
      .from(hashtags)
      .where(eq(hashtags.id, hashtagId1));
    expect(hashtag1Still).toHaveLength(1);
  });

  it('should handle cascade deletion when technology is deleted', async () => {
    // Create project with a technology
    const createResponse = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Cascade Test Project',
        slug: 'cascade-test-project',
        description: 'Testing cascade behavior',
        status: 'DRAFT',
        technologyIds: [technologyId1],
      }),
    });

    const createdProject = await createResponse.json();
    const testProjectId = createdProject.id;

    // Verify association exists
    const associations = await db
      .select()
      .from(projectTechnologies)
      .where(eq(projectTechnologies.projectId, testProjectId));
    expect(associations).toHaveLength(1);

    // Delete the technology
    await fetch(`http://localhost:3000/api/technologies/${technologyId1}`, {
      method: 'DELETE',
    });

    // Verify association is removed due to CASCADE
    const remainingAssociations = await db
      .select()
      .from(projectTechnologies)
      .where(eq(projectTechnologies.projectId, testProjectId));
    expect(remainingAssociations).toHaveLength(0);

    // Verify project still exists
    const projectResponse = await fetch(
      `http://localhost:3000/api/projects/${testProjectId}`
    );
    expect(projectResponse.status).toBe(200);

    // Cleanup
    await fetch(`http://localhost:3000/api/projects/${testProjectId}`, {
      method: 'DELETE',
    });

    // Recreate technology1 for other tests
    const [tech] = await db
      .insert(technologies)
      .values({
        name: 'Integration Tech 1',
        slug: 'integration-tech-1',
      })
      .returning();
    technologyId1 = tech.id;
  });

  it('should handle ongoing projects correctly', async () => {
    // Create ongoing project
    const createResponse = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Ongoing Project',
        slug: 'ongoing-project-test',
        description: 'An ongoing project',
        status: 'PUBLISHED',
        isOngoing: true,
        startDate: new Date().toISOString(),
      }),
    });

    const ongoingProject = await createResponse.json();
    expect(ongoingProject.isOngoing).toBe(true);
    expect(ongoingProject.endDate).toBeNull();

    // Mark as completed
    const updateResponse = await fetch(
      `http://localhost:3000/api/projects/${ongoingProject.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isOngoing: false,
          endDate: new Date().toISOString(),
        }),
      }
    );

    const completedProject = await updateResponse.json();
    expect(completedProject.isOngoing).toBe(false);
    expect(completedProject.endDate).toBeDefined();

    // Cleanup
    await fetch(`http://localhost:3000/api/projects/${ongoingProject.id}`, {
      method: 'DELETE',
    });
  });

  it('should handle draft to published status transitions', async () => {
    // Create draft project
    const createResponse = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Status Transition Project',
        slug: 'status-transition-project',
        description: 'Testing status transitions',
        status: 'DRAFT',
      }),
    });

    const draftProject = await createResponse.json();
    expect(draftProject.status).toBe('DRAFT');

    // Publish the project
    const publishResponse = await fetch(
      `http://localhost:3000/api/projects/${draftProject.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PUBLISHED',
        }),
      }
    );

    const publishedProject = await publishResponse.json();
    expect(publishedProject.status).toBe('PUBLISHED');

    // Verify published project appears in published list
    const listResponse = await fetch(
      'http://localhost:3000/api/projects?status=PUBLISHED'
    );
    const listData = await listResponse.json();
    const foundProject = listData.data.find(
      (p: any) => p.id === publishedProject.id
    );
    expect(foundProject).toBeDefined();

    // Cleanup
    await fetch(`http://localhost:3000/api/projects/${draftProject.id}`, {
      method: 'DELETE',
    });
  });
});
