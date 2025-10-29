import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/blog/[id]/related/route';
import { NextRequest } from 'next/server';
import * as knowledgeGraph from '@/services/knowledge-graph';

// Mock the knowledge graph service
vi.mock('@/services/knowledge-graph', () => ({
  getRelatedBlogsById: vi.fn(),
}));

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Related Posts API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/blog/[id]/related', () => {
    it('should return related posts for a valid blog ID', async () => {
      const mockRelatedBlogs = [
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          slug: 'related-post-1',
          title: 'Related Post 1',
          score: 6,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          slug: 'related-post-2',
          title: 'Related Post 2',
          score: 3,
        },
      ];

      vi.mocked(knowledgeGraph.getRelatedBlogsById).mockResolvedValue(
        mockRelatedBlogs
      );

      const blogId = '550e8400-e29b-41d4-a716-446655440001';
      const request = new NextRequest(
        `http://localhost:3000/api/blog/${blogId}/related`
      );
      const params = Promise.resolve({ id: blogId });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        data: mockRelatedBlogs,
      });
      expect(knowledgeGraph.getRelatedBlogsById).toHaveBeenCalledWith(
        blogId,
        5
      );
    });

    it('should return empty array when no related posts found', async () => {
      vi.mocked(knowledgeGraph.getRelatedBlogsById).mockResolvedValue([]);

      const blogId = '550e8400-e29b-41d4-a716-446655440001';
      const request = new NextRequest(
        `http://localhost:3000/api/blog/${blogId}/related`
      );
      const params = Promise.resolve({ id: blogId });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        data: [],
      });
    });

    it('should respect limit query parameter', async () => {
      const mockRelatedBlogs = [
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          slug: 'related-post-1',
          title: 'Related Post 1',
          score: 6,
        },
      ];

      vi.mocked(knowledgeGraph.getRelatedBlogsById).mockResolvedValue(
        mockRelatedBlogs
      );

      const blogId = '550e8400-e29b-41d4-a716-446655440001';
      const request = new NextRequest(
        `http://localhost:3000/api/blog/${blogId}/related?limit=3`
      );
      const params = Promise.resolve({ id: blogId });

      const response = await GET(request, { params });

      expect(response.status).toBe(200);
      expect(knowledgeGraph.getRelatedBlogsById).toHaveBeenCalledWith(
        blogId,
        3
      );
    });

    it('should return 400 for invalid blog ID format', async () => {
      const invalidId = 'not-a-uuid';
      const request = new NextRequest(
        `http://localhost:3000/api/blog/${invalidId}/related`
      );
      const params = Promise.resolve({ id: invalidId });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Invalid blog ID format');
    });

    it('should return 400 for invalid limit parameter', async () => {
      const blogId = '550e8400-e29b-41d4-a716-446655440001';
      const request = new NextRequest(
        `http://localhost:3000/api/blog/${blogId}/related?limit=invalid`
      );
      const params = Promise.resolve({ id: blogId });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Invalid query parameters');
    });

    it('should return 400 for limit exceeding maximum', async () => {
      const blogId = '550e8400-e29b-41d4-a716-446655440001';
      const request = new NextRequest(
        `http://localhost:3000/api/blog/${blogId}/related?limit=25`
      );
      const params = Promise.resolve({ id: blogId });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should return 500 when service throws an error', async () => {
      vi.mocked(knowledgeGraph.getRelatedBlogsById).mockRejectedValue(
        new Error('Database connection failed')
      );

      const blogId = '550e8400-e29b-41d4-a716-446655440001';
      const request = new NextRequest(
        `http://localhost:3000/api/blog/${blogId}/related`
      );
      const params = Promise.resolve({ id: blogId });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
      expect(data.error).toBe('Failed to fetch related blogs');
    });

    it('should include cache headers in successful response', async () => {
      vi.mocked(knowledgeGraph.getRelatedBlogsById).mockResolvedValue([]);

      const blogId = '550e8400-e29b-41d4-a716-446655440001';
      const request = new NextRequest(
        `http://localhost:3000/api/blog/${blogId}/related`
      );
      const params = Promise.resolve({ id: blogId });

      const response = await GET(request, { params });

      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toBe(
        'public, s-maxage=300, stale-while-revalidate=600'
      );
    });

    it('should validate response schema', async () => {
      const invalidResponse = [
        {
          id: 'not-a-uuid', // Invalid UUID
          slug: 'test',
          title: 'Test',
          score: -1, // Negative score not allowed
        },
      ];

      vi.mocked(knowledgeGraph.getRelatedBlogsById).mockResolvedValue(
        invalidResponse as any
      );

      const blogId = '550e8400-e29b-41d4-a716-446655440001';
      const request = new NextRequest(
        `http://localhost:3000/api/blog/${blogId}/related`
      );
      const params = Promise.resolve({ id: blogId });

      const response = await GET(request, { params });

      // Should return 500 because validation will fail
      expect(response.status).toBe(500);
    });
  });
});
