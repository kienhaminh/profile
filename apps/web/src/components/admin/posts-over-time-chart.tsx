'use client';

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

interface PostsOverTimeData {
  month: string;
  count: string;
  status: string;
}

interface PostsOverTimeChartProps {
  data: PostsOverTimeData[];
}

export function PostsOverTimeChart({ data }: PostsOverTimeChartProps) {
  const chartData = data.reduce(
    (acc, item) => {
      const monthStr = new Date(item.month).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      const existing = acc.find((d) => d.month === monthStr);
      const count = parseInt(item.count);
      if (existing) {
        const currentValue = existing[item.status];
        existing[item.status] = (typeof currentValue === 'number' ? currentValue : 0) + count;
      } else {
        acc.push({
          month: monthStr,
          [item.status]: count,
        });
      }
      return acc;
    },
    [] as Array<{ month: string; [key: string]: string | number }>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posts Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="published"
              stroke="#10b981"
              name="Published"
            />
            <Line
              type="monotone"
              dataKey="draft"
              stroke="#f59e0b"
              name="Draft"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
