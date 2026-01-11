'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface PostsOverTimeData {
  month: string;
  count: string;
  status: string;
}

interface PostsOverTimeChartProps {
  data: PostsOverTimeData[];
}

export function PostsOverTimeChart({ data }: PostsOverTimeChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = data.reduce(
    (acc, item) => {
      const monthStr = new Date(item.month).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      const existing = acc.find((d) => d.month === monthStr);
      const count = parseInt(item.count);
      const statusKey = item.status.toLowerCase();
      if (existing) {
        const currentValue = existing[statusKey];
        existing[statusKey] =
          (typeof currentValue === 'number' ? currentValue : 0) + count;
      } else {
        acc.push({
          month: monthStr,
          [statusKey]: count,
        });
      }
      return acc;
    },
    [] as Array<{ month: string; [key: string]: string | number }>
  );

  if (!isMounted) {
    return (
      <div className="p-6">
        <Skeleton className="w-full h-[300px]" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-foreground">
            Posts Overview
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            No data available for the selected period.
          </p>
        </div>
        <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground bg-accent/30 rounded-lg border border-border/50 border-dashed">
          No posts data available
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Posts Overview
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Publications history over time.
          </p>
        </div>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
        >
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border/50"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              className="text-xs text-muted-foreground"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              className="text-xs text-muted-foreground"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              itemStyle={{ paddingBottom: '2px' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
              iconType="circle"
              iconSize={8}
            />
            <Line
              type="monotone"
              dataKey="published"
              stroke="#10b981"
              name="Published"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="draft"
              stroke="#f59e0b"
              name="Draft"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
