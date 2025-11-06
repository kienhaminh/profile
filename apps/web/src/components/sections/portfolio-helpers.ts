import type { Project } from '@/types/project';

export function filterProjectsByTag(
  projects: Project[],
  tagSlug: string | null
): Project[] {
  if (!Array.isArray(projects) || projects.length === 0) return [];
  if (tagSlug === null) return projects;
  return projects.filter((p) => p.tags.some((t) => t.slug === tagSlug));
}



