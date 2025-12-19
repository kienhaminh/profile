'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderTree } from 'lucide-react';

export default function TopicsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Topics</h1>
        <p className="text-muted-foreground">Manage your content topics</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
              <FolderTree className="h-5 w-5 text-white" />
            </div>
            <CardTitle>Topic Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FolderTree className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Topic management interface coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
