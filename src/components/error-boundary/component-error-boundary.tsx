'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';
import type React from 'react';
import { ErrorBoundary } from './error-boundary';

interface ComponentErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
  showErrorDetails?: boolean;
}

/**
 * Component-level Error Boundary
 *
 * Wraps individual components to prevent errors from bubbling up
 * and crashing the entire page.
 */
export function ComponentErrorBoundary({
  children,
  componentName,
  fallback,
  showErrorDetails = false,
}: ComponentErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`Component Error in ${componentName || 'Unknown Component'}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      component: componentName,
      timestamp: new Date().toISOString(),
    });
  };

  const defaultFallback = (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Component Error</h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            {componentName ? `The ${componentName} component` : 'This component'} encountered an
            error and couldn't be displayed.
          </p>
          {showErrorDetails && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 inline-flex items-center text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh page
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary
      level="component"
      onError={handleError}
      fallback={fallback || defaultFallback}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Chart Error Boundary
 *
 * Specialized error boundary for chart components.
 */
export function ChartErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ComponentErrorBoundary
      componentName="Chart"
      fallback={
        <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Unable to load chart</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Try again
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ComponentErrorBoundary>
  );
}

/**
 * Data Table Error Boundary
 *
 * Specialized error boundary for data table components.
 */
export function DataTableErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ComponentErrorBoundary
      componentName="Data Table"
      fallback={
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
          <AlertCircle className="mx-auto h-8 w-8 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            Unable to load data
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            There was an error loading the data table.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload
          </button>
        </div>
      }
    >
      {children}
    </ComponentErrorBoundary>
  );
}

/**
 * Form Error Boundary
 *
 * Specialized error boundary for form components.
 */
export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ComponentErrorBoundary
      componentName="Form"
      fallback={
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Form Error</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                The form encountered an error. Please refresh the page and try again.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-500 dark:text-red-400"
              >
                Refresh page
              </button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ComponentErrorBoundary>
  );
}
