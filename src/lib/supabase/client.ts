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
 * It relies on environment variables `NEXT_PUBLIC_SUPABASE_URL` and
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY` for configuration.
 *
 * @returns {ReturnType<typeof createBrowserClient>} A Supabase client instance.
 * @throws {Error} If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set. (Implicitly, due to non-null assertion)
 */
export function createClient() {
  // The non-null assertion operator (!) is used here because the presence of these
  // environment variables should be guaranteed by the application's setup and Next.js environment loading.
  // If they are missing, an error will be thrown at runtime, which is the desired behavior
  // to indicate a critical configuration issue.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
