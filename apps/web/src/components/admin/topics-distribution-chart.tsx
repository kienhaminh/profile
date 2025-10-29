'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TopicsDistributionData {
  name: string;
  post_count: string;
}

interface TopicsDistributionChartProps {
  data: TopicsDistributionData[];
}

export function TopicsDistributionChart({ data }: TopicsDistributionChartProps) {
  const chartData = data.map((item) => ({
    name: item.name,
    posts: parseInt(item.post_count),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Topics Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="posts" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
