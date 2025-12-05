'use client';

/**
 * @file Login page component.
 * Allows users to sign in or sign out of the application.
 */

import type React from 'react';

import { signInWithOAuth } from '@/actions/auth/oauth';
import { signInWithVerification } from '@/app/auth/actions';
import { signInWithClientAuth } from '@/app/auth/client-actions';
import { useState, useTransition } from 'react';

/**
 * LoginPage component.
 * Renders a form for user sign-in and a button for sign-out.
 *
 * @returns {React.ReactElement} The rendered login page.
 */
export default function LoginPage(): React.ReactElement {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  /**
   * Handles the form submission for sign-in.
   * @param {FormData} formData - The form data from the sign-in form.
   */
  const handleSignIn = (formData: FormData) => {
    startTransition(async () => {
      try {
        // Try server action first, fall back to client auth if context error
        let result: { error: string | null; success: boolean } | undefined;
        try {
          result = await signInWithVerification(formData);
        } catch (serverError) {
          // If server action fails due to context issues, use client auth
          if (
            serverError instanceof Error &&
            serverError.message.includes('cookies') &&
            serverError.message.includes('request scope')
          ) {
            result = await signInWithClientAuth(formData);
          } else {
            throw serverError;
          }
        }

        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          setError(null);
          // Manually redirect since server redirect throws in transitions
          window.location.href = '/dashboard';
        }
      } catch (error) {
        console.error('Login error:', error);
        setError('An unexpected error occurred. Please try again.');
      }
    });
  };

  /**
   * Handles the forgot password action.
   * Redirects the user to the password reset page.
   */
  const handleForgotPassword = () => {
    startTransition(() => {
      // Navigate to the password reset page
      window.location.href = '/reset-password';
    });
  };

  /**
   * Handles OAuth sign in with Google
   */
  const handleGoogleSignIn = () => {
    startTransition(async () => {
      const result = await signInWithOAuth('google');
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        window.location.href = result.url;
      }
    });
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left side - Branding/Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 flex-col justify-start pt-12 px-12">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Dental Analytics Dashboard
          </h1>
          <div className="flex items-center mb-6">
            <p className="text-sm uppercase tracking-wider text-blue-100 font-medium">Powered by</p>
            <span className="mx-2 text-blue-300">|</span>
            <p className="text-base font-semibold text-white">Unified Dental</p>
          </div>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed font-light">
            Track your practice performance, manage goals, and gain insights into your dental
            practice operations.
          </p>
          <div className="space-y-4 text-blue-100 font-light">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-300 rounded-full mr-3" />
              <span>Real-time metrics and KPI tracking</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-300 rounded-full mr-3" />
              <span>Google Sheets integration</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-300 rounded-full mr-3" />
              <span>Goal setting and progress monitoring</span>
            </div>

            <div className="mt-12 flex justify-center">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 z-0" />
                <img
                  src="/dashboard-analytics.svg"
                  alt="Dental Analytics Dashboard visualization"
                  className="relative z-10 w-full max-w-xs opacity-90 hover:opacity-100 transition-opacity duration-300"
                />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl z-0" />
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-indigo-400/20 rounded-full blur-2xl z-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Welcome back</h2>
            <p className="text-gray-600 font-light">
              Sign in to access your dental practice dashboard
            </p>
          </div>

          <form action={handleSignIn} className="space-y-6">
            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-gray-700 mb-2 tracking-wide"
              >
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required={true}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2 tracking-wide"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required={true}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
            >
              {isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-label="Google logo">
                  <title>Google logo</title>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isPending ? 'Connecting...' : 'Sign in with Google'}
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={isPending}
              className="w-full bg-transparent hover:bg-gray-50 text-blue-600 font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
            >
              {isPending ? 'Processing...' : 'Forgot password?'}
            </button>

            <div className="mt-4">
              <p className="text-center text-sm text-gray-600 mb-4">
                Don't have an account?{' '}
                <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up
                </a>
              </p>
            </div>

            <div className="mt-12 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-500 font-light">
                  © {new Date().getFullYear()} KC Ventures Consulting Group LLC
                </p>
                <div className="mt-2 flex items-center justify-center space-x-4">
                  <a
                    href="https://unifiedental.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    unifiedental.com
                  </a>
                  <span className="text-gray-300">|</span>
                  <a
                    href="tel:3466440193"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    346-644-0193
                  </a>
                  <span className="text-gray-300">|</span>
                  <a
                    href="https://www.linkedin.com/in/ossieirondi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
                <p className="mt-4 text-xs text-gray-400 max-w-md mx-auto">
                  "Simple solutions for complex dental needs" — Streamlining dental practice
                  management with unified, efficient tools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
