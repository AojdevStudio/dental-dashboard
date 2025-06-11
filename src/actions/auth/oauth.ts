'use server';

import { createClient } from '@/lib/auth/session';

/**
 * Supported OAuth providers for authentication.
 * The application currently supports Google, GitHub, and Azure as identity providers.
 *
 * @typedef {('google'|'github'|'azure')} Provider
 */
export type Provider = 'google' | 'github' | 'azure';

/**
 * Initiates OAuth authentication flow with the specified provider.
 * This function generates a URL that redirects the user to the provider's authentication page.
 * After authentication, the user is redirected back to the application's callback URL.
 *
 * @param {Provider} provider - The OAuth provider to authenticate with (google, github, or azure)
 * @returns {Promise<{url?: string, error?: string}>} Object containing either the OAuth URL to redirect to or an error message
 */
export async function signInWithOAuth(provider: Provider) {
  const supabase = await createClient();

  // Use the client-side callback component for handling the auth flow
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { url: data.url };
}
