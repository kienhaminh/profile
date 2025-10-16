import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('Logger', () => {
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('info', () => {
    it('should log info messages with timestamp', () => {
      logger.info('Test message');

      expect(consoleInfoSpy).toHaveBeenCalledOnce();
      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0] as string);

      expect(loggedData.level).toBe('info');
      expect(loggedData.message).toBe('Test message');
      expect(loggedData.timestamp).toBeDefined();
    });

    it('should include context when provided', () => {
      logger.info('Test message', { userId: '123' });

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0] as string);

      expect(loggedData.context).toEqual({ userId: '123' });
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Warning message');

      expect(consoleWarnSpy).toHaveBeenCalledOnce();
      const loggedData = JSON.parse(consoleWarnSpy.mock.calls[0][0] as string);

      expect(loggedData.level).toBe('warn');
      expect(loggedData.message).toBe('Warning message');
    });
  });

  describe('error', () => {
    it('should log error messages with error object', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0] as string);

      expect(loggedData.level).toBe('error');
      expect(loggedData.message).toBe('Error occurred');
      expect(loggedData.error).toBeDefined();
      expect(loggedData.error.message).toBe('Test error');
      expect(loggedData.error.name).toBe('Error');
    });

    it('should include error stack trace', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0] as string);

      expect(loggedData.error.stack).toBeDefined();
    });
  });
});
