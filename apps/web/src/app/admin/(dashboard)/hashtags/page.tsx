'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hash } from 'lucide-react';

export default function HashtagsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Hashtags</h1>
        <p className="text-muted-foreground">Manage your content hashtags</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
              <Hash className="h-5 w-5 text-white" />
            </div>
            <CardTitle>Hashtag Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Hashtag management interface coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
