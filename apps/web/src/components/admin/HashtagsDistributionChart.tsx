'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface HashtagsDistributionData {
  name: string;
  post_count: string;
  project_count: string;
}

interface HashtagsDistributionChartProps {
  data: HashtagsDistributionData[];
}

export function HashtagsDistributionChart({
  data,
}: HashtagsDistributionChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = data.map((item) => ({
    name: item.name,
    posts: parseInt(item.post_count),
    projects: parseInt(item.project_count),
  }));

  // Filter out items with 0 posts and 0 projects for better chart display
  const filteredChartData = chartData.filter(
    (item) => item.posts > 0 || item.projects > 0
  );

  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hashtags Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0 || filteredChartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hashtags Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
            No hashtags data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hashtags Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredChartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-muted-foreground" />
            <YAxis className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar
              dataKey="posts"
              fill="#8b5cf6"
              name="Posts"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="projects"
              fill="#ec4899"
              name="Projects"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
