/**
 * Authentication Callback Page
 *
 * This client-side page handles the OAuth and email confirmation callbacks from Supabase Auth.
 * It processes the authentication code received in the URL, exchanges it for a session,
 * and redirects the user to the appropriate page based on the result.
 *
 * The page serves as a critical part of the authentication flow, handling:
 * - Email confirmation links
 * - OAuth provider redirects (Google, GitHub, etc.)
 * - Password reset confirmations
 *
 * During processing, it displays a loading state to the user and handles any errors
 * that might occur during the authentication process.
 */

'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

/**
 * Loading state UI displayed while authentication is in progress.
 * Shows a spinner and skeleton loaders to indicate processing.
 */
function LoadingState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden w-full rounded-xl">
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white/20 mb-6 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Authenticating...</h2>
        <p className="text-gray-300 mb-6 text-center">
          Please wait while we complete your authentication.
        </p>
        <div className="w-full space-y-4">
          <Skeleton className="h-2 w-full bg-white/10 rounded-full" />
          <Skeleton className="h-2 w-4/5 bg-white/10 rounded-full mx-auto" />
          <Skeleton className="h-2 w-2/3 bg-white/10 rounded-full mx-auto" />
        </div>
      </div>
    </div>
  );
}

/**
 * Handles the authentication callback logic.
 * This component uses useSearchParams and must be wrapped in Suspense.
 */
function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const code = searchParams.get('code');

  useEffect(() => {
    /**
     * Processes the authentication callback by exchanging the code for a session
     * and redirecting the user to the appropriate page based on the result.
     *
     * @async
     * @throws {Error} If authentication fails or environment variables are missing
     */
    async function handleCallback() {
      try {
        if (!code) {
          router.replace('/login');
          return;
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!(supabaseUrl && supabaseAnonKey)) {
          throw new Error('Missing Supabase environment variables');
        }

        const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          throw exchangeError;
        }

        router.replace('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication error');
        setTimeout(() => {
          router.replace('/auth-error');
        }, 2000);
      }
    }

    handleCallback();
  }, [code, router]);

  /**
   * Error state UI displayed when authentication fails.
   * Shows the specific error message and indicates that the user will be redirected.
   */
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden w-full rounded-xl">
        <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-red-500/20 mb-6 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>Warning icon</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-red-400 mb-6 text-center">
            Authentication Error
          </h2>
          <p className="text-gray-300 mb-6 text-center">{error}</p>
          <p className="text-gray-400 mb-6 text-center">Redirecting you...</p>
        </div>
      </div>
    );
  }

  // The loading state is handled by the Suspense fallback.
  return null;
}

/**
 * Authentication Callback Page Component
 *
 * Wraps the authentication handler in a Suspense boundary to comply with Next.js rules
 * for components using `useSearchParams`.
 *
 * @returns {JSX.Element} The rendered callback page with a Suspense boundary.
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthCallbackHandler />
    </Suspense>
  );
}
