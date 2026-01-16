/**
 * Admin Hooks Barrel Export
 *
 * Re-exports all admin SWR hooks for convenient importing.
 */

export { useAdminPosts } from './use-admin-posts';
export { useAdminStats } from './use-admin-stats';
export { useAdminProjects } from './use-admin-projects';
export { useAdminAnalytics } from './use-admin-analytics';
export {
  useAdminFavorites,
  type FavoriteCategory,
  type FavoriteWithCategory,
  type Tag,
} from './use-admin-favorites';
export { useAdminShortlinks, type Shortlink } from './use-admin-shortlinks';
