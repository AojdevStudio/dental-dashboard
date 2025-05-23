/**
 * @file Supabase client utility for server-side operations.
 * This module exports a factory function to create a Supabase client instance
 * configured for use in server-side environments (e.g., Server Components, API Routes).
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client instance for use in server-side environments.
 *
 * This function initializes and returns a Supabase client using the
 * `createServerClient` function from `@supabase/ssr`.
 * It relies on `next/headers` to access cookies and uses environment variables
 * `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for configuration.
 *
 * The cookie handling within this server client is designed to work correctly
 * in Server Components and Route Handlers. It includes a try-catch block for `setAll`
 * to gracefully handle cases where it might be called from a Server Component context
 * where setting cookies directly isn't possible (relying on middleware for session refresh).
 *
 * @returns {ReturnType<typeof createServerClient>} A Supabase client instance.
 * @throws {Error} If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set. (Implicitly, due to non-null assertion)
 */
export function createClient() {
  const cookieStore = cookies();

  // The non-null assertion operator (!) is used here because the presence of these
  // environment variables should be guaranteed by the application's setup and Next.js environment loading.
  // If they are missing, an error will be thrown at runtime, which is the desired behavior
  // to indicate a critical configuration issue.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // @ts-expect-error TS2339: Property 'getAll' does not exist on type 'Promise<ReadonlyRequestCookies>'.
          // Supabase SSR pattern expects synchronous access, overriding linter's inference.
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              // @ts-expect-error TS2339: Property 'set' does not exist on type 'Promise<ReadonlyRequestCookies>'.
              // Supabase SSR pattern expects synchronous access, overriding linter's inference.
              cookieStore.set(name, value, options);
            }
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
