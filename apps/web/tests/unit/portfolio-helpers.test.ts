import { describe, it, expect } from 'vitest';
import { filterProjectsByTag } from '@/components/sections/portfolio-helpers';

function makeProject(
  id: string,
  tags: { id: string; slug: string; label: string }[]
) {
  return {
    id,
    title: `P-${id}`,
    slug: `p-${id}`,
    status: 'PUBLISHED',
    description: 'desc',
    images: [],
    githubUrl: null,
    liveUrl: null,
    startDate: null,
    endDate: null,
    isOngoing: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags,
  } as const;
}

describe('filterProjectsByTag', () => {
  const projects = [
    makeProject('1', [
      { id: 't1', slug: 'design', label: 'Design' },
      { id: 't2', slug: 'web', label: 'Web' },
    ]),
    makeProject('2', [{ id: 't3', slug: 'mobile', label: 'Mobile' }]),
    makeProject('3', [{ id: 't2', slug: 'web', label: 'Web' }]),
  ];

  it('returns all when tagSlug is null', () => {
    expect(filterProjectsByTag(projects as any, null)).toHaveLength(3);
  });

  it('filters by exact tag slug', () => {
    const webOnly = filterProjectsByTag(projects as any, 'web');
    expect(webOnly.map((p) => p.id)).toEqual(['1', '3']);
  });

  it('returns empty for unknown tag', () => {
    expect(filterProjectsByTag(projects as any, 'unknown')).toHaveLength(0);
  });

  it('handles empty input safely', () => {
    expect(filterProjectsByTag([], null)).toEqual([]);
    expect(filterProjectsByTag([], 'web')).toEqual([]);
  });
});



