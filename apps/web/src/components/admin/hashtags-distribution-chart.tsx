'use client';

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
  const chartData = data.map((item) => ({
    name: item.name,
    posts: parseInt(item.post_count),
    projects: parseInt(item.project_count),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hashtags Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="posts" fill="#8b5cf6" name="Posts" />
            <Bar dataKey="projects" fill="#ec4899" name="Projects" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
