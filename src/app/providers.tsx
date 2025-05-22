/**
 * Application Providers Component
 *
 * This client-side component sets up the global state providers for the entire application.
 * It specifically configures and provides the TanStack React Query client, which is used
 * for data fetching, caching, and state management throughout the application.
 *
 * The component implements an SSR-compatible approach to React Query setup, handling
 * the differences between server and client environments. It ensures that:
 * - On the server, a new QueryClient is always created for each request
 * - On the client, a singleton QueryClient instance is maintained across renders
 *
 * This approach prevents issues with hydration mismatches and ensures proper data
 * synchronization between server and client rendering phases.
 */

"use client";

import type React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools"; // Optional: for development

/**
 * Creates a new QueryClient instance with default configuration
 *
 * Configures the QueryClient with a 1-minute staleTime to prevent
 * immediate refetching when transitioning from server to client.
 *
 * @returns {QueryClient} A configured QueryClient instance
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000, // 1 minute
      },
    },
  });
}

/**
 * Singleton QueryClient instance for the browser environment
 * Initialized lazily to ensure it's only created in the browser context
 *
 * @type {QueryClient | undefined}
 */
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Gets the appropriate QueryClient instance based on the current environment
 *
 * This function handles the different requirements for server and client environments:
 * - Server: Always creates a new QueryClient to prevent data leakage between requests
 * - Browser: Reuses a singleton QueryClient to maintain cache across renders
 *
 * @returns {QueryClient} A QueryClient instance appropriate for the current environment
 */
function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }

  // Browser: make a new query client if we don't already have one
  // This is very important so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

/**
 * Application Providers Component
 *
 * Wraps the application with necessary context providers, specifically
 * the React Query provider for data fetching and state management.
 *
 * Uses a carefully designed pattern to handle React Query initialization
 * that works correctly with SSR and avoids issues with React suspense.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped with providers
 * @returns {JSX.Element} The provider-wrapped children components
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React may throw away JSX children that have suspenseContext
  //       in them (i.e. client components) and create the client twice.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
