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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card>
        <CardHeader>
          <CardTitle>Posts Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Posts Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
            No posts data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posts Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-muted-foreground" />
            <YAxis className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="published"
              stroke="#10b981"
              name="Published"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="draft"
              stroke="#f59e0b"
              name="Draft"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
