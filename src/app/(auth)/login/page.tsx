/**
 * @file Login page component.
 * Allows users to sign in or sign out of the application.
 */

"use client";

import { useState, useTransition } from "react";
import { signIn, signOut } from "@/app/auth/actions";

/**
 * LoginPage component.
 * Renders a form for user sign-in and a button for sign-out.
 *
 * @returns {JSX.Element} The rendered login page.
 */
export default function LoginPage(): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  /**
   * Handles the form submission for sign-in.
   * @param {FormData} formData - The form data from the sign-in form.
   */
  const handleSignIn = async (formData: FormData) => {
    startTransition(async () => {
      const result = await signIn(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(null);
        // Redirect is handled by the server action
      }
    });
  };

  /**
   * Handles the sign-out action.
   */
  const handleSignOut = async () => {
    startTransition(async () => {
      await signOut();
      // Redirect is handled by the server action
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding/Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 flex-col justify-center px-12">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-white mb-6">Dental Analytics Dashboard</h1>
          <p className="text-xl text-blue-100 mb-8">
            Track your practice performance, manage goals, and gain insights into your dental
            practice operations.
          </p>
          <div className="space-y-4 text-blue-100">
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
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to access your dental practice dashboard</p>
          </div>

          <form action={handleSignIn} className="space-y-6">
            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isPending}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
