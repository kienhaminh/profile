'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TopicsPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Topics</h1>
          <p className="text-gray-600">Manage your content topics</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Topic Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Topic management interface coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
