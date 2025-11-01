import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as bcrypt from 'bcryptjs';
import { verifyCredentials, getUserById } from '@/services/auth.service';
import { UnauthorizedError, NotFoundError } from '@/lib/errors';

// Mock the database client
vi.mock('@/db/client', () => {
  const mockDb = {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
  };
  return { db: mockDb };
});

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
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

describe('auth.service', () => {
  let mockDb: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { db } = await import('@/db/client');
    mockDb = db;
  });

  describe('verifyCredentials', () => {
    it('should verify valid credentials', async () => {
      const mockUser = {
        id: '123',
        username: 'admin',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
      };

      vi.mocked(mockDb.select).mockReturnValue(mockDb);
      vi.mocked(mockDb.from).mockReturnValue(mockDb);
      vi.mocked(mockDb.where).mockReturnValue(mockDb);
      vi.mocked(mockDb.limit).mockResolvedValue([mockUser]);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await verifyCredentials('admin', 'password123');

      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        createdAt: mockUser.createdAt,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashed_password'
      );
    });

    it('should throw UnauthorizedError for invalid username', async () => {
      vi.mocked(mockDb.select).mockReturnValue(mockDb);
      vi.mocked(mockDb.from).mockReturnValue(mockDb);
      vi.mocked(mockDb.where).mockReturnValue(mockDb);
      vi.mocked(mockDb.limit).mockResolvedValue([]);

      await expect(
        verifyCredentials('invalid', 'password123')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for invalid password', async () => {
      const mockUser = {
        id: '123',
        username: 'admin',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
      };

      vi.mocked(mockDb.select).mockReturnValue(mockDb);
      vi.mocked(mockDb.from).mockReturnValue(mockDb);
      vi.mocked(mockDb.where).mockReturnValue(mockDb);
      vi.mocked(mockDb.limit).mockResolvedValue([mockUser]);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(verifyCredentials('admin', 'wrong_password')).rejects.toThrow(
        UnauthorizedError
      );
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: '123',
        username: 'admin',
        passwordHash: 'hashed_password',
        createdAt: new Date(),
      };

      vi.mocked(mockDb.select).mockReturnValue(mockDb);
      vi.mocked(mockDb.from).mockReturnValue(mockDb);
      vi.mocked(mockDb.where).mockReturnValue(mockDb);
      vi.mocked(mockDb.limit).mockResolvedValue([mockUser]);

      const result = await getUserById('123');

      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        createdAt: mockUser.createdAt,
      });
    });

    it('should throw NotFoundError when user not found', async () => {
      vi.mocked(mockDb.select).mockReturnValue(mockDb);
      vi.mocked(mockDb.from).mockReturnValue(mockDb);
      vi.mocked(mockDb.where).mockReturnValue(mockDb);
      vi.mocked(mockDb.limit).mockResolvedValue([]);

      await expect(getUserById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});
