/**
 * @fileoverview Supabase Browser Client
 *
 * This file provides a function to create a Supabase client for browser environments.
 * It configures the client with the appropriate environment variables and ensures
 * proper error handling if the required configuration is missing.
 *
 * The browser client is specifically designed for client-side usage and handles
 * authentication state management in the browser context.
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for browser environments
 *
 * This function initializes a Supabase client configured for browser usage,
 * using the public URL and anonymous key from environment variables.
 * The client provides access to Supabase services including authentication,
 * database, storage, and realtime subscriptions.
 *
 * @returns {ReturnType<typeof createBrowserClient>} A configured Supabase browser client
 * @throws {Error} If required environment variables are missing
 *
 * @example
 * // Create a client and use it for authentication
 * const supabase = createClient();
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!(supabaseUrl && supabaseAnonKey)) {
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
