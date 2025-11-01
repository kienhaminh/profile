import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAllConfigs,
  getConfigByKey,
  upsertConfig,
} from '@/services/config.service';

// Mock the database client
const mockDb = {
  select: vi.fn(),
  from: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
  insert: vi.fn(),
  values: vi.fn(),
  onConflictDoUpdate: vi.fn(),
  returning: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/db/client', () => ({
  db: mockDb,
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

describe('config.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllConfigs', () => {
    it('should return all configs', async () => {
      const mockConfigs = [
        { key: 'NAME', value: 'John Doe', updatedAt: new Date() },
        { key: 'EMAIL', value: 'john@example.com', updatedAt: new Date() },
      ];

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockResolvedValue(mockConfigs);

      const result = await getAllConfigs();

      expect(result).toEqual(mockConfigs);
    });
  });

  describe('getConfigByKey', () => {
    it('should return config when found', async () => {
      const mockConfig = {
        key: 'NAME',
        value: 'John Doe',
        updatedAt: new Date(),
      };

      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([mockConfig]);

      const result = await getConfigByKey('NAME');

      expect(result).toEqual(mockConfig);
    });

    it('should return null when config not found', async () => {
      mockDb.select.mockReturnValue(mockDb);
      mockDb.from.mockReturnValue(mockDb);
      mockDb.where.mockReturnValue(mockDb);
      mockDb.limit.mockResolvedValue([]);

      const result = await getConfigByKey('NONEXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('upsertConfig', () => {
    it('should insert or update config', async () => {
      const mockConfig = {
        key: 'NAME',
        value: 'Jane Doe',
        updatedAt: new Date(),
      };

      mockDb.insert.mockReturnValue(mockDb);
      mockDb.values.mockReturnValue(mockDb);
      mockDb.onConflictDoUpdate.mockReturnValue(mockDb);
      mockDb.returning.mockResolvedValue([mockConfig]);

      const result = await upsertConfig('NAME', 'Jane Doe');

      expect(result).toEqual(mockConfig);
    });
  });
});
