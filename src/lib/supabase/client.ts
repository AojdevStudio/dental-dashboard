/**
 * @file Supabase client utility for browser-side operations.
 * This module exports a factory function to create a Supabase client instance
 * configured for use in client-side (browser) environments.
 */

import { validateClientEnvironment } from '@/lib/config/environment';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client instance for use in browser environments.
 *
 * This function initializes and returns a Supabase client using the
 * `createBrowserClient` function from `@supabase/ssr`.
 * It uses validated environment variables from our environment configuration.
 *
 * @returns {ReturnType<typeof createBrowserClient>} A Supabase client instance.
 * @throws {Error} If required environment variables are not properly configured.
 */
export function createClient() {
  // Use validated environment configuration instead of non-null assertions
  // This provides clear error messages if configuration is missing
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = validateClientEnvironment();

  return createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
