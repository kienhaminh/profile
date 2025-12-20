'use server';

import { db } from '@/db/client';
import { visitorSessions, pageVisits } from '@/db/schema';
import { eq, desc, sql, gte, and, count } from 'drizzle-orm';
import { logger } from '@/lib/logger';

// Types
export interface VisitorSession {
  id: string;
  visitorId: string;
  userAgent: string | null;
  referrer: string | null;
  device: string | null;
  country: string | null;
  startedAt: Date;
  endedAt: Date | null;
  totalDuration: number | null;
  createdAt: Date;
}

export interface PageVisit {
  id: string;
  sessionId: string;
  pagePath: string;
  pageTitle: string | null;
  enteredAt: Date;
  exitedAt: Date | null;
  duration: number | null;
  scrollDepth: number | null;
}

export interface SessionMetadata {
  userAgent?: string;
  referrer?: string;
  device?: 'desktop' | 'tablet' | 'mobile';
}

// Session Management

/**
 * Create a new visitor session
 */
export async function createVisitorSession(
  visitorId: string,
  metadata?: SessionMetadata
): Promise<VisitorSession> {
  try {
    const [session] = await db
      .insert(visitorSessions)
      .values({
        visitorId,
        userAgent: metadata?.userAgent || null,
        referrer: metadata?.referrer || null,
        device: metadata?.device || null,
      })
      .returning();

    logger.info('Created visitor session', {
      sessionId: session.id,
      visitorId,
    });
    return session;
  } catch (error) {
    logger.error('Error creating visitor session', { error, visitorId });
    throw new Error('Failed to create visitor session');
  }
}

/**
 * Update session end time and calculate total duration
 */
export async function endVisitorSession(sessionId: string): Promise<void> {
  try {
    const now = new Date();

    // Get session start time
    const [session] = await db
      .select({ startedAt: visitorSessions.startedAt })
      .from(visitorSessions)
      .where(eq(visitorSessions.id, sessionId))
      .limit(1);

    if (!session) {
      logger.warn('Session not found for ending', { sessionId });
      return;
    }

    const durationSeconds = Math.floor(
      (now.getTime() - session.startedAt.getTime()) / 1000
    );

    await db
      .update(visitorSessions)
      .set({
        endedAt: now,
        totalDuration: durationSeconds,
      })
      .where(eq(visitorSessions.id, sessionId));

    logger.info('Ended visitor session', { sessionId, durationSeconds });
  } catch (error) {
    logger.error('Error ending visitor session', { error, sessionId });
  }
}

/**
 * Get active session for a visitor (within last 30 minutes)
 */
export async function getActiveSession(
  visitorId: string
): Promise<VisitorSession | null> {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const [session] = await db
      .select()
      .from(visitorSessions)
      .where(
        and(
          eq(visitorSessions.visitorId, visitorId),
          gte(visitorSessions.startedAt, thirtyMinutesAgo)
        )
      )
      .orderBy(desc(visitorSessions.startedAt))
      .limit(1);

    return session || null;
  } catch (error) {
    logger.error('Error getting active session', { error, visitorId });
    return null;
  }
}

// Page Visit Management

/**
 * Record a page visit entry
 */
export async function recordPageEntry(
  sessionId: string,
  pagePath: string,
  pageTitle?: string
): Promise<PageVisit> {
  try {
    const [visit] = await db
      .insert(pageVisits)
      .values({
        sessionId,
        pagePath,
        pageTitle: pageTitle || null,
      })
      .returning();

    logger.info('Recorded page entry', { sessionId, pagePath });
    return visit;
  } catch (error) {
    logger.error('Error recording page entry', { error, sessionId, pagePath });
    throw new Error('Failed to record page entry');
  }
}

/**
 * Update page visit with exit time and duration
 */
export async function recordPageExit(
  pageVisitId: string,
  scrollDepth?: number
): Promise<void> {
  try {
    const now = new Date();

    // Get entry time
    const [visit] = await db
      .select({ enteredAt: pageVisits.enteredAt })
      .from(pageVisits)
      .where(eq(pageVisits.id, pageVisitId))
      .limit(1);

    if (!visit) {
      logger.warn('Page visit not found for exit', { pageVisitId });
      return;
    }

    const durationSeconds = Math.floor(
      (now.getTime() - visit.enteredAt.getTime()) / 1000
    );

    await db
      .update(pageVisits)
      .set({
        exitedAt: now,
        duration: durationSeconds,
        scrollDepth: scrollDepth ?? null,
      })
      .where(eq(pageVisits.id, pageVisitId));

    logger.info('Recorded page exit', { pageVisitId, durationSeconds });
  } catch (error) {
    logger.error('Error recording page exit', { error, pageVisitId });
  }
}

// Analytics Queries

export interface AnalyticsStats {
  overview: {
    totalVisitors: number;
    totalSessions: number;
    totalPageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  today: {
    visitors: number;
    sessions: number;
    pageViews: number;
  };
  thisWeek: {
    visitors: number;
    sessions: number;
    pageViews: number;
  };
  popularPages: Array<{
    pagePath: string;
    pageTitle: string | null;
    views: number;
    avgDuration: number;
  }>;
  visitorsOverTime: Array<{
    date: string;
    visitors: number;
    sessions: number;
    pageViews: number;
  }>;
  deviceDistribution: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * Get comprehensive analytics stats
 */
export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  try {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Overview stats
    const [overviewResult] = await db
      .select({
        totalSessions: count(visitorSessions.id),
        avgDuration: sql<number>`COALESCE(AVG(${visitorSessions.totalDuration}), 0)`,
      })
      .from(visitorSessions);

    // Count unique visitors
    const [uniqueVisitorsResult] = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${visitorSessions.visitorId})`,
      })
      .from(visitorSessions);

    // Total page views
    const [pageViewsResult] = await db
      .select({ count: count(pageVisits.id) })
      .from(pageVisits);

    // Bounce rate (sessions with only 1 page view)
    const bouncedSessions = await db
      .select({
        sessionId: pageVisits.sessionId,
        pageCount: count(pageVisits.id),
      })
      .from(pageVisits)
      .groupBy(pageVisits.sessionId);

    const bounceCount = bouncedSessions.filter(
      (s) => Number(s.pageCount) === 1
    ).length;
    const bounceRate =
      bouncedSessions.length > 0
        ? (bounceCount / bouncedSessions.length) * 100
        : 0;

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

    // This week's stats
    const [weekResult] = await db
      .select({
        sessions: count(visitorSessions.id),
        visitors: sql<number>`COUNT(DISTINCT ${visitorSessions.visitorId})`,
      })
      .from(visitorSessions)
      .where(gte(visitorSessions.startedAt, startOfWeek));

    const [weekPageViews] = await db
      .select({ count: count(pageVisits.id) })
      .from(pageVisits)
      .where(gte(pageVisits.enteredAt, startOfWeek));

    // Popular pages
    const popularPages = await db
      .select({
        pagePath: pageVisits.pagePath,
        pageTitle: pageVisits.pageTitle,
        views: count(pageVisits.id),
        avgDuration: sql<number>`COALESCE(AVG(${pageVisits.duration}), 0)`,
      })
      .from(pageVisits)
      .groupBy(pageVisits.pagePath, pageVisits.pageTitle)
      .orderBy(desc(count(pageVisits.id)))
      .limit(10);

    // Visitors over time (last 7 days)
    const visitorsOverTime = await db
      .select({
        date: sql<string>`DATE(${visitorSessions.startedAt})`,
        visitors: sql<number>`COUNT(DISTINCT ${visitorSessions.visitorId})`,
        sessions: count(visitorSessions.id),
      })
      .from(visitorSessions)
      .where(gte(visitorSessions.startedAt, startOfWeek))
      .groupBy(sql`DATE(${visitorSessions.startedAt})`)
      .orderBy(sql`DATE(${visitorSessions.startedAt})`);

    // Add page views to each day
    const pageViewsByDay = await db
      .select({
        date: sql<string>`DATE(${pageVisits.enteredAt})`,
        pageViews: count(pageVisits.id),
      })
      .from(pageVisits)
      .where(gte(pageVisits.enteredAt, startOfWeek))
      .groupBy(sql`DATE(${pageVisits.enteredAt})`);

    const pageViewsMap = new Map(
      pageViewsByDay.map((p) => [p.date, Number(p.pageViews)])
    );

    // Device distribution
    const deviceStats = await db
      .select({
        device: visitorSessions.device,
        count: count(visitorSessions.id),
      })
      .from(visitorSessions)
      .groupBy(visitorSessions.device);

    const totalDevices = deviceStats.reduce(
      (sum, d) => sum + Number(d.count),
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
        bounceRate: Math.round(bounceRate * 10) / 10,
      },
      today: {
        visitors: Number(todayResult?.visitors || 0),
        sessions: Number(todayResult?.sessions || 0),
        pageViews: Number(todayPageViews?.count || 0),
      },
      thisWeek: {
        visitors: Number(weekResult?.visitors || 0),
        sessions: Number(weekResult?.sessions || 0),
        pageViews: Number(weekPageViews?.count || 0),
      },
      popularPages: popularPages.map((p) => ({
        pagePath: p.pagePath,
        pageTitle: p.pageTitle,
        views: Number(p.views),
        avgDuration: Math.round(Number(p.avgDuration)),
      })),
      visitorsOverTime: visitorsOverTime.map((v) => ({
        date: v.date,
        visitors: Number(v.visitors),
        sessions: Number(v.sessions),
        pageViews: pageViewsMap.get(v.date) || 0,
      })),
      deviceDistribution: deviceStats.map((d) => ({
        device: d.device || 'unknown',
        count: Number(d.count),
        percentage:
          totalDevices > 0
            ? Math.round((Number(d.count) / totalDevices) * 1000) / 10
            : 0,
      })),
    };
  } catch (error) {
    logger.error('Error getting analytics stats', { error });
    throw new Error('Failed to get analytics stats');
  }
}

/**
 * Get recent visitor sessions with page visits
 */
export async function getRecentSessions(
  limit = 20
): Promise<Array<VisitorSession & { pageVisits: PageVisit[] }>> {
  try {
    const sessions = await db
      .select()
      .from(visitorSessions)
      .orderBy(desc(visitorSessions.startedAt))
      .limit(limit);

    // Get page visits for each session
    const sessionsWithVisits = await Promise.all(
      sessions.map(async (session) => {
        const visits = await db
          .select()
          .from(pageVisits)
          .where(eq(pageVisits.sessionId, session.id))
          .orderBy(pageVisits.enteredAt);

        return { ...session, pageVisits: visits };
      })
    );

    return sessionsWithVisits;
  } catch (error) {
    logger.error('Error getting recent sessions', { error });
    throw new Error('Failed to get recent sessions');
  }
}
