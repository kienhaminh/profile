'use client';

import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Layout,
  Share2,
  MapPin,
  Download,
  Linkedin,
  Github,
  Globe,
  Dribbble,
  ArrowUp,
  Minus,
  Eye,
  Clock,
} from 'lucide-react';
import { XIcon } from '@/components/icons/social-icons';
import { AnalyticsStats } from '@/actions/visitor-analytics';
import { cn } from '@/lib/utils';

// --- Activity Chart (Dynamic) ---

interface ActivityChartProps {
  data: AnalyticsStats['activity'];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Card className="bg-card/50 border-border/60 shadow-sm">
        <CardHeader className="pb-2 border-b border-border/60 mb-4 px-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Activity</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Visitor activity over the selected period.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <Skeleton className="h-56 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/60 shadow-sm">
      <CardHeader className="pb-2 border-b border-border/60 mb-4 px-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">Activity</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Visitor activity over the selected period.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="h-56 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <BarChart data={data} barGap={2}>
              <XAxis
                dataKey="label"
                className="text-[10px] text-muted-foreground font-mono"
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                interval="preserveStartEnd"
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded border border-border shadow-lg flex flex-col items-center">
                        <span className="font-bold">
                          {payload[0].value} Visitors
                        </span>
                        <span className="text-muted-foreground">
                          {payload[0].payload.label}
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="value"
                radius={[2, 2, 0, 0]}
                className="fill-primary/50 hover:fill-primary transition-all duration-300"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Top Pages List ---

interface TopPagesProps {
  pages: AnalyticsStats['popularPages'];
}

export function TopPages({ pages }: TopPagesProps) {
  const maxViews = Math.max(...pages.map((p) => p.views), 1);

  return (
    <Card className="bg-card/50 border-border/60 shadow-sm overflow-hidden flex flex-col h-full">
      <CardHeader className="px-5 py-4 border-b border-border/60 flex flex-row items-center justify-between space-y-0">
        <h3 className="text-sm font-medium text-foreground">Top Pages</h3>
        <Layout className="text-muted-foreground w-3.5 h-3.5" />
      </CardHeader>
      <CardContent className="flex-1 p-2">
        {pages.map((page) => (
          <div
            key={page.pagePath}
            className="group flex items-center justify-between p-2 rounded hover:bg-accent/40 transition-colors relative mt-1 first:mt-0"
          >
            {/* Background Progress Bar */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-accent/40 rounded z-0 transition-all duration-500"
              style={{ width: `${(page.views / maxViews) * 100}%` }}
            />
            <div className="flex items-center gap-2 relative z-10 overflow-hidden mr-4">
              <span className="text-xs font-mono text-muted-foreground shrink-0">
                {page.pagePath === '/' ? '/' : page.pagePath}
              </span>
              {/* Optional: Add title if space permits, or tooltip it */}
            </div>
            <div className="text-xs text-muted-foreground font-medium relative z-10 shrink-0">
              {page.views.toLocaleString()}
            </div>
          </div>
        ))}
        {pages.length === 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Sources List ---

interface SourcesProps {
  sources: AnalyticsStats['topSources'];
}

function getSourceIcon(source: string) {
  const s = source.toLowerCase();
  if (s.includes('linkedin'))
    return <Linkedin className="w-3 h-3 text-blue-500" />;
  if (s.includes('twitter') || s.includes('t.co') || s.includes('x.com'))
    return <XIcon className="w-3 h-3 text-foreground" />;
  if (s.includes('github')) return <Github className="w-3 h-3" />;
  if (s.includes('dribbble'))
    return <Dribbble className="w-3 h-3 text-pink-500" />;
  return <Globe className="w-3 h-3 text-muted-foreground" />;
}

function getSourceName(source: string) {
  if (!source) return 'Direct';
  try {
    const url = new URL(source);
    return url.hostname.replace('www.', '');
  } catch {
    return source;
  }
}

export function SourcesList({ sources }: SourcesProps) {
  const maxVisitors = Math.max(...sources.map((s) => s.visitors), 1);

  return (
    <Card className="bg-card/50 border-border/60 shadow-sm overflow-hidden flex flex-col h-full">
      <CardHeader className="px-5 py-4 border-b border-border/60 flex flex-row items-center justify-between space-y-0">
        <h3 className="text-sm font-medium text-foreground">Sources</h3>
        <Share2 className="text-muted-foreground w-3.5 h-3.5" />
      </CardHeader>
      <CardContent className="flex-1 p-2">
        {sources.map((source, i) => (
          <div
            key={i}
            className="group flex items-center justify-between p-2 rounded hover:bg-accent/40 transition-colors relative mt-1 first:mt-0"
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-accent/40 rounded z-0 transition-all duration-500"
              style={{ width: `${(source.visitors / maxVisitors) * 100}%` }}
            />
            <div className="flex items-center gap-2 relative z-10 overflow-hidden mr-4">
              {getSourceIcon(source.source)}
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                {getSourceName(source.source)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground font-medium relative z-10 shrink-0">
              {source.visitors.toLocaleString()}
            </div>
          </div>
        ))}
        {sources.length === 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// --- Visitor Locations ---

interface LocationsProps {
  countries: AnalyticsStats['topCountries'];
}

export function VisitorLocations({ countries }: LocationsProps) {
  return (
    <Card className="bg-card/50 border-border/60 shadow-sm overflow-hidden flex flex-col h-full lg:col-span-2">
      <CardHeader className="px-5 py-4 border-b border-border/60 flex flex-row items-center justify-between space-y-0">
        <h3 className="text-sm font-medium text-foreground">
          Visitor Locations
        </h3>
        <MapPin className="text-muted-foreground w-3.5 h-3.5" />
      </CardHeader>
      <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2">
        <div className="p-2 border-b md:border-b-0 md:border-r border-border/60">
          {countries.map((country, i) => (
            <div
              key={i}
              className="group flex items-center justify-between p-2 rounded hover:bg-accent/40 transition-colors relative mt-1 first:mt-0"
            >
              <div
                className="absolute left-0 top-0 bottom-0 bg-accent/40 rounded z-0 transition-all duration-500"
                style={{ width: `${country.percentage}%` }}
              />
              <div className="flex items-center gap-3 relative z-10">
                {/* Placeholder Flag */}
                <div className="w-4 h-3 bg-muted rounded-[1px] overflow-hidden relative opacity-80 flex items-center justify-center text-[8px]">
                  {country.country.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs text-muted-foreground">
                  {country.country || 'Unknown'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground font-medium relative z-10">
                {country.percentage}%
              </div>
            </div>
          ))}
          {countries.length === 0 && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No location data available
            </div>
          )}
        </div>
        <div className="p-2 flex items-center justify-center min-h-[150px] relative overflow-hidden bg-accent/5">
          {/* Abstract Map Visualization - Simplified CSS Version */}
          <div className="relative w-full max-w-[280px] aspect-video opacity-80 scale-75 md:scale-100">
            {/* Simulated dots */}
            <div
              className="absolute top-[30%] left-[20%] w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-pulse"
              style={{ animationDelay: '0.1s' }}
            />
            <div className="absolute top-[35%] left-[25%] w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.6)] animate-pulse" />
            <div
              className="absolute top-[25%] left-[80%] w-1.5 h-1.5 bg-muted-foreground/30 rounded-full animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
            <div className="absolute top-[32%] left-[48%] w-1.5 h-1.5 bg-muted-foreground/50 rounded-full" />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono uppercase">
                Live Map
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Stats Overview Cards ---

interface StatsOverviewProps {
  stats: AnalyticsStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="p-4 rounded-xl bg-card/50 border border-border/60 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="text-muted-foreground w-3.5 h-3.5" />
          <div className="text-xs font-medium text-muted-foreground">
            Total Views
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-foreground tracking-tight">
            {stats.overview.totalPageViews.toLocaleString()}
          </span>
          {/* Placeholder trend - in real app, compare with prev period */}
          <span className="text-[10px] font-medium text-emerald-500 flex items-center">
            <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> 12%
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-card/50 border border-border/60 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Download className="text-muted-foreground w-3.5 h-3.5" />
          <div className="text-xs font-medium text-muted-foreground">
            Downloads
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-foreground tracking-tight">
            146
          </span>
          <span className="text-[10px] font-medium text-emerald-500 flex items-center">
            <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> 4%
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-card/50 border border-border/60 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="text-muted-foreground w-3.5 h-3.5" />
          <div className="text-xs font-medium text-muted-foreground">
            Social Clicks
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-foreground tracking-tight">
            28
          </span>
          <span className="text-[10px] font-medium text-muted-foreground flex items-center">
            <Minus className="w-2.5 h-2.5 mr-0.5" /> 0%
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-card/50 border border-border/60 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="text-muted-foreground w-3.5 h-3.5" />
          <div className="text-xs font-medium text-muted-foreground">
            Avg. Time
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-foreground tracking-tight">
            {Math.floor(stats.overview.avgSessionDuration / 60)}m{' '}
            {stats.overview.avgSessionDuration % 60}s
          </span>
          <span className="text-[10px] font-medium text-emerald-500 flex items-center">
            <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> 8%
          </span>
        </div>
      </div>
    </div>
  );
}
