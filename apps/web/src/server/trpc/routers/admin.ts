import { z } from 'zod';
import { router, adminProcedure } from '../trpc';
import { db } from '@/db/client';
import {
  posts,
  projects,
  tags,
  postTags,
  projectTags,
  shortlinks,
  visitorSessions,
  pageVisits,
  favorites,
  favoriteTags,
  favoriteCategories,
} from '@/db/schema';
import {
  sql,
  count,
  desc,
  gte,
  eq,
  or,
  ilike,
  inArray,
  and,
} from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getAllProjects } from '@/services/projects';
import { getAllPosts } from '@/services/posts';
import { POST_STATUS } from '@/types/enums';

export const adminRouter = router({
  // --- Dashboard Stats ---
  getDashboardStats: adminProcedure.query(async () => {
    // Posts by month (last 12 months)
    const postsOverTime = await db.execute(sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count,
        status
      FROM ${posts}
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month, status
      ORDER BY month DESC
    `);

    // Tags distribution for posts
    const topicsDistribution = await db.execute(sql`
      SELECT 
        t.label as name,
        COUNT(pt.post_id) as post_count
      FROM ${tags} t
      LEFT JOIN ${postTags} pt ON t.id = pt.tag_id
      GROUP BY t.id, t.label
      ORDER BY post_count DESC
      LIMIT 10
    `);

    // Tags distribution for projects
    const hashtagsDistribution = await db.execute(sql`
      SELECT 
        t.label as name,
        COUNT(pt.post_id) as post_count,
        COUNT(prt.project_id) as project_count
      FROM ${tags} t
      LEFT JOIN ${postTags} pt ON t.id = pt.tag_id
      LEFT JOIN ${projectTags} prt ON t.id = prt.tag_id
      GROUP BY t.id, t.label
      ORDER BY (COUNT(pt.post_id) + COUNT(prt.project_id)) DESC
      LIMIT 10
    `);

    // Projects by status
    const projectsStats = await db.execute(sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM ${projects}
      GROUP BY status
    `);

    // Recent activity summary
    const recentActivityCounts = await db.execute(sql`
      SELECT
        (SELECT COUNT(*) FROM ${posts} WHERE created_at >= NOW() - INTERVAL '7 days') as posts_this_week,
        (SELECT COUNT(*) FROM ${projects} WHERE created_at >= NOW() - INTERVAL '7 days') as projects_this_week,
        (SELECT COUNT(*) FROM ${posts}) as total_posts,
        (SELECT COUNT(*) FROM ${projects}) as total_projects,
        (SELECT COUNT(*) FROM ${tags}) as total_tags
    `);

    const activityData = recentActivityCounts.rows[0];

    return {
      postsOverTime: postsOverTime.rows,
      topicsDistribution: topicsDistribution.rows,
      hashtagsDistribution: hashtagsDistribution.rows,
      projectsStats: projectsStats.rows,
      recentActivity: {
        ...activityData,
        total_topics: activityData.total_tags,
        total_hashtags: activityData.total_tags,
      },
    };
  }),

  // --- Projects ---
  getProjects: adminProcedure
    .input(
      z
        .object({
          status: z.string().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      // getAllProjects returns { data: Project[], pagination: ... }
      // We'll fetch all by passing high limit if needed, or just let it default and handle pagination later?
      // For admin table, we usually want all or paginated.
      // The hook `use-admin-projects.ts` uses `useAdminProjects` which likely expects an array or the full object.
      // Let's fetch all for now to replicate likely filtered behavior.

      const allProjectsResult = await getAllProjects(undefined, {
        limit: 1000,
      });
      const allProjects = allProjectsResult.data;

      // Manual filtering
      let filtered = allProjects;
      if (input?.status && input.status !== 'all') {
        filtered = filtered.filter((p) => p.status === input.status);
      }
      if (input?.search) {
        const lowerSearch = input.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(lowerSearch) ||
            p.description?.toLowerCase().includes(lowerSearch)
        );
      }

      return { items: filtered };
    }),

  // --- Shortlinks ---
  getShortlinks: adminProcedure.query(async () => {
    return await db
      .select()
      .from(shortlinks)
      .orderBy(desc(shortlinks.createdAt));
  }),

  createShortlink: adminProcedure
    .input(
      z.object({
        slug: z.string().optional(),
        destinationUrl: z.string().url(),
        title: z.string().optional(),
        password: z.string().optional(),
        expiresAt: z.string().optional(), // Date string
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const finalSlug = input.slug || nanoid(6);

      const existing = await db
        .select()
        .from(shortlinks)
        .where(eq(shortlinks.slug, finalSlug))
        .limit(1);

      if (existing.length > 0) {
        throw new Error('Slug already exists');
      }

      const [newShortlink] = await db
        .insert(shortlinks)
        .values({
          slug: finalSlug,
          destinationUrl: input.destinationUrl,
          title: input.title,
          password: input.password,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          isActive: input.isActive,
          clickCount: 0,
        })
        .returning();

      return { success: true, shortlink: newShortlink };
    }),

  // --- Analytics ---
  getAnalytics: adminProcedure
    .input(
      z.object({
        range: z.enum(['24h', '7d', '30d']).default('24h'),
      })
    )
    .query(async ({ input }) => {
      const { range } = input;
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      let startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      if (range === '7d') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
      } else if (range === '30d') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
      }

      // Overview stats
      const [overviewResult] = await db
        .select({
          totalSessions: count(visitorSessions.id),
          avgDuration: sql<number>`COALESCE(AVG(${visitorSessions.totalDuration}), 0)`,
        })
        .from(visitorSessions)
        .where(gte(visitorSessions.startedAt, startDate));

      // Unique visitors
      const [uniqueVisitorsResult] = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${visitorSessions.visitorId})`,
        })
        .from(visitorSessions)
        .where(gte(visitorSessions.startedAt, startDate));

      // Page views
      const [pageViewsResult] = await db
        .select({ count: count(pageVisits.id) })
        .from(pageVisits)
        .where(gte(pageVisits.enteredAt, startDate));

      // Today's stats
      const [todayResult] = await db
        .select({
          sessions: count(visitorSessions.id),
          visitors: sql<number>`COUNT(DISTINCT ${visitorSessions.visitorId})`,
        })
        .from(visitorSessions)
        .where(gte(visitorSessions.startedAt, startOfToday));

      const [todayPageViews] = await db
        .select({ count: count(pageVisits.id) })
        .from(pageVisits)
        .where(gte(pageVisits.enteredAt, startOfToday));

      // Popular pages
      const popularPages = await db
        .select({
          pagePath: pageVisits.pagePath,
          pageTitle: pageVisits.pageTitle,
          views: count(pageVisits.id),
          avgDuration: sql<number>`COALESCE(AVG(${pageVisits.duration}), 0)`,
        })
        .from(pageVisits)
        .where(gte(pageVisits.enteredAt, startDate))
        .groupBy(pageVisits.pagePath, pageVisits.pageTitle)
        .orderBy(desc(count(pageVisits.id)))
        .limit(10);

      // Activity data
      let activityData;
      if (range === '24h') {
        activityData = await db
          .select({
            label: sql<string>`to_char(${visitorSessions.startedAt}, 'HH24:00')`,
            value: sql<number>`COUNT(DISTINCT ${visitorSessions.visitorId})`,
          })
          .from(visitorSessions)
          .where(gte(visitorSessions.startedAt, startDate))
          .groupBy(sql`to_char(${visitorSessions.startedAt}, 'HH24:00')`)
          .orderBy(sql`to_char(${visitorSessions.startedAt}, 'HH24:00')`);
      } else {
        activityData = await db
          .select({
            label: sql<string>`to_char(${visitorSessions.startedAt}, 'Mon DD')`,
            value: sql<number>`COUNT(DISTINCT ${visitorSessions.visitorId})`,
          })
          .from(visitorSessions)
          .where(gte(visitorSessions.startedAt, startDate))
          .groupBy(
            sql`to_char(${visitorSessions.startedAt}, 'Mon DD')`,
            sql`DATE(${visitorSessions.startedAt})`
          )
          .orderBy(sql`DATE(${visitorSessions.startedAt})`);
      }

      // Top sources
      const topSources = await db
        .select({
          source: visitorSessions.referrer,
          visitors: sql<number>`COUNT(DISTINCT ${visitorSessions.visitorId})`,
        })
        .from(visitorSessions)
        .where(
          and(
            gte(visitorSessions.startedAt, startDate),
            sql`${visitorSessions.referrer} IS NOT NULL`
          )
        )
        .groupBy(visitorSessions.referrer)
        .orderBy(
          desc(sql<number>`COUNT(DISTINCT ${visitorSessions.visitorId})`)
        )
        .limit(5);

      // Top countries
      const topCountries = await db
        .select({
          country: visitorSessions.country,
          visitors: sql<number>`COUNT(DISTINCT ${visitorSessions.visitorId})`,
        })
        .from(visitorSessions)
        .where(gte(visitorSessions.startedAt, startDate))
        .groupBy(visitorSessions.country)
        .orderBy(
          desc(sql<number>`COUNT(DISTINCT ${visitorSessions.visitorId})`)
        )
        .limit(5);

      // Active visitors
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const [activeVisitorsResult] = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${visitorSessions.visitorId})`,
        })
        .from(visitorSessions)
        .where(gte(visitorSessions.startedAt, thirtyMinutesAgo));

      const totalCountryVisitors = topCountries.reduce(
        (sum, c) => sum + Number(c.visitors),
        0
      );

      return {
        overview: {
          totalVisitors: Number(uniqueVisitorsResult?.count || 0),
          totalSessions: Number(overviewResult?.totalSessions || 0),
          totalPageViews: Number(pageViewsResult?.count || 0),
          avgSessionDuration: Math.round(
            Number(overviewResult?.avgDuration || 0)
          ),
          bounceRate: 0,
        },
        today: {
          visitors: Number(todayResult?.visitors || 0),
          sessions: Number(todayResult?.sessions || 0),
          pageViews: Number(todayPageViews?.count || 0),
        },
        thisWeek: {
          visitors: Number(todayResult?.visitors || 0),
          sessions: Number(todayResult?.sessions || 0),
          pageViews: Number(todayPageViews?.count || 0),
        },
        popularPages: popularPages.map((p) => ({
          pagePath: p.pagePath,
          pageTitle: p.pageTitle,
          views: Number(p.views),
          avgDuration: Math.round(Number(p.avgDuration)),
        })),
        activity: activityData.map((v) => ({
          label: v.label,
          value: Number(v.value || 0),
        })),
        topSources: topSources.map((s) => ({
          source: s.source || 'Direct',
          visitors: Number(s.visitors),
        })),
        topCountries: topCountries.map((c) => ({
          country: c.country || 'Unknown',
          visitors: Number(c.visitors),
          percentage:
            totalCountryVisitors > 0
              ? Math.round((Number(c.visitors) / totalCountryVisitors) * 100)
              : 0,
        })),
        activeVisitors: Number(activeVisitorsResult?.count || 0),
      };
    }),

  // --- Favorites ---
  getFavorites: adminProcedure
    .input(
      z
        .object({
          categoryId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      // Get all categories
      const categories = await db
        .select()
        .from(favoriteCategories)
        .orderBy(desc(favoriteCategories.createdAt));

      // Get favorites
      let favoritesQuery = db
        .select()
        .from(favorites)
        .orderBy(desc(favorites.createdAt));

      const favoritesData = input?.categoryId
        ? await db
            .select()
            .from(favorites)
            .where(eq(favorites.categoryId, input.categoryId))
            .orderBy(desc(favorites.createdAt))
        : await favoritesQuery;

      // Get tags
      const favoriteIds = favoritesData.map((f) => f.id);
      const favoriteTagsData =
        favoriteIds.length > 0
          ? await db
              .select({
                favoriteId: favoriteTags.favoriteId,
                tagId: favoriteTags.tagId,
              })
              .from(favoriteTags)
              .where(inArray(favoriteTags.favoriteId, favoriteIds))
          : [];

      const allTags = await db.select().from(tags);
      const tagsMap = new Map(allTags.map((t) => [t.id, t]));
      const categoriesMap = new Map(categories.map((c) => [c.id, c]));

      const favoritesWithData = favoritesData.map((favorite) => {
        const category = categoriesMap.get(favorite.categoryId);
        const favTagIds = favoriteTagsData
          .filter((ft) => ft.favoriteId === favorite.id)
          .map((ft) => ft.tagId);
        const favTags = favTagIds
          .map((tagId) => tagsMap.get(tagId))
          .filter(Boolean);

        return {
          ...favorite,
          category: category!,
          tags: favTags,
        };
      });

      return {
        favorites: favoritesWithData,
        categories,
        tags: allTags,
      };
    }),

  // --- Posts ---
  getPosts: adminProcedure
    .input(
      z
        .object({
          status: z
            .enum([
              POST_STATUS.PUBLISHED,
              POST_STATUS.DRAFT,
              POST_STATUS.ARCHIVED,
            ])
            .or(z.literal('all'))
            .optional(),
          search: z.string().optional(),
          page: z.number().default(1),
          limit: z.number().default(10),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const status =
        input?.status && input.status !== 'all'
          ? (input.status as any)
          : undefined;

      // Use service logic
      return await getAllPosts(
        status,
        { page: input?.page, limit: input?.limit },
        input?.search
      );
    }),
});
