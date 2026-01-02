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
      <div className="p-6">
        <Skeleton className="w-full h-[300px]" />
      </div>
    );
  }

  if (!data || data.length === 0 || filteredChartData.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-foreground">
            Projects Status
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Distribution of projects by status.
          </p>
        </div>
        <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground bg-accent/30 rounded-lg border border-border/50 border-dashed">
          No projects data available
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Projects Status
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Distribution of projects by status.
          </p>
        </div>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredChartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              paddingAngle={5}
              dataKey="value"
            >
              {filteredChartData.map((entry) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={
                    COLORS[entry.status as keyof typeof COLORS] || '#3b82f6'
                  }
                  strokeWidth={0}
                />
              ))}
            </Pie>
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
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
