import { router } from '../init';
import { projectRouter } from './projects';
import { blogRouter } from './blog';
import { technologyRouter } from './technologies';
import { hashtagRouter } from './hashtags';
import { topicRouter } from './topics';
import { adminPostsRouter } from './adminPosts';

const adminRouter = router({
  posts: adminPostsRouter,
});

export const appRouter = router({
  projects: projectRouter,
  blog: blogRouter,
  technologies: technologyRouter,
  hashtags: hashtagRouter,
  topics: topicRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
