import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../../src/db';
import {
  posts,
  projects,
  topics,
  hashtags,
  technologies,
  authorProfiles,
  postTopics,
  postHashtags,
  projectTechnologies,
  projectHashtags,
} from '../../src/db/schema';
import { eq, inArray } from 'drizzle-orm';

/**
 * Integration tests for visitor filtering functionality
 * Tests search, filtering, and pagination features
 *
 * CRITICAL: These tests MUST FAIL until the implementation is complete
 */

describe('Filtering and Search Integration Tests', () => {
  let authorId: string;
  let topicJavaScriptId: string;
  let topicTypeScriptId: string;
  let hashtagTutorialId: string;
  let hashtagAdvancedId: string;
  let techReactId: string;
  let techNodeId: string;
  let blogIds: string[] = [];
  let projectIds: string[] = [];

  beforeAll(async () => {
    // Setup author
    const [author] = await db
      .insert(authorProfiles)
      .values({
        name: 'Filter Test Author',
        email: 'filter@example.com',
      })
      .returning();
    authorId = author.id;

    // Setup topics
    const [topicJS] = await db
      .insert(topics)
      .values({ name: 'JavaScript', slug: 'javascript-filter' })
      .returning();
    topicJavaScriptId = topicJS.id;

    const [topicTS] = await db
      .insert(topics)
      .values({ name: 'TypeScript', slug: 'typescript-filter' })
      .returning();
    topicTypeScriptId = topicTS.id;

    // Setup hashtags
    const [hashtagTut] = await db
      .insert(hashtags)
      .values({ name: 'tutorial', slug: 'tutorial-filter' })
      .returning();
    hashtagTutorialId = hashtagTut.id;

    const [hashtagAdv] = await db
      .insert(hashtags)
      .values({ name: 'advanced', slug: 'advanced-filter' })
      .returning();
    hashtagAdvancedId = hashtagAdv.id;

    // Setup technologies
    const [techR] = await db
      .insert(technologies)
      .values({ name: 'React', slug: 'react-filter' })
      .returning();
    techReactId = techR.id;

    const [techN] = await db
      .insert(technologies)
      .values({ name: 'Node.js', slug: 'nodejs-filter' })
      .returning();
    techNodeId = techN.id;

    // Create test blogs
    const blog1Response = await fetch('http://localhost:3000/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'JavaScript Basics Tutorial',
        slug: 'javascript-basics-tutorial',
        content: 'Learn JavaScript fundamentals',
        status: 'PUBLISHED',
        publishDate: new Date().toISOString(),
        topicIds: [topicJavaScriptId],
        hashtagIds: [hashtagTutorialId],
      }),
    });
    const blog1 = await blog1Response.json();
    blogIds.push(blog1.id);

    const blog2Response = await fetch('http://localhost:3000/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Advanced TypeScript Patterns',
        slug: 'advanced-typescript-patterns',
        content: 'Deep dive into TypeScript advanced features',
        status: 'PUBLISHED',
        publishDate: new Date().toISOString(),
        topicIds: [topicTypeScriptId],
        hashtagIds: [hashtagAdvancedId],
      }),
    });
    const blog2 = await blog2Response.json();
    blogIds.push(blog2.id);

    const blog3Response = await fetch('http://localhost:3000/api/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'JavaScript and TypeScript Together',
        slug: 'js-ts-together',
        content: 'Using both languages in harmony',
        status: 'PUBLISHED',
        publishDate: new Date().toISOString(),
        topicIds: [topicJavaScriptId, topicTypeScriptId],
        hashtagIds: [hashtagTutorialId, hashtagAdvancedId],
      }),
    });
    const blog3 = await blog3Response.json();
    blogIds.push(blog3.id);

    // Create test projects
    const project1Response = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'React Dashboard',
        slug: 'react-dashboard',
        description: 'Admin dashboard built with React',
        status: 'PUBLISHED',
        technologyIds: [techReactId],
        hashtagIds: [hashtagTutorialId],
      }),
    });
    const project1 = await project1Response.json();
    projectIds.push(project1.id);

    const project2Response = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Node.js API Server',
        slug: 'nodejs-api-server',
        description: 'RESTful API built with Node.js',
        status: 'PUBLISHED',
        technologyIds: [techNodeId],
        hashtagIds: [hashtagAdvancedId],
      }),
    });
    const project2 = await project2Response.json();
    projectIds.push(project2.id);

    const project3Response = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Full Stack Application',
        slug: 'fullstack-app',
        description: 'Complete application with React and Node.js',
        status: 'PUBLISHED',
        technologyIds: [techReactId, techNodeId],
      }),
    });
    const project3 = await project3Response.json();
    projectIds.push(project3.id);
  });

  afterAll(async () => {
    // Cleanup
    for (const blogId of blogIds) {
      await fetch(`http://localhost:3000/api/blog/${blogId}`, {
        method: 'DELETE',
      });
    }
    for (const projectId of projectIds) {
      await fetch(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'DELETE',
      });
    }

    await db.delete(authorProfiles).where(eq(authorProfiles.id, authorId));
    await db.delete(topics).where(eq(topics.id, topicJavaScriptId));
    await db.delete(topics).where(eq(topics.id, topicTypeScriptId));
    await db.delete(hashtags).where(eq(hashtags.id, hashtagTutorialId));
    await db.delete(hashtags).where(eq(hashtags.id, hashtagAdvancedId));
    await db.delete(technologies).where(eq(technologies.id, techReactId));
    await db.delete(technologies).where(eq(technologies.id, techNodeId));
  });

  describe('Blog Filtering', () => {
    it('should filter blogs by topic', async () => {
      const response = await fetch(
        `http://localhost:3000/api/blog?topicId=${topicJavaScriptId}&status=PUBLISHED`
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data.length).toBeGreaterThanOrEqual(2); // blog1 and blog3
      expect(
        data.data.every((blog: any) =>
          blog.topics.some((t: any) => t.id === topicJavaScriptId)
        )
      ).toBe(true);
    });

    it('should filter blogs by hashtag', async () => {
      const response = await fetch(
        `http://localhost:3000/api/blog?hashtagId=${hashtagTutorialId}&status=PUBLISHED`
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data.length).toBeGreaterThanOrEqual(2); // blog1 and blog3
      expect(
        data.data.every((blog: any) =>
          blog.hashtags.some((h: any) => h.id === hashtagTutorialId)
        )
      ).toBe(true);
    });

    it('should search blogs by title', async () => {
      const response = await fetch(
        'http://localhost:3000/api/blog?search=TypeScript&status=PUBLISHED'
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data.length).toBeGreaterThanOrEqual(2); // blog2 and blog3
      expect(
        data.data.every(
          (blog: any) =>
            blog.title.toLowerCase().includes('typescript') ||
            blog.content.toLowerCase().includes('typescript')
        )
      ).toBe(true);
    });

    it('should paginate blog results', async () => {
      const page1Response = await fetch(
        'http://localhost:3000/api/blog?page=0&limit=2&status=PUBLISHED'
      );
      const page1Data = await page1Response.json();
      expect(page1Data.data).toHaveLength(2);
      expect(page1Data.pagination.page).toBe(0);
      expect(page1Data.pagination.limit).toBe(2);

      const page2Response = await fetch(
        'http://localhost:3000/api/blog?page=1&limit=2&status=PUBLISHED'
      );
      const page2Data = await page2Response.json();
      expect(page2Data.pagination.page).toBe(1);
      expect(page2Data.pagination.limit).toBe(2);
    });

    it('should only return published blogs for public API', async () => {
      const response = await fetch('http://localhost:3000/api/blog');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data.every((blog: any) => blog.status === 'PUBLISHED')).toBe(
        true
      );
    });
  });

  describe('Project Filtering', () => {
    it('should filter projects by technology', async () => {
      const response = await fetch(
        `http://localhost:3000/api/projects?technologyId=${techReactId}&status=PUBLISHED`
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data.length).toBeGreaterThanOrEqual(2); // project1 and project3
      expect(
        data.data.every((project: any) =>
          project.technologies.some((t: any) => t.id === techReactId)
        )
      ).toBe(true);
    });

    it('should filter projects by hashtag', async () => {
      const response = await fetch(
        `http://localhost:3000/api/projects?hashtagId=${hashtagAdvancedId}&status=PUBLISHED`
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data.length).toBeGreaterThanOrEqual(1); // project2
      expect(
        data.data.every((project: any) =>
          project.hashtags.some((h: any) => h.id === hashtagAdvancedId)
        )
      ).toBe(true);
    });

    it('should search projects by title and description', async () => {
      const response = await fetch(
        'http://localhost:3000/api/projects?search=React&status=PUBLISHED'
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data.length).toBeGreaterThanOrEqual(2); // project1 and project3
      expect(
        data.data.every(
          (project: any) =>
            project.title.toLowerCase().includes('react') ||
            project.description.toLowerCase().includes('react')
        )
      ).toBe(true);
    });

    it('should paginate project results', async () => {
      const page1Response = await fetch(
        'http://localhost:3000/api/projects?page=0&limit=2&status=PUBLISHED'
      );
      const page1Data = await page1Response.json();
      expect(page1Data.data).toHaveLength(2);
      expect(page1Data.pagination.page).toBe(0);
      expect(page1Data.pagination.limit).toBe(2);

      const page2Response = await fetch(
        'http://localhost:3000/api/projects?page=1&limit=2&status=PUBLISHED'
      );
      const page2Data = await page2Response.json();
      expect(page2Data.pagination.page).toBe(1);
      expect(page2Data.pagination.limit).toBe(2);
    });

    it('should only return published projects for public API', async () => {
      const response = await fetch('http://localhost:3000/api/projects');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(
        data.data.every((project: any) => project.status === 'PUBLISHED')
      ).toBe(true);
    });
  });
});
