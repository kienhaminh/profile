import { NextResponse } from 'next/server';
import { extractAdminTokenFromHeaders, verifyAdminToken } from '@/lib/admin-auth';
import { db } from '@/db';
import { posts, projects, topics, postTopics, hashtags, postHashtags, projectHashtags } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const token = extractAdminTokenFromHeaders(new Headers(request.headers));
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      verifyAdminToken(token);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Topics distribution
    const topicsDistribution = await db.execute(sql`
      SELECT 
        t.name,
        COUNT(pt.post_id) as post_count
      FROM ${topics} t
      LEFT JOIN ${postTopics} pt ON t.id = pt.topic_id
      GROUP BY t.id, t.name
      ORDER BY post_count DESC
      LIMIT 10
    `);

    // Hashtags distribution
    const hashtagsDistribution = await db.execute(sql`
      SELECT 
        h.name,
        COUNT(ph.post_id) as post_count,
        COUNT(pjh.project_id) as project_count
      FROM ${hashtags} h
      LEFT JOIN ${postHashtags} ph ON h.id = ph.hashtag_id
      LEFT JOIN ${projectHashtags} pjh ON h.id = pjh.hashtag_id
      GROUP BY h.id, h.name
      ORDER BY (COUNT(ph.post_id) + COUNT(pjh.project_id)) DESC
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
        (SELECT COUNT(*) FROM ${topics}) as total_topics,
        (SELECT COUNT(*) FROM ${hashtags}) as total_hashtags
    `);

    return NextResponse.json({
      postsOverTime: postsOverTime.rows,
      topicsDistribution: topicsDistribution.rows,
      hashtagsDistribution: hashtagsDistribution.rows,
      projectsStats: projectsStats.rows,
      recentActivity: recentActivityCounts.rows[0],
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
