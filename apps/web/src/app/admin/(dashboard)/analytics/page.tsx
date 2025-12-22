'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Clock,
  Eye,
  TrendingUp,
  MousePointer,
  MonitorSmartphone,
  Smartphone,
  Tablet,
  Monitor,
} from 'lucide-react';
import {
  getAnalyticsStats,
  getRecentSessions,
  type AnalyticsStats,
  type VisitorSession,
  type PageVisit,
} from '@/actions/visitor-analytics';

// Format duration in seconds to human readable
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

// Format date for display
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// Device icon component
function DeviceIcon({ device }: { device: string }) {
  switch (device) {
    case 'mobile':
      return <Smartphone className="w-4 h-4" />;
    case 'tablet':
      return <Tablet className="w-4 h-4" />;
    default:
      return <Monitor className="w-4 h-4" />;
  }
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<
    Array<VisitorSession & { pageVisits: PageVisit[] }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statsData, sessionsData] = await Promise.all([
          getAnalyticsStats(),
          getRecentSessions(20),
        ]);
        setStats(statsData);
        setRecentSessions(sessionsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Visitor tracking and engagement metrics
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">
          Visitor tracking and engagement metrics
        </p>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cosmic-card relative overflow-hidden border shadow-lg hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Visitors
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {stats?.overview.totalVisitors || 0}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <p className="text-xs text-muted-foreground font-medium">
                {stats?.today.visitors || 0} today
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="cosmic-card relative overflow-hidden border shadow-lg hover:shadow-xl dark:hover:shadow-secondary/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Session Duration
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 dark:from-cyan-400 dark:to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-teal-500 dark:from-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
              {formatDuration(stats?.overview.avgSessionDuration || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              {stats?.overview.totalSessions || 0} total sessions
            </p>
          </CardContent>
        </Card>

        <Card className="cosmic-card relative overflow-hidden border shadow-lg hover:shadow-xl dark:hover:shadow-accent/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Page Views
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 dark:from-violet-400 dark:to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Eye className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
              {stats?.overview.totalPageViews || 0}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <p className="text-xs text-muted-foreground font-medium">
                {stats?.thisWeek.pageViews || 0} this week
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="cosmic-card relative overflow-hidden border shadow-lg hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Bounce Rate
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <MousePointer className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {stats?.overview.bounceRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Single-page sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Device Distribution */}
      {stats && stats.deviceDistribution.length > 0 && (
        <Card className="cosmic-card border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MonitorSmartphone className="w-5 h-5" />
              Device Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {stats.deviceDistribution.map((device) => (
                <div
                  key={device.device}
                  className="flex items-center gap-2 bg-accent/30 px-4 py-2 rounded-lg"
                >
                  <DeviceIcon device={device.device} />
                  <span className="font-medium capitalize">
                    {device.device}
                  </span>
                  <span className="text-muted-foreground">
                    {device.count} ({device.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Pages */}
      {stats && stats.popularPages.length > 0 && (
        <Card className="cosmic-card border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Popular Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.popularPages.map((page, index) => (
                <div
                  key={page.pagePath}
                  className="flex items-center justify-between p-3 bg-accent/20 rounded-lg hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">
                        {page.pageTitle || page.pagePath}
                      </p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {page.pagePath}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{page.views} views</p>
                    <p className="text-sm text-muted-foreground">
                      ~{formatDuration(page.avgDuration)} avg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      <Card className="cosmic-card border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recent Visitor Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No visitor sessions yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedSession(
                        expandedSession === session.id ? null : session.id
                      )
                    }
                    className="w-full p-4 flex items-center justify-between hover:bg-accent/20 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <DeviceIcon device={session.device || 'desktop'} />
                      <div className="text-left">
                        <p className="font-medium text-sm">
                          {session.visitorId.slice(0, 8)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(session.startedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="font-medium text-sm">
                          {session.pageVisits.length} pages
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.totalDuration
                            ? formatDuration(session.totalDuration)
                            : 'Active'}
                        </p>
                      </div>
                      <span className="text-muted-foreground">
                        {expandedSession === session.id ? '▲' : '▼'}
                      </span>
                    </div>
                  </button>

                  {expandedSession === session.id &&
                    session.pageVisits.length > 0 && (
                      <div className="px-4 pb-4 bg-accent/10">
                        <div className="space-y-2 pt-2">
                          {session.pageVisits.map((visit) => (
                            <div
                              key={visit.id}
                              className="flex items-center justify-between text-sm py-2 border-t border-border/50"
                            >
                              <div>
                                <p className="font-medium">
                                  {visit.pageTitle || visit.pagePath}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {visit.pagePath}
                                </p>
                              </div>
                              <div className="text-right">
                                {visit.duration && (
                                  <p className="text-muted-foreground">
                                    {formatDuration(visit.duration)}
                                  </p>
                                )}
                                {visit.scrollDepth !== null && (
                                  <p className="text-xs text-muted-foreground">
                                    {visit.scrollDepth}% scrolled
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
