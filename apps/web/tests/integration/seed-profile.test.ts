import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../src/db';
import {
  authorProfiles,
  technologies,
  projects,
  projectTechnologies,
} from '../../src/db/schema';
import { eq } from 'drizzle-orm';
import {
  parseNotionCvToAuthor,
  parseNotionCvToProjects,
} from '../../src/services/migration/notion-cv-mapper';
import { generateSlug } from '../../src/lib/slug';

const TEST_NOTION_CV = `
<page url="{{https://www.notion.so/test}}">
<content>
<columns>
	<column>
		<image source="{{https://example.com/test-avatar.jpg}}"></image>
	</column>
	<column>
		### Full Stack Developer
		---
		**Address**: Test Address
		**Mobile**: 1234567890
		**Email**: test@example.com
		**Facebook**: [fb.test]({{https://facebook.com/test}})
		**LinkedIn**: [linkedin.test]({{https://linkedin.com/test}})
		**Github**: [github.test]({{https://github.com/test}})
	</column>
</columns>
## About me
---
- Test bio line 1
- Test bio line 2
## Projects
---
### Test Project Alpha
*Jan 2021 - Jun 2021*
<columns>
	<column>
		**Description**
	</column>
	<column>
		First test project description
		**Website**: [https://alpha.test.com]({{https://alpha.test.com}})
	</column>
</columns>
<columns>
	<column>
		**My responsibilities**
	</column>
	<column>
		Build frontend and backend
	</column>
</columns>
<columns>
	<column>
		**Technologies used**
	</column>
	<column>
		NextJS, PostgreSQL, AWS
	</column>
</columns>
### Test Project Beta
*Jul 2021 - now*
<columns>
	<column>
		**Description**
	</column>
	<column>
		Second test project description
	</column>
</columns>
<columns>
	<column>
		**Technologies used**
	</column>
	<column>
		ReactJS, MongoDB
	</column>
</columns>
</content>
</page>
`;

describe('seed-profile integration', () => {
  // Clean up test data before each test
  beforeEach(async () => {
    // Delete in correct order due to foreign keys
    await db.delete(projectTechnologies);
    await db.delete(projects);
    await db.delete(technologies);
    await db
      .delete(authorProfiles)
      .where(eq(authorProfiles.email, 'test@example.com'));
  });

  it('should parse and seed author profile', async () => {
    // Parse
    const authorData = parseNotionCvToAuthor(TEST_NOTION_CV);

    // Verify parsed data
    expect(authorData.name).toBe('KIEN HA MINH');
    expect(authorData.email).toBe('test@example.com');
    expect(authorData.avatar).toBe('https://example.com/test-avatar.jpg');

    // Seed to database
    const [createdAuthor] = await db
      .insert(authorProfiles)
      .values(authorData)
      .returning();

    expect(createdAuthor.id).toBeDefined();
    expect(createdAuthor.email).toBe('test@example.com');
    expect(createdAuthor.bio).toContain('Test bio line 1');

    // Verify in database
    const [dbAuthor] = await db
      .select()
      .from(authorProfiles)
      .where(eq(authorProfiles.email, 'test@example.com'));

    expect(dbAuthor).toBeDefined();
    expect(dbAuthor.name).toBe('KIEN HA MINH');
  });

  it('should parse and seed technologies', async () => {
    // Parse projects to extract technologies
    const parsedProjects = parseNotionCvToProjects(TEST_NOTION_CV);

    // Collect unique technology names
    const techNames = new Set<string>();
    for (const { technologyNames } of parsedProjects) {
      for (const name of technologyNames) {
        techNames.add(name);
      }
    }

    expect(techNames.size).toBeGreaterThan(0);
    expect(techNames.has('NextJS')).toBe(true);
    expect(techNames.has('PostgreSQL')).toBe(true);
    expect(techNames.has('ReactJS')).toBe(true);

    // Seed technologies
    const techMap = new Map<string, string>();
    for (const name of techNames) {
      const slug = generateSlug(name);
      const [tech] = await db
        .insert(technologies)
        .values({ name, slug, description: null })
        .returning();
      techMap.set(name, tech.id);
    }

    expect(techMap.size).toBe(techNames.size);

    // Verify in database
    const dbTechs = await db.select().from(technologies);
    expect(dbTechs.length).toBeGreaterThanOrEqual(techNames.size);
  });

  it('should parse and seed projects with relations', async () => {
    // 1. Seed author first
    const authorData = parseNotionCvToAuthor(TEST_NOTION_CV);
    const [author] = await db
      .insert(authorProfiles)
      .values(authorData)
      .returning();

    // 2. Parse and seed technologies
    const parsedProjects = parseNotionCvToProjects(TEST_NOTION_CV);
    const techNames = new Set<string>();
    for (const { technologyNames } of parsedProjects) {
      for (const name of technologyNames) {
        techNames.add(name);
      }
    }

    const techMap = new Map<string, string>();
    for (const name of techNames) {
      const slug = generateSlug(name);
      const [tech] = await db
        .insert(technologies)
        .values({ name, slug, description: null })
        .returning();
      techMap.set(name, tech.id);
    }

    // 3. Seed projects
    expect(parsedProjects).toHaveLength(2);

    for (const { project, technologyNames } of parsedProjects) {
      const [createdProject] = await db
        .insert(projects)
        .values(project)
        .returning();

      // Associate technologies
      const techIds = technologyNames
        .map((name) => techMap.get(name))
        .filter((id): id is string => id !== undefined);

      if (techIds.length > 0) {
        await db.insert(projectTechnologies).values(
          techIds.map((technologyId) => ({
            projectId: createdProject.id,
            technologyId,
          }))
        );
      }
    }

    // 4. Verify projects in database
    const dbProjects = await db.select().from(projects);
    expect(dbProjects.length).toBeGreaterThanOrEqual(2);

    const alphaProject = dbProjects.find(
      (p) => p.title === 'Test Project Alpha'
    );
    expect(alphaProject).toBeDefined();
    expect(alphaProject?.liveUrl).toBe('https://alpha.test.com');
    expect(alphaProject?.isOngoing).toBe(false);

    const betaProject = dbProjects.find((p) => p.title === 'Test Project Beta');
    expect(betaProject).toBeDefined();
    expect(betaProject?.isOngoing).toBe(true);
    expect(betaProject?.endDate).toBeNull();

    // 5. Verify project-technology relations
    if (alphaProject) {
      const relations = await db
        .select()
        .from(projectTechnologies)
        .where(eq(projectTechnologies.projectId, alphaProject.id));

      expect(relations.length).toBeGreaterThan(0);
    }
  });

  it('should handle upsert for existing author', async () => {
    const authorData = parseNotionCvToAuthor(TEST_NOTION_CV);

    // First insert
    const [firstInsert] = await db
      .insert(authorProfiles)
      .values(authorData)
      .returning();

    // Try to upsert (update existing)
    const existing = await db
      .select()
      .from(authorProfiles)
      .where(eq(authorProfiles.email, authorData.email));

    expect(existing).toHaveLength(1);

    // Update
    const updatedData = {
      ...authorData,
      bio: 'Updated bio',
    };

    await db
      .update(authorProfiles)
      .set(updatedData)
      .where(eq(authorProfiles.email, authorData.email));

    // Verify update
    const [updated] = await db
      .select()
      .from(authorProfiles)
      .where(eq(authorProfiles.email, authorData.email));

    expect(updated.id).toBe(firstInsert.id); // Same ID
    expect(updated.bio).toBe('Updated bio'); // Updated field
  });

  it('should handle upsert for existing project', async () => {
    const parsedProjects = parseNotionCvToProjects(TEST_NOTION_CV);
    const firstProject = parsedProjects[0];

    // First insert
    const [inserted] = await db
      .insert(projects)
      .values(firstProject.project)
      .returning();

    // Check if exists
    const existing = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, firstProject.project.slug));

    expect(existing).toHaveLength(1);

    // Update
    const updatedProject = {
      ...firstProject.project,
      description: 'Updated description',
    };

    await db
      .update(projects)
      .set(updatedProject)
      .where(eq(projects.slug, firstProject.project.slug));

    // Verify update
    const [updated] = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, firstProject.project.slug));

    expect(updated.id).toBe(inserted.id); // Same ID
    expect(updated.description).toBe('Updated description'); // Updated field
  });

  it('should handle technology deduplication across projects', async () => {
    const parsedProjects = parseNotionCvToProjects(TEST_NOTION_CV);

    // Collect all tech names across all projects
    const allTechNames: string[] = [];
    for (const { technologyNames } of parsedProjects) {
      allTechNames.push(...technologyNames);
    }

    // Count occurrences
    const techCounts = new Map<string, number>();
    for (const name of allTechNames) {
      techCounts.set(name, (techCounts.get(name) || 0) + 1);
    }

    // Seed unique technologies only
    const uniqueTechNames = new Set(allTechNames);
    for (const name of uniqueTechNames) {
      const slug = generateSlug(name);
      await db.insert(technologies).values({ name, slug, description: null });
    }

    // Verify: DB should have only unique entries
    const dbTechs = await db.select().from(technologies);
    const dbTechNames = dbTechs.map((t) => t.name);

    expect(dbTechNames.length).toBe(uniqueTechNames.size);
    expect(new Set(dbTechNames).size).toBe(dbTechNames.length); // All unique
  });
});
