'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, ChevronDown, Download } from 'lucide-react';
import {
  getAnalyticsStats,
  type AnalyticsStats,
} from '@/actions/visitor-analytics';
import {
  StatsOverview,
  ActivityChart,
  TopPages,
  SourcesList,
  VisitorLocations,
} from '@/components/admin/AnalyticsCharts';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const statsData = await getAnalyticsStats(timeRange);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-8 w-32 bg-muted rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 col-span-2 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium text-foreground tracking-tight">
              Traffic Overview
            </h1>
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 border rounded-full ${
                timeRange === '24h'
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : timeRange === '7d'
                    ? 'bg-blue-500/10 border-blue-500/20'
                    : 'bg-indigo-500/10 border-indigo-500/20'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  timeRange === '24h'
                    ? 'bg-emerald-500 animate-pulse'
                    : timeRange === '7d'
                      ? 'bg-blue-500'
                      : 'bg-indigo-500'
                }`}
              ></span>
              <span
                className={`text-[10px] font-medium uppercase tracking-wide ${
                  timeRange === '24h'
                    ? 'text-emerald-500'
                    : timeRange === '7d'
                      ? 'text-blue-500'
                      : 'text-indigo-500'
                }`}
              >
                {timeRange === '24h'
                  ? 'Real-time'
                  : timeRange === '7d'
                    ? '7 Days'
                    : '30 Days'}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time insights for your portfolio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted/50 p-0.5 rounded-md border border-border/50">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-medium transition-all rounded shadow-sm ${
                  timeRange === range
                    ? 'text-foreground bg-background border border-border/50'
                    : 'text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && <StatsOverview stats={stats} />}

      {/* Activity Chart (Dynamic) */}
      {stats && <ActivityChart data={stats.activity} />}

      {/* Detail Grid */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopPages pages={stats.popularPages} />
          <SourcesList sources={stats.topSources} />
          <VisitorLocations countries={stats.topCountries} />
        </div>
      )}
    </div>
  );
}
