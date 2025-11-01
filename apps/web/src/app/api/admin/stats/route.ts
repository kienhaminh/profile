import { NextRequest, NextResponse } from 'next/server';
import { extractAdminTokenFromHeaders, verifyAdminToken } from '@/lib/auth';
import { db } from '@/db/client';
import { posts, projects, tags, postTags, projectTags } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const token = extractAdminTokenFromHeaders(request);
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
