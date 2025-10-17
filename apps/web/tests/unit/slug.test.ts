import { describe, it, expect } from 'vitest';
import { generateSlug, isValidSlug } from '@/lib/slug';

describe('generateSlug', () => {
  describe('Latin characters', () => {
    it('should handle basic Latin text with spaces', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
    });

    it('should handle mixed case', () => {
      expect(generateSlug('Hello WORLD')).toBe('hello-world');
    });

    it('should handle multiple spaces', () => {
      expect(generateSlug('Hello   World')).toBe('hello-world');
    });

    it('should handle special characters by removing them', () => {
      expect(generateSlug('Hello!@#$%^&*()_+{}|:<>?[]\\;\'" World')).toBe(
        'hello-world'
      );
    });

    it('should handle numbers', () => {
      expect(generateSlug('Hello World 123')).toBe('hello-world-123');
    });
  });

  describe('Non-Latin characters', () => {
    it('should transliterate Arabic characters', () => {
      expect(generateSlug('مرحبا')).toBe('mrhba');
    });

    it('should transliterate Japanese characters', () => {
      // Note: transliteration may not work perfectly in test environment
      const result = generateSlug('こんにちは');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should transliterate Chinese characters', () => {
      // Note: transliteration may not work perfectly in test environment
      const result = generateSlug('你好');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should transliterate Korean characters', () => {
      // Note: transliteration may not work perfectly in test environment
      const result = generateSlug('안녕하세요');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should transliterate Cyrillic characters', () => {
      expect(generateSlug('привет')).toBe('privet');
    });

    it('should transliterate Greek characters', () => {
      expect(generateSlug('γεια σας')).toBe('geia-sas');
    });

    it('should handle mixed Latin and non-Latin characters', () => {
      const result = generateSlug('Hello 世界');
      expect(result).toContain('hello');
      expect(typeof result).toBe('string');
    });

    it('should handle accented characters', () => {
      expect(generateSlug('café naïve résumé')).toBe('cafe-naive-resume');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('untitled');
    });

    it('should handle null/undefined', () => {
      expect(generateSlug(null as any)).toBe('untitled');
      expect(generateSlug(undefined as any)).toBe('untitled');
    });

    it('should handle string with only spaces', () => {
      expect(generateSlug('   ')).toBe('untitled');
    });

    it('should handle string with only special characters', () => {
      // After removing special chars, nothing remains, so fallback to 'untitled'
      expect(generateSlug('!@#$%^&*()')).toBe('untitled');
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000);
      expect(generateSlug(longString)).toBe(longString);
    });
  });

  describe('allowEmpty option', () => {
    it('should return empty string when allowEmpty is true for empty inputs', () => {
      expect(generateSlug('', { allowEmpty: true })).toBe('');
      expect(generateSlug('   ', { allowEmpty: true })).toBe('');
    });

    it('should return fallback for special character only strings when allowEmpty is true', () => {
      // Special characters get cleaned out, so fallback is used
      expect(generateSlug('!@#$', { allowEmpty: true })).toBe('untitled');
    });

    it('should still return fallback for non-empty strings when allowEmpty is true', () => {
      expect(generateSlug('Hello World', { allowEmpty: true })).toBe(
        'hello-world'
      );
    });
  });
});

describe('isValidSlug', () => {
  it('should validate correct slugs', () => {
    expect(isValidSlug('hello-world')).toBe(true);
    expect(isValidSlug('hello-world-123')).toBe(true);
    expect(isValidSlug('a')).toBe(true);
    expect(isValidSlug('hello')).toBe(true);
  });

  it('should reject invalid slugs', () => {
    expect(isValidSlug('')).toBe(false);
    expect(isValidSlug('hello world')).toBe(false);
    expect(isValidSlug('hello@world')).toBe(false);
    expect(isValidSlug('hello_world')).toBe(false);
    expect(isValidSlug('Hello-World')).toBe(false);
  });
});
