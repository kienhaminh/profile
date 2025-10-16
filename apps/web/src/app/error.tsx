'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Application error', error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-red-600">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            We&apos;re sorry, but something unexpected happened. Please try
            again.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto">
              <pre className="whitespace-pre-wrap">{error.message}</pre>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <Button onClick={() => reset()}>Try again</Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
            >
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
