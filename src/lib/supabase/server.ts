/**
 * @file Supabase client utility for server-side operations.
 * This module exports a factory function to create a Supabase client instance
 * configured for use in server-side environments (e.g., Server Components, API Routes).
 */

import { validateServerEnvironment } from '@/lib/config/environment';
import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client instance for use in server-side environments.
 *
 * This function initializes and returns a Supabase client using the
 * `createServerClient` function from `@supabase/ssr`.
 * It relies on `next/headers` to access cookies and uses validated environment
 * variables from our environment configuration.
 *
 * The cookie handling within this server client is designed to work correctly
 * in Server Components and Route Handlers. It includes a try-catch block for `setAll`
 * to gracefully handle cases where it might be called from a Server Component context
 * where setting cookies directly isn't possible (relying on middleware for session refresh).
 *
 * @returns {Promise<ReturnType<typeof createServerClient>>} A Promise that resolves to a Supabase client instance.
 * @throws {Error} If required environment variables are not properly configured.
 */
export function createClient() {
  const cookieStore = cookies();

  // Use validated environment configuration instead of non-null assertions
  // This provides clear error messages if configuration is missing
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = validateServerEnvironment();

  return createServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
