export const BLOG_TOPICS = {
  ALL: '',
  AI: 'AI',
  BACKEND: 'Backend',
  CAREER: 'Career',
  FRONTEND: 'Frontend',
  DEVOPS: 'DevOps',
} as const;

export type BlogTopic = (typeof BLOG_TOPICS)[keyof typeof BLOG_TOPICS];

export const BLOG_TOPIC_LABELS: Record<string, string> = {
  [BLOG_TOPICS.ALL]: 'All',
  [BLOG_TOPICS.AI]: 'AI',
  [BLOG_TOPICS.BACKEND]: 'Backend',
  [BLOG_TOPICS.CAREER]: 'Career',
  [BLOG_TOPICS.FRONTEND]: 'Frontend',
  [BLOG_TOPICS.DEVOPS]: 'DevOps',
};

export const BLOG_CONFIG = {
  POSTS_PER_PAGE: 10,
  RELATED_POSTS_LIMIT: 5,
  EXCERPT_MAX_LENGTH: 200,
} as const;



