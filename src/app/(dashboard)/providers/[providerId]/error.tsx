'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

/**
 * Error boundary component for provider detail page
 *
 * Handles errors that occur during provider data fetching or rendering
 */
export default function ProviderDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for debugging
    console.error('Provider detail page error:', error);
  }, [error]);

  const isNotFound = error.message.includes('not found') || error.message.includes('404');
  const isPermissionError =
    error.message.includes('permission') || error.message.includes('unauthorized');

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        {/* Header with breadcrumb navigation */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/providers">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Providers
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-red-600">Error</h1>
            <p className="text-muted-foreground">Something went wrong loading this provider</p>
          </div>
        </div>

        {/* Error Display Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {isNotFound
                ? 'Provider Not Found'
                : isPermissionError
                  ? 'Access Denied'
                  : 'Something Went Wrong'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>
                {isNotFound
                  ? 'Provider Not Found'
                  : isPermissionError
                    ? 'Insufficient Permissions'
                    : 'Unexpected Error'}
              </AlertTitle>
              <AlertDescription>
                {isNotFound &&
                  "The provider you're looking for doesn't exist or may have been removed. Please check the URL and try again, or return to the provider listing."}
                {isPermissionError &&
                  "You don't have permission to view this provider's information. This could be due to clinic-specific access restrictions."}
                {!(isNotFound || isPermissionError) &&
                  'We encountered an unexpected error while loading the provider details. This might be a temporary issue. Please try refreshing the page.'}
              </AlertDescription>
            </Alert>

            {/* Error Details for Debugging (in development) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="bg-gray-50 p-4 rounded-lg text-sm">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="bg-white p-3 rounded border text-xs font-mono">
                  <div className="mb-2">
                    <strong>Message:</strong> {error.message}
                  </div>
                  {error.digest && (
                    <div className="mb-2">
                      <strong>Digest:</strong> {error.digest}
                    </div>
                  )}
                  {error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">{error.stack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/providers" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Providers
                </Button>
              </Link>

              {!isNotFound && (
                <Button onClick={reset} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-gray-600 mt-6">
              {isNotFound && (
                <p>
                  If you believe this provider should exist, please contact your administrator or
                  check the provider listing for the correct link.
                </p>
              )}
              {isPermissionError && (
                <p>
                  If you believe you should have access to this provider, please contact your
                  administrator to review your permissions.
                </p>
              )}
              {!(isNotFound || isPermissionError) && (
                <p>
                  If this error persists, please contact support or try again later. The issue might
                  be temporary.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
