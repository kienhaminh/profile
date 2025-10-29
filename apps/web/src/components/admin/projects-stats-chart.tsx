'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const chartData = data.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: parseInt(item.count),
    status: item.status,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
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
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={COLORS[entry.status as keyof typeof COLORS] || '#3b82f6'}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
