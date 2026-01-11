/**
 * Admin Analytics API Route
 *
 * GET /api/admin/analytics - Get analytics stats
 *
 * Replaces the getAnalyticsStats server action for client-side fetching.
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractAdminTokenFromHeaders, verifyAdminToken } from '@/lib/auth';
import { db } from '@/db/client';
import { visitorSessions, pageVisits } from '@/db/schema';
import { gte, desc, sql, and, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const token = extractAdminTokenFromHeaders(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      verifyAdminToken(token);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get range from query params
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') || '24h') as '24h' | '7d' | '30d';

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    // Calculate start date based on range
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
      .orderBy(desc(sql<number>`COUNT(DISTINCT ${visitorSessions.visitorId})`))
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
      .orderBy(desc(sql<number>`COUNT(DISTINCT ${visitorSessions.visitorId})`))
      .limit(5);

    // Active visitors (last 30 min)
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

    return NextResponse.json({
      overview: {
        totalVisitors: Number(uniqueVisitorsResult?.count || 0),
        totalSessions: Number(overviewResult?.totalSessions || 0),
        totalPageViews: Number(pageViewsResult?.count || 0),
        avgSessionDuration: Math.round(
          Number(overviewResult?.avgDuration || 0)
        ),
        bounceRate: 0, // Simplified for this version
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
      visitorsOverTime: [], // TODO: Implement if needed
      activity: activityData.map((v) => ({
        label: v.label,
        value: Number(v.value || 0),
      })),
      deviceDistribution: [], // TODO: Implement if needed
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
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
