import { db } from '@/db/client';
import { projects, projectTags, tags } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { logger } from '@/lib/logger';
import { NotFoundError } from '@/lib/errors';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from '@/types/project';
import {
  createProjectInputSchema,
  updateProjectInputSchema,
} from '@/types/project';
import { PROJECT_STATUS, type ProjectStatus } from '@/types/enums';
import type { Tag } from '@/types/tag';

function normalizeProject(
  dbProject: typeof projects.$inferSelect,
  projectTagsList: Tag[]
): Project {
  return {
    id: dbProject.id,
    title: dbProject.title,
    slug: dbProject.slug,
    status: dbProject.status as ProjectStatus,
    description: dbProject.description,
    images: dbProject.images as string[],
    githubUrl: dbProject.githubUrl,
    liveUrl: dbProject.liveUrl,
    startDate: dbProject.startDate?.toISOString() || null,
    endDate: dbProject.endDate?.toISOString() || null,
    isOngoing: dbProject.isOngoing,
    createdAt: dbProject.createdAt.toISOString(),
    updatedAt: dbProject.updatedAt.toISOString(),
    tags: projectTagsList,
  };
}

export async function getAllProjects(
  statusFilter?: ProjectStatus
): Promise<Project[]> {
  try {
    const query = statusFilter
      ? db.select().from(projects).where(eq(projects.status, statusFilter))
      : db.select().from(projects);

    const result = await query.orderBy(desc(projects.createdAt));

    const projectsWithRelations = await Promise.all(
      result.map(async (project) => {
        const projectTagsResult = await db
          .select({ tag: tags })
          .from(projectTags)
          .innerJoin(tags, eq(projectTags.tagId, tags.id))
          .where(eq(projectTags.projectId, project.id));

        const tagsList: Tag[] = projectTagsResult.map((pt) => ({
          id: pt.tag.id,
          slug: pt.tag.slug,
          label: pt.tag.label,
          description: pt.tag.description,
          createdAt: pt.tag.createdAt.toISOString(),
          updatedAt: pt.tag.updatedAt.toISOString(),
        }));

        return normalizeProject(project, tagsList);
      })
    );

    return projectsWithRelations;
  } catch (error) {
    logger.error('Error getting all projects', { error, statusFilter });
    throw new Error('Failed to get projects');
  }
}

export async function getProjectById(id: string): Promise<Project> {
  try {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError(`Project not found: ${id}`);
    }

    const project = result[0];

    const projectTagsResult = await db
      .select({ tag: tags })
      .from(projectTags)
      .innerJoin(tags, eq(projectTags.tagId, tags.id))
      .where(eq(projectTags.projectId, project.id));

    const tagsList: Tag[] = projectTagsResult.map((pt) => ({
      id: pt.tag.id,
      slug: pt.tag.slug,
      label: pt.tag.label,
      description: pt.tag.description,
      createdAt: pt.tag.createdAt.toISOString(),
      updatedAt: pt.tag.updatedAt.toISOString(),
    }));

    return normalizeProject(project, tagsList);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Error getting project by ID', { error, id });
    throw new Error('Failed to get project');
  }
}

export async function getProjectBySlug(slug: string): Promise<Project> {
  try {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError(`Project not found: ${slug}`);
    }

    const project = result[0];

    const projectTagsResult = await db
      .select({ tag: tags })
      .from(projectTags)
      .innerJoin(tags, eq(projectTags.tagId, tags.id))
      .where(eq(projectTags.projectId, project.id));

    const tagsList: Tag[] = projectTagsResult.map((pt) => ({
      id: pt.tag.id,
      slug: pt.tag.slug,
      label: pt.tag.label,
      description: pt.tag.description,
      createdAt: pt.tag.createdAt.toISOString(),
      updatedAt: pt.tag.updatedAt.toISOString(),
    }));

    return normalizeProject(project, tagsList);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Error getting project by slug', { error, slug });
    throw new Error('Failed to get project');
  }
}

export async function createProject(
  input: CreateProjectInput
): Promise<Project> {
  const validated = createProjectInputSchema.parse(input);

  try {
    const result = await db
      .insert(projects)
      .values({
        title: validated.title,
        slug: validated.slug,
        status: validated.status || PROJECT_STATUS.DRAFT,
        description: validated.description,
        images: validated.images || [],
        githubUrl: validated.githubUrl || null,
        liveUrl: validated.liveUrl || null,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        isOngoing: validated.isOngoing || false,
      })
      .returning();

    const project = result[0];

    // Insert tag relations
    if (validated.tagIds && validated.tagIds.length > 0) {
      await db.insert(projectTags).values(
        validated.tagIds.map((tagId) => ({
          projectId: project.id,
          tagId,
        }))
      );
    }

    logger.info('Project created', { id: project.id, slug: project.slug });

    return getProjectById(project.id);
  } catch (error) {
    logger.error('Error creating project', { error, input });
    throw new Error('Failed to create project');
  }
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<Project> {
  const validated = updateProjectInputSchema.parse(input);

  try {
    // Check if project exists
    await getProjectById(id);

    // Prepare update data
    const updateData: Partial<typeof projects.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.slug !== undefined) updateData.slug = validated.slug;
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.description !== undefined)
      updateData.description = validated.description;
    if (validated.images !== undefined) updateData.images = validated.images;
    if (validated.githubUrl !== undefined)
      updateData.githubUrl = validated.githubUrl;
    if (validated.liveUrl !== undefined) updateData.liveUrl = validated.liveUrl;
    if (validated.startDate !== undefined)
      updateData.startDate = validated.startDate
        ? new Date(validated.startDate)
        : null;
    if (validated.endDate !== undefined)
      updateData.endDate = validated.endDate
        ? new Date(validated.endDate)
        : null;
    if (validated.isOngoing !== undefined)
      updateData.isOngoing = validated.isOngoing;

    await db.update(projects).set(updateData).where(eq(projects.id, id));

    // Update tag relations if provided
    if (validated.tagIds !== undefined) {
      // Delete existing relations
      await db.delete(projectTags).where(eq(projectTags.projectId, id));

      // Insert new relations
      if (validated.tagIds.length > 0) {
        await db.insert(projectTags).values(
          validated.tagIds.map((tagId) => ({
            projectId: id,
            tagId,
          }))
        );
      }
    }

    logger.info('Project updated', { id });

    return getProjectById(id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Error updating project', { error, id, input });
    throw new Error('Failed to update project');
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    // Check if project exists
    await getProjectById(id);

    // Delete project (cascade will handle projectTags)
    await db.delete(projects).where(eq(projects.id, id));

    logger.info('Project deleted', { id });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error('Error deleting project', { error, id });
    throw new Error('Failed to delete project');
  }
}
