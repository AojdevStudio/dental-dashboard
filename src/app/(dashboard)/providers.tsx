/**
 * Dashboard Providers Component
 *
 * This client-side component sets up the global state providers for the dashboard section
 * of the application. It specifically configures and provides the TanStack React Query client,
 * which is used for data fetching, caching, and state management throughout the dashboard.
 *
 * The component creates a persistent QueryClient instance that won't be recreated on re-renders,
 * configures global defaults for query behavior, and wraps children components with the necessary
 * context providers. It also includes the React Query DevTools for development purposes.
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";

/**
 * Dashboard Providers Component
 *
 * Sets up the React Query client provider for the dashboard section of the application.
 * This enables efficient data fetching, caching, and synchronization across the dashboard.
 *
 * The QueryClient is configured with the following defaults:
 * - 5-minute stale time to reduce unnecessary refetches
 * - Disabled automatic refetching on window focus for better UX
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped with the providers
 * @returns {JSX.Element} The provider-wrapped children components with React Query DevTools
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Create a stable QueryClient instance that persists across component renders
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
