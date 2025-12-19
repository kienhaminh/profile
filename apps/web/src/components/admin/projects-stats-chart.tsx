'use client';

import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectsStatsData {
  status: string;
  count: string;
}

interface ProjectsStatsChartProps {
  data: ProjectsStatsData[];
}

const COLORS = {
  published: '#10b981',
  draft: '#f59e0b',
  archived: '#6b7280',
};

export function ProjectsStatsChart({ data }: ProjectsStatsChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = data.map((item) => ({
    name:
      item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase(),
    value: parseInt(item.count),
    status: item.status.toLowerCase(),
  }));

  // Filter out items with 0 value for better pie chart display
  const filteredChartData = chartData.filter((item) => item.value > 0);

  if (!isMounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projects by Status</CardTitle>
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
          <CardTitle>Projects by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
            No projects data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={filteredChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props) => {
                const percent = Number(props.percent || 0);
                return `${props.name}: ${(percent * 100).toFixed(0)}%`;
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {filteredChartData.map((entry) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={
                    COLORS[entry.status as keyof typeof COLORS] || '#3b82f6'
                  }
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
