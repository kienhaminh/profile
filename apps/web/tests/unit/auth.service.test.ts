import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database client
vi.mock('@/db/client', () => ({
  db: {
    select: vi.fn(),
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
  },
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(() => 'mock-jwt-token'),
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

// Import after mocks
import * as bcrypt from 'bcryptjs';
import { db } from '@/db/client';
import { authenticateUser } from '@/services/auth';

describe('auth.service', () => {
  const mockDb = db as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authenticateUser', () => {
    it('should authenticate user with valid credentials', async () => {
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

      const result = await authenticateUser({
        username: 'admin',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        username: mockUser.username,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashed_password'
      );
    });

    it('should fail authentication for invalid username', async () => {
      vi.mocked(mockDb.select).mockReturnValue(mockDb);
      vi.mocked(mockDb.from).mockReturnValue(mockDb);
      vi.mocked(mockDb.where).mockReturnValue(mockDb);
      vi.mocked(mockDb.limit).mockResolvedValue([]);

      const result = await authenticateUser({
        username: 'invalid',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.token).toBeUndefined();
      expect(result.user).toBeUndefined();
    });

    it('should fail authentication for invalid password', async () => {
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

      const result = await authenticateUser({
        username: 'admin',
        password: 'wrong_password',
      });

      expect(result.success).toBe(false);
      expect(result.token).toBeUndefined();
    });

    it('should handle authentication errors gracefully', async () => {
      vi.mocked(mockDb.select).mockReturnValue(mockDb);
      vi.mocked(mockDb.from).mockReturnValue(mockDb);
      vi.mocked(mockDb.where).mockReturnValue(mockDb);
      vi.mocked(mockDb.limit).mockRejectedValue(new Error('Database error'));

      const result = await authenticateUser({
        username: 'admin',
        password: 'password123',
      });

      expect(result.success).toBe(false);
    });

    it('should generate JWT token on successful authentication', async () => {
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

      const result = await authenticateUser({
        username: 'admin',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.token).toBeTruthy();
      expect(typeof result.token).toBe('string');
    });
  });
});
