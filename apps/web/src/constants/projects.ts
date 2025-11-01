import type { ProjectStatus } from '@/types/enums';

// Status filter constants
export const PROJECT_STATUS_FILTERS = {
  PUBLISHED: 'PUBLISHED' as ProjectStatus,
} as const;

// Status badge styles
export const STATUS_BADGE_STYLES = {
  PUBLISHED: 'bg-green-100 text-green-800',
  DRAFT: 'bg-yellow-100 text-yellow-800',
} as const;

// Tag styling
export const TAG_STYLES = {
  DEFAULT: 'px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded',
} as const;

// Button labels
export const PROJECT_BUTTON_LABELS = {
  LIVE_DEMO: 'Live Demo',
  VIEW_CODE: 'View Code',
} as const;

// Navigation labels
export const NAVIGATION_LABELS = {
  PROJECTS: 'Projects',
  BLOG: 'Blog',
  KIEN_HA: 'Kien Ha',
} as const;

// Page content
export const PAGE_CONTENT = {
  TITLE: 'My Projects',
  SUBTITLE: 'A collection of my recent work and side projects',
  NO_PROJECTS: 'No projects found.',
  CREATE_FIRST_PROJECT: 'Create your first project',
  CONTACT_INFO: 'Contact Information',
  CONNECT_WITH_ME: 'Connect With Me',
  QUICK_LINKS: 'Quick Links',
  VIEW_MY_PROJECTS: 'View My Projects',
  READ_MY_BLOG: 'Read My Blog',
  GET_IN_TOUCH: 'Get In Touch',
  ALL_RIGHTS_RESERVED: 'All rights reserved.',
} as const;

// Footer sections
export const FOOTER_SECTIONS = {
  CONTACT: 'contact',
  SOCIAL: 'social',
  QUICK_LINKS: 'quick-links',
} as const;
