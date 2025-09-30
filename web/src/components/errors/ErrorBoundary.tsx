'use client';

import React, { Component, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('React error boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-red-600">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We&apos;re sorry, but something unexpected happened. Please try
                refreshing the page.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto">
                  <pre className="whitespace-pre-wrap">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.reload();
                  }}
                >
                  Refresh Page
                </Button>
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

    return this.props.children;
  }
}
