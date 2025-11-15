import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '@/lib/errors';
import { PROJECT_STATUS } from '@/types/enums';

// Mock the database client
vi.mock('@/db/client', () => ({
  db: {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
    offset: vi.fn(),
    orderBy: vi.fn(),
    insert: vi.fn(),
    values: vi.fn(),
    returning: vi.fn(),
    update: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    innerJoin: vi.fn(),
    $dynamic: vi.fn(),
  },
}));

vi.mock('@/db/schema', () => ({
  projects: {},
  projectTags: {},
  tags: {},
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock drizzle-orm functions
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((field, value) => ({ field, value, op: 'eq' })),
  desc: vi.fn((field) => ({ field, dir: 'desc' })),
  count: vi.fn(() => ({ fn: 'count' })),
}));

// Import after mocks
import { db } from '@/db/client';
import {
  getAllProjects,
  getProjectById,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
} from '@/services/projects';

describe('projects.service', () => {
  const mockDb = db as any;
  const mockDate = new Date('2024-01-01T00:00:00.000Z');

  // Helper to create a thenable dynamic query mock
  const createDynamicQueryMock = (result: any) => ({
    where: vi.fn(function(this: any) { return this; }),
    orderBy: vi.fn(function(this: any) { return this; }),
    limit: vi.fn(function(this: any) { return this; }),
    offset: vi.fn(function(this: any) { return this; }),
    then: vi.fn((resolve) => resolve(result)),
  });

  const mockTag = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    slug: 'react',
    label: 'React',
    description: 'React library',
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockProject = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    slug: 'test-project',
    title: 'Test Project',
    status: PROJECT_STATUS.PUBLISHED,
    description: 'Test project description',
    images: ['https://example.com/image1.jpg'],
    githubUrl: 'https://github.com/test/project',
    liveUrl: 'https://test-project.com',
    startDate: mockDate,
    endDate: null,
    isOngoing: true,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllProjects', () => {
    it('should return all projects without pagination', async () => {
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.$dynamic.mockReturnValue(createDynamicQueryMock([mockProject]));

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      const result = await getAllProjects();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(mockProject.id);
      expect(result.data[0].title).toBe(mockProject.title);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should return projects with pagination', async () => {
      // Mock count query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockResolvedValueOnce([{ value: 20 }]);

      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.$dynamic.mockReturnValue(createDynamicQueryMock([mockProject]));

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      const result = await getAllProjects(undefined, { page: 1, limit: 10 });

      expect(result.pagination.total).toBe(20);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should filter projects by status', async () => {
      // Mock count query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ value: 10 }]);

      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.$dynamic.mockReturnValue(createDynamicQueryMock([mockProject]));

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      const result = await getAllProjects(PROJECT_STATUS.PUBLISHED, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('getProjectById', () => {
    it('should return project when found', async () => {
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockProject]);

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      const result = await getProjectById('550e8400-e29b-41d4-a716-446655440002');

      expect(result.id).toBe(mockProject.id);
      expect(result.title).toBe(mockProject.title);
      expect(result.tags).toHaveLength(1);
      expect(result.tags[0].slug).toBe('react');
    });

    it('should throw NotFoundError when project not found', async () => {
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(getProjectById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getProjectBySlug', () => {
    it('should return project when found', async () => {
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockProject]);

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      const result = await getProjectBySlug('test-project');

      expect(result.slug).toBe(mockProject.slug);
      expect(result.title).toBe(mockProject.title);
    });

    it('should throw NotFoundError when project not found', async () => {
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(getProjectBySlug('nonexistent')).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('createProject', () => {
    it('should create project without tags', async () => {
      const newProject = {
        title: 'New Project',
        slug: 'new-project',
        description: 'New project description',
      };

      mockDb.insert.mockReturnValueOnce(mockDb);
      mockDb.values.mockReturnValueOnce(mockDb);
      mockDb.returning.mockResolvedValueOnce([mockProject]);

      // Mock getProjectById for final return
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockProject]);

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([]);

      const result = await createProject(newProject);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(result.title).toBe(mockProject.title);
    });

    it('should create project with tags', async () => {
      const newProject = {
        title: 'New Project',
        slug: 'new-project',
        description: 'New project description',
        tagIds: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'],
      };

      mockDb.insert.mockReturnValueOnce(mockDb);
      mockDb.values.mockReturnValueOnce(mockDb);
      mockDb.returning.mockResolvedValueOnce([mockProject]);

      // Mock projectTags insert
      mockDb.insert.mockReturnValueOnce(mockDb);
      mockDb.values.mockResolvedValueOnce(undefined);

      // Mock getProjectById for final return
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockProject]);

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      const result = await createProject(newProject);

      expect(mockDb.insert).toHaveBeenCalledTimes(2); // project + projectTags
      expect(result.tags).toHaveLength(1);
    });

    it('should create project with images and URLs', async () => {
      const newProject = {
        title: 'New Project',
        slug: 'new-project',
        description: 'New project description',
        images: ['https://example.com/image1.jpg'],
        githubUrl: 'https://github.com/test/project',
        liveUrl: 'https://test-project.com',
        isOngoing: true,
      };

      mockDb.insert.mockReturnValueOnce(mockDb);
      mockDb.values.mockReturnValueOnce(mockDb);
      mockDb.returning.mockResolvedValueOnce([mockProject]);

      // Mock getProjectById for final return
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockProject]);

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([]);

      const result = await createProject(newProject);

      expect(result.images).toBeDefined();
      expect(result.githubUrl).toBe(mockProject.githubUrl);
      expect(result.liveUrl).toBe(mockProject.liveUrl);
      expect(result.isOngoing).toBe(true);
    });
  });

  describe('updateProject', () => {
    it('should update project fields', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      // Mock getProjectById (existence check)
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockProject]);

      // Mock tags query for existence check
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      // Mock update
      mockDb.update.mockReturnValueOnce(mockDb);
      mockDb.set.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce(undefined);

      // Mock getProjectById for final return
      const updatedProject = { ...mockProject, ...updateData };
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([updatedProject]);

      // Mock tags query for final return
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      const result = await updateProject('550e8400-e29b-41d4-a716-446655440002', updateData);

      expect(mockDb.update).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
    });

    it('should update project tags', async () => {
      const updateData = {
        tagIds: ['550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004'],
      };

      // Mock getProjectById (existence check)
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockProject]);

      // Mock tags query for existence check
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      // Mock update
      mockDb.update.mockReturnValueOnce(mockDb);
      mockDb.set.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce(undefined);

      // Mock delete old tags
      mockDb.delete.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce(undefined);

      // Mock insert new tags
      mockDb.insert.mockReturnValueOnce(mockDb);
      mockDb.values.mockResolvedValueOnce(undefined);

      // Mock getProjectById for final return
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockProject]);

      // Mock tags query for final return
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      await updateProject('550e8400-e29b-41d4-a716-446655440002', updateData);

      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should throw NotFoundError when project not found', async () => {
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(
        updateProject('nonexistent', { title: 'Updated' })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteProject', () => {
    it('should delete project successfully', async () => {
      // Mock getProjectById (existence check)
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([mockProject]);

      // Mock tags query
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.innerJoin.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce([{ tag: mockTag }]);

      // Mock delete
      mockDb.delete.mockReturnValueOnce(mockDb);
      mockDb.where.mockResolvedValueOnce(undefined);

      await deleteProject('550e8400-e29b-41d4-a716-446655440002');

      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundError when project not found', async () => {
      mockDb.select.mockReturnValueOnce(mockDb);
      mockDb.from.mockReturnValueOnce(mockDb);
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockResolvedValueOnce([]);

      await expect(deleteProject('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});
