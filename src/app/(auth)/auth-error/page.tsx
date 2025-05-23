/**
 * Authentication Error Page
 *
 * This page is displayed when an authentication error occurs during the sign-in,
 * sign-up, or password reset process. It provides users with information about
 * possible causes of the error and options to navigate back to the login or
 * signup pages.
 *
 * This page is typically reached when:
 * - An authentication link has expired
 * - A link has already been used
 * - There's an invalid token or other authentication parameters
 * - The OAuth provider returns an error
 */

import type { Metadata } from "next";

/**
 * Metadata for the Authentication Error page
 * Defines the page title and description for SEO and browser tabs
 */
export const metadata: Metadata = {
  title: "Authentication Error",
  description: "Something went wrong during authentication",
};

/**
 * Authentication Error Page Component
 *
 * Displays a user-friendly error message explaining potential causes of the
 * authentication failure and provides navigation options to retry the process.
 *
 * @returns {JSX.Element} The rendered Authentication Error page
 */
export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="bg-white/10 rounded-xl p-8 max-w-md w-full text-center">
        {" "}
        <h2 className="text-2xl font-semibold text-red-400 mb-4">Authentication Error</h2>
        <p className="text-gray-300 mb-6">
          We encountered an error during the authentication process. This could happen if:
        </p>
        <ul className="text-gray-300 mb-6 text-left list-disc pl-6">
          <li className="mb-2">The authentication link has expired</li>
          <li className="mb-2">You've already used this authentication link</li>
          <li className="mb-2">The authentication link is invalid</li>
        </ul>
        <div className="flex flex-col gap-4">
          <a
            href="/login"
            className="text-white bg-white/10 hover:bg-white/20 transition px-6 py-2 rounded-full"
          >
            Return to Login
          </a>
          <a href="/signup" className="text-white/80 hover:text-white underline">
            Create a new account
          </a>
        </div>
      </div>
    </div>
  );
}
