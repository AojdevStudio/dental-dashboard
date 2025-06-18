'use client';

import type { ReactNode } from 'react';
import type React from 'react';
import { ErrorBoundary } from './error-boundary';

interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
}

/**
 * Page-level Error Boundary
 *
 * Wraps entire pages to catch and handle errors gracefully.
 * Provides page-specific error handling with navigation options.
 */
export function PageErrorBoundary({ children, pageName }: PageErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log page-level error with additional context
    console.error(`Page Error in ${pageName || 'Unknown Page'}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      page: pageName,
      timestamp: new Date().toISOString(),
    });

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.capturePageError(error, {
      //   page: pageName,
      //   errorInfo,
      // });
    }
  };

  return (
    <ErrorBoundary level="page" onError={handleError} resetOnPropsChange={true}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * Dashboard Page Error Boundary
 *
 * Specialized error boundary for dashboard pages with
 * additional context and recovery options.
 */
export function DashboardErrorBoundary({ children }: { children: ReactNode }) {
  return <PageErrorBoundary pageName="Dashboard">{children}</PageErrorBoundary>;
}

/**
 * Auth Page Error Boundary
 *
 * Specialized error boundary for authentication pages.
 */
export function AuthErrorBoundary({ children }: { children: ReactNode }) {
  const handleAuthError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log auth-specific error
    console.error('Authentication Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // Clear any potentially corrupted auth state
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth-state');
        sessionStorage.clear();
      } catch (e) {
        console.warn('Failed to clear auth state:', e);
      }
    }
  };

  return (
    <ErrorBoundary
      level="page"
      onError={handleAuthError}
      resetOnPropsChange={true}
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
              Authentication Error
            </h1>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              We encountered an error with the authentication system. Please try refreshing the page
              or contact support if the issue persists.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
