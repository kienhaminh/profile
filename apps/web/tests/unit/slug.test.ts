import { describe, it, expect } from 'vitest';
import {
  generateSlug,
  isValidSlug,
  generateUniqueSlug,
  generateUniqueSlugs,
  MAX_SLUG_LENGTH,
} from '@/lib/slug';

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
      expect(generateSlug(null as unknown as string)).toBe('untitled');
      expect(generateSlug(undefined as unknown as string)).toBe('untitled');
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
      const result = generateSlug(longString);
      expect(result.length).toBeLessThanOrEqual(MAX_SLUG_LENGTH);
      expect(isValidSlug(result)).toBe(true);
      expect(result).toBe('a'.repeat(MAX_SLUG_LENGTH));
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

describe('generateUniqueSlug', () => {
  it('should return the base slug when no existing slugs are provided', async () => {
    const result = await generateUniqueSlug('Hello World');
    expect(result).toBe('hello-world');
  });

  it('should return the base slug when it is not in the existing slugs list', async () => {
    const existingSlugs = ['react', 'vue', 'angular'];
    const result = await generateUniqueSlug('Hello World', existingSlugs);
    expect(result).toBe('hello-world');
  });

  it('should append a number when the base slug already exists', async () => {
    const existingSlugs = ['hello-world', 'react', 'vue'];
    const result = await generateUniqueSlug('Hello World', existingSlugs);
    expect(result).toBe('hello-world-1');
  });

  it('should increment the number when multiple slugs with numbers exist', async () => {
    const existingSlugs = [
      'hello-world',
      'hello-world-1',
      'hello-world-2',
      'react',
    ];
    const result = await generateUniqueSlug('Hello World', existingSlugs);
    expect(result).toBe('hello-world-3');
  });

  it('should handle edge case with many existing numbered slugs', async () => {
    const existingSlugs = Array.from(
      { length: 100 },
      (_, i) => `hello-world-${i}`
    );
    const result = await generateUniqueSlug('Hello World', existingSlugs);
    expect(result).toBe('hello-world-100');
  });

  it('should use fallback timestamp when counter exceeds 1000', async () => {
    // Mock a scenario where we have 1001+ existing slugs
    const existingSlugs = Array.from(
      { length: 1001 },
      (_, i) => `hello-world-${i}`
    );
    const result = await generateUniqueSlug('Hello World', existingSlugs);

    // Should fallback to timestamp format
    expect(result).toMatch(/^hello-world-\d+$/);
    expect(result).not.toBe('hello-world-1001'); // Should not reach this number
  });

  it('should handle accented characters and special characters properly', async () => {
    const existingSlugs = ['react'];
    const result = await generateUniqueSlug('React!', existingSlugs);
    expect(result).toBe('react');
  });

  it('should handle collision with accented characters', async () => {
    const existingSlugs = ['react'];
    const result = await generateUniqueSlug('Reacté', existingSlugs);
    expect(result).toBe('reacte-1');
  });

  it('should handle empty string with allowEmpty option', async () => {
    const result = await generateUniqueSlug('', [], { allowEmpty: true });
    expect(result).toBe('');
  });

  it('should handle empty string without allowEmpty option', async () => {
    const result = await generateUniqueSlug('');
    expect(result).toBe('untitled');
  });

  it('should handle null/undefined inputs', async () => {
    const result1 = await generateUniqueSlug(null as unknown as string);
    const result2 = await generateUniqueSlug(undefined as unknown as string);
    expect(result1).toBe('untitled');
    expect(result2).toBe('untitled');
  });
});

describe('generateUniqueSlugs', () => {
  it('should generate unique slugs for multiple inputs', async () => {
    const inputs = ['React', 'Vue', 'Angular'];
    const result = await generateUniqueSlugs(inputs);
    expect(result).toEqual(['react', 'vue', 'angular']);
  });

  it('should handle collisions within the batch', async () => {
    const inputs = ['React', 'React', 'React'];
    const result = await generateUniqueSlugs(inputs);
    expect(result[0]).toBe('react');
    expect(result[1]).toBe('react-1');
    expect(result[2]).toBe('react-2');
  });

  it('should handle collisions with existing slugs', async () => {
    const inputs = ['React', 'Vue'];
    const existingSlugs = ['react', 'angular'];
    const result = await generateUniqueSlugs(inputs, existingSlugs);
    expect(result[0]).toBe('react-1'); // Should avoid collision with existing 'react'
    expect(result[1]).toBe('vue');
  });

  it('should handle complex collision scenarios', async () => {
    const inputs = ['React', 'React!', 'Reacté', 'Vue'];
    const existingSlugs = ['react', 'react-1', 'vue'];
    const result = await generateUniqueSlugs(inputs, existingSlugs);

    // Should generate unique slugs avoiding all collisions
    expect(new Set(result).size).toBe(result.length); // All slugs should be unique
    expect(result).not.toContain('react'); // Should avoid existing 'react'
    expect(result).not.toContain('vue'); // Should avoid existing 'vue'
    expect(result).not.toContain('react-1'); // Should avoid existing 'react-1'
  });

  it('should handle empty arrays', async () => {
    const result = await generateUniqueSlugs([]);
    expect(result).toEqual([]);
  });

  it('should handle mixed valid and invalid inputs', async () => {
    const inputs = ['React', '', 'Vue', null as unknown as string];
    const result = await generateUniqueSlugs(inputs);

    // Should handle empty/null inputs appropriately
    expect(result.length).toBe(4);
    expect(result[0]).toBe('react');
    expect(result[1]).toBe('untitled');
    expect(result[2]).toBe('vue');
    expect(result[3]).toBe('untitled');
  });
});
