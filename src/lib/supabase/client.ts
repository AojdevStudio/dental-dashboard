/**
 * @file Supabase client utility for browser-side operations.
 * This module exports a factory function to create a Supabase client instance
 * configured for use in client-side (browser) environments.
 */

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
  // Use direct environment access for browser client to avoid validation timing issues
  // The validateClientEnvironment() function was causing hydration errors
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fallback validation with clear error messages
  if (!(supabaseUrl && supabaseAnonKey)) {
    throw new Error(
      `Missing Supabase configuration. Please check your environment variables:
      NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗ Missing'}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '✗ Missing'}`
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
