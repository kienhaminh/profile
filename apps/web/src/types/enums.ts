export const POST_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type PostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS];

export const POST_STATUS_VALUES = Object.values(POST_STATUS);

export const PROJECT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
} as const;

export type ProjectStatus =
  (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const PROJECT_STATUS_VALUES = Object.values(PROJECT_STATUS);
