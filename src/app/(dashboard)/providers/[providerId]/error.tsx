'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface ProviderDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary component for Provider Detail Page
 *
 * Handles errors that occur during provider data fetching or rendering
 * Provides user-friendly error messages and recovery options
 */
export default function ProviderDetailError({ error, reset }: ProviderDetailErrorProps) {
  useEffect(() => {
    // Log error details for debugging
    console.error('Provider detail page error:', error);
  }, [error]);

  // Determine error type and provide appropriate messaging
  const getErrorMessage = () => {
    if (error.message.includes('Provider not found') || error.message.includes('not found')) {
      return {
        title: 'Provider Not Found',
        description:
          'The provider you are looking for does not exist or you do not have permission to view it.',
        canRetry: false,
      };
    }

    if (error.message.includes('Unauthorized') || error.message.includes('Access denied')) {
      return {
        title: 'Access Denied',
        description:
          'You do not have permission to view this provider. Please check with your administrator.',
        canRetry: false,
      };
    }

    if (error.message.includes('Network') || error.message.includes('timeout')) {
      return {
        title: 'Connection Error',
        description:
          'Unable to load provider data due to a network issue. Please check your connection and try again.',
        canRetry: true,
      };
    }

    if (error.message.includes('Database') || error.message.includes('query')) {
      return {
        title: 'Data Error',
        description: 'There was an issue retrieving provider data. Our team has been notified.',
        canRetry: true,
      };
    }

    // Generic error
    return {
      title: 'Something Went Wrong',
      description:
        'An unexpected error occurred while loading the provider details. Please try again.',
      canRetry: true,
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild={true}>
            <Link href="/dashboard/providers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Providers
            </Link>
          </Button>
        </div>

        {/* Error Display */}
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-xl">{errorInfo.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">{errorInfo.description}</p>

              {/* Error ID for debugging */}
              {error.digest && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {errorInfo.canRetry && (
                  <Button onClick={reset} className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
                <Button variant="outline" asChild={true} className="w-full">
                  <Link href="/dashboard/providers">View All Providers</Link>
                </Button>
                <Button variant="ghost" asChild={true} className="w-full">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>

              {/* Contact Support */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  If this problem persists, please contact support with the error ID above.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
