import { db } from '../db';
import {
  projects,
  projectTechnologies,
  projectHashtags,
  type NewProject,
  type ProjectWithRelations,
  type Technology,
  type Hashtag,
} from '../db/schema';
import { eq, and, inArray, or, ilike, sql, desc } from 'drizzle-orm';
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectFilterParams,
} from '../lib/validation';
import type { ProjectStatus } from '@/types/enums';

// Type for Drizzle transaction - inferred from db type
type DrizzleTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Custom error classes for better error handling
export class ProjectNotFoundError extends Error {
  constructor(message: string = 'Project not found') {
    super(message);
    this.name = 'ProjectNotFoundError';
  }
}

export class ProjectConflictError extends Error {
  constructor(message: string = 'Project conflict') {
    super(message);
    this.name = 'ProjectConflictError';
  }
}

/**
 * Project service - Pure functions for project management
 * Handles project CRUD operations with technology and hashtag associations
 * All functions follow functional programming principles
 */

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types for junction table objects with relations (from Drizzle 'with' clause)
interface ProjectTechnologyWithRelation {
  projectId: string;
  technologyId: string;
  technology: Technology;
}

interface ProjectHashtagWithRelation {
  projectId: string;
  hashtagId: string;
  hashtag: Hashtag;
}

export async function createProject(
  data: CreateProjectRequest
): Promise<ProjectWithRelations> {
  // Use transaction to ensure atomicity
  return await db.transaction(async (tx) => {
    // Create the project
    const newProject: NewProject = {
      title: data.title,
      slug: data.slug,
      description: data.description,
      status: (data.status as ProjectStatus) || 'DRAFT',
      images: data.images || [],
      githubUrl: data.githubUrl || null,
      liveUrl: data.liveUrl || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      isOngoing: data.isOngoing || false,
    };

    try {
      const [project] = await tx
        .insert(projects)
        .values(newProject)
        .returning();

      // Associate technologies
      if (data.technologyIds && data.technologyIds.length > 0) {
        await tx.insert(projectTechnologies).values(
          data.technologyIds.map((technologyId) => ({
            projectId: project.id,
            technologyId,
          }))
        );
      }

      // Associate hashtags
      if (data.hashtagIds && data.hashtagIds.length > 0) {
        await tx.insert(projectHashtags).values(
          data.hashtagIds.map((hashtagId) => ({
            projectId: project.id,
            hashtagId,
          }))
        );
      }

      // Return project with relations
      return await getProjectById(project.id, tx);
    } catch (error) {
      const errorCode =
        error && typeof error === 'object' && 'code' in error ? error.code : '';
      if (errorCode === '23505') {
        throw new ProjectConflictError('Project with this slug already exists');
      }
      throw error;
    }
  });
}

export async function getProject(
  slug: string
): Promise<ProjectWithRelations | null> {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug));

  if (!project) {
    return null;
  }

  return await getProjectById(project.id);
}

export async function getProjectById(
  id: string,
  transaction?: DrizzleTransaction
): Promise<ProjectWithRelations> {
  const txOrDb = transaction || db;

  const project = await txOrDb.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      projectTechnologies: {
        with: {
          technology: true,
        },
      },
      projectHashtags: {
        with: {
          hashtag: true,
        },
      },
    },
  });

  if (!project) {
    throw new ProjectNotFoundError();
  }

  // Transform to ProjectWithRelations
  return {
    ...project,
    technologies: project.projectTechnologies.map(
      (pt: ProjectTechnologyWithRelation) => pt.technology
    ),
    hashtags: project.projectHashtags.map(
      (ph: ProjectHashtagWithRelation) => ph.hashtag
    ),
  };
}

export async function listProjects(
  filters: ProjectFilterParams
): Promise<PaginatedResult<ProjectWithRelations>> {
  const { page, limit, status, technologyId, hashtagId, search } = filters;

  // Build WHERE conditions
  const conditions = [];

  if (status) {
    conditions.push(eq(projects.status, status as ProjectStatus));
  }

  if (technologyId) {
    const projectsWithTech = await db
      .select({ id: projectTechnologies.projectId })
      .from(projectTechnologies)
      .where(eq(projectTechnologies.technologyId, technologyId));
    const projectIds = projectsWithTech.map((p) => p.id);
    if (projectIds.length > 0) {
      conditions.push(inArray(projects.id, projectIds));
    } else {
      // No projects with this technology
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }
  }

  if (hashtagId) {
    const projectsWithHashtag = await db
      .select({ id: projectHashtags.projectId })
      .from(projectHashtags)
      .where(eq(projectHashtags.hashtagId, hashtagId));
    const projectIds = projectsWithHashtag.map((p) => p.id);
    if (projectIds.length > 0) {
      conditions.push(inArray(projects.id, projectIds));
    } else {
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }
  }

  if (search) {
    const clause = or(
      ilike(projects.title, `%${search}%`),
      ilike(projects.description, `%${search}%`)
    );
    if (clause) {
      conditions.push(clause);
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projects)
    .where(whereClause);

  // Get paginated results
  const result = await db.query.projects.findMany({
    where: whereClause,
    with: {
      projectTechnologies: {
        with: {
          technology: true,
        },
      },
      projectHashtags: {
        with: {
          hashtag: true,
        },
      },
    },
    orderBy: [desc(projects.createdAt)],
    limit,
    offset: page * limit,
  });

  const data: ProjectWithRelations[] = result.map((project) => ({
    ...project,
    technologies: project.projectTechnologies.map(
      (pt: ProjectTechnologyWithRelation) => pt.technology
    ),
    hashtags: project.projectHashtags.map(
      (ph: ProjectHashtagWithRelation) => ph.hashtag
    ),
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
}

export async function updateProject(
  id: string,
  data: UpdateProjectRequest
): Promise<ProjectWithRelations> {
  return await db.transaction(async (tx) => {
    // Check if project exists
    const existing = await tx
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    if (existing.length === 0) {
      throw new ProjectNotFoundError();
    }

    // Build update object
    const updateData: Partial<NewProject> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.status !== undefined) updateData.status = data.status as ProjectStatus;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.githubUrl !== undefined) {
      updateData.githubUrl = data.githubUrl || null;
    }
    if (data.liveUrl !== undefined) updateData.liveUrl = data.liveUrl || null;
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }
    if (data.isOngoing !== undefined) updateData.isOngoing = data.isOngoing;

    // Update project if there are changes
    if (Object.keys(updateData).length > 0) {
      try {
        await tx.update(projects).set(updateData).where(eq(projects.id, id));
      } catch (error) {
        const errorCode =
          error && typeof error === 'object' && 'code' in error
            ? error.code
            : '';
        if (errorCode === '23505') {
          throw new ProjectConflictError(
            'Project with this slug already exists'
          );
        }
        throw error;
      }
    }

    // Update technologies if provided
    if (data.technologyIds !== undefined) {
      // Remove existing associations
      await tx
        .delete(projectTechnologies)
        .where(eq(projectTechnologies.projectId, id));
      // Add new associations
      if (data.technologyIds.length > 0) {
        await tx.insert(projectTechnologies).values(
          data.technologyIds.map((technologyId) => ({
            projectId: id,
            technologyId,
          }))
        );
      }
    }

    // Update hashtags if provided
    if (data.hashtagIds !== undefined) {
      // Remove existing associations
      await tx.delete(projectHashtags).where(eq(projectHashtags.projectId, id));
      // Add new associations
      if (data.hashtagIds.length > 0) {
        await tx.insert(projectHashtags).values(
          data.hashtagIds.map((hashtagId) => ({
            projectId: id,
            hashtagId,
          }))
        );
      }
    }

    // Return updated project with relations
    return await getProjectById(id, tx);
  });
}

export async function deleteProject(id: string): Promise<void> {
  const existing = await db.select().from(projects).where(eq(projects.id, id));
  if (existing.length === 0) {
    throw new ProjectNotFoundError();
  }

  // Cascade delete will handle associations automatically
  await db.delete(projects).where(eq(projects.id, id));
}
