/**
 * @fileoverview Supabase Server Client
 *
 * This file provides a function to create a Supabase client for server environments,
 * specifically designed for use in Next.js Server Components and Route Handlers.
 *
 * The server client is configured to work with Next.js cookie handling mechanisms
 * to maintain authentication state across server-side operations. It handles cookie
 * management for Supabase authentication tokens and provides proper error handling
 * for server component contexts.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for server environments
 *
 * This async function initializes a Supabase client configured for server-side usage
 * in Next.js applications. It integrates with Next.js cookie handling to manage
 * authentication state and session persistence.
 *
 * The function handles cookie operations for authentication tokens and provides
 * graceful error handling for Server Component contexts where cookie writing
 * may be restricted.
 *
 * @async
 * @returns {Promise<ReturnType<typeof createServerClient>>} A configured Supabase server client
 * @throws {Error} If required environment variables are missing
 *
 * @example
 * // In a Server Component or Route Handler
 * const supabase = await createClient();
 * const { data } = await supabase.from('profiles').select('*');
 */
export async function createClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      /**
       * Gets all cookies from the Next.js cookie store
       * @returns {Array} Array of cookie objects
       */
      getAll() {
        return cookieStore.getAll();
      },
      /**
       * Sets multiple cookies in the Next.js cookie store
       *
       * This function handles setting authentication cookies from Supabase.
       * It includes error handling for Server Component contexts where
       * cookie writing is not supported (these errors can be safely ignored
       * if middleware is handling session refreshing).
       *
       * @param {Array} cookiesToSet - Array of cookie objects to set
       */
      setAll(cookiesToSet) {
        try {
          for (const cookie of cookiesToSet) {
            const { name, value, options } = cookie;
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
