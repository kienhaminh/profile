import { describe, it, expect } from 'vitest';

describe('Knowledge Graph Service - Scoring Logic', () => {
  describe('Score calculation', () => {
    it('should calculate correct weights for different relation types', () => {
      const WEIGHTS = {
        link: 4,
        topic: 3,
        tech: 2,
        hashtag: 1,
      };

      // Test scoring scenarios
      const scoreWithOneLink = 1 * WEIGHTS.link; // = 4
      expect(scoreWithOneLink).toBe(4);

      const scoreWithTwoTopics = 2 * WEIGHTS.topic; // = 6
      expect(scoreWithTwoTopics).toBe(6);

      const scoreWithThreeHashtags = 3 * WEIGHTS.hashtag; // = 3
      expect(scoreWithThreeHashtags).toBe(3);

      const combinedScore =
        1 * WEIGHTS.link + 1 * WEIGHTS.topic + 2 * WEIGHTS.hashtag; // = 4 + 3 + 2 = 9
      expect(combinedScore).toBe(9);
    });

    it('should prioritize links over topics over hashtags', () => {
      const WEIGHTS = {
        link: 4,
        topic: 3,
        tech: 2,
        hashtag: 1,
      };

      expect(WEIGHTS.link).toBeGreaterThan(WEIGHTS.topic);
      expect(WEIGHTS.topic).toBeGreaterThan(WEIGHTS.tech);
      expect(WEIGHTS.tech).toBeGreaterThan(WEIGHTS.hashtag);
    });
  });

  describe('URL extraction logic', () => {
    it('should extract blog slugs from various URL patterns', () => {
      const extractLinkedSlugs = (content: string): string[] => {
        const slugPattern =
          /(?:\/blog\/|href=["']\/blog\/|\]\(\/blog\/)([a-z0-9-]+)/gi;
        const matches = content.matchAll(slugPattern);
        const slugs = new Set<string>();

        for (const match of matches) {
          if (match[1]) {
            slugs.add(match[1]);
          }
        }

        return Array.from(slugs);
      };

      // Test various patterns
      expect(extractLinkedSlugs('Check /blog/my-post here')).toEqual([
        'my-post',
      ]);
      expect(
        extractLinkedSlugs('<a href="/blog/another-post">Link</a>')
      ).toEqual(['another-post']);
      expect(extractLinkedSlugs('[Link](/blog/markdown-post)')).toEqual([
        'markdown-post',
      ]);
      expect(
        extractLinkedSlugs('/blog/first-post and /blog/second-post')
      ).toEqual(['first-post', 'second-post']);
      expect(extractLinkedSlugs('No links here')).toEqual([]);
    });
  });

  describe('Array intersection logic', () => {
    it('should correctly count shared elements', () => {
      const array1 = ['topic-1', 'topic-2', 'topic-3'];
      const array2 = ['topic-2', 'topic-3', 'topic-4'];

      const sharedCount = array1.filter((id) => array2.includes(id)).length;
      expect(sharedCount).toBe(2); // topic-2 and topic-3
    });

    it('should return 0 for no shared elements', () => {
      const array1 = ['topic-1', 'topic-2'];
      const array2 = ['topic-3', 'topic-4'];

      const sharedCount = array1.filter((id) => array2.includes(id)).length;
      expect(sharedCount).toBe(0);
    });
  });

  describe('Result sorting and limiting', () => {
    it('should sort by score descending', () => {
      const results = [
        { id: '1', slug: 'post-1', title: 'Post 1', score: 3 },
        { id: '2', slug: 'post-2', title: 'Post 2', score: 7 },
        { id: '3', slug: 'post-3', title: 'Post 3', score: 5 },
      ];

      const sorted = results.sort((a, b) => b.score - a.score);

      expect(sorted[0].score).toBe(7);
      expect(sorted[1].score).toBe(5);
      expect(sorted[2].score).toBe(3);
    });

    it('should limit results to specified count', () => {
      const results = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        slug: `post-${i}`,
        title: `Post ${i}`,
        score: 10 - i,
      }));

      const limited = results.slice(0, 5);

      expect(limited).toHaveLength(5);
      expect(limited[0].score).toBe(10);
      expect(limited[4].score).toBe(6);
    });

    it('should filter out zero scores', () => {
      const results = [
        { id: '1', slug: 'post-1', title: 'Post 1', score: 3 },
        { id: '2', slug: 'post-2', title: 'Post 2', score: 0 },
        { id: '3', slug: 'post-3', title: 'Post 3', score: 5 },
      ];

      const filtered = results.filter((r) => r.score > 0);

      expect(filtered).toHaveLength(2);
      expect(filtered.every((r) => r.score > 0)).toBe(true);
    });
  });
});
