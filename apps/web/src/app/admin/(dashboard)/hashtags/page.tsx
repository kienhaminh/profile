'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HashtagsPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hashtags</h1>
          <p className="text-gray-600">Manage your content hashtags</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hashtag Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Hashtag management interface coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
