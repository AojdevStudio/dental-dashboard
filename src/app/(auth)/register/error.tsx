/**
 * Signup Error Component
 *
 * This client-side component is automatically rendered by Next.js when an error
 * occurs during the rendering of the signup page. It provides a user-friendly
 * error message and a link to attempt to reload the signup page.
 *
 * This component is part of Next.js error handling system and is triggered when:
 * - There's a runtime error in the signup page component
 * - An uncaught exception occurs during rendering
 * - The signup form fails to load its dependencies
 * - Server-side rendering encounters an error
 */

'use client';

/**
 * Signup Error Component
 *
 * Displays a user-friendly error message when the signup page fails to load
 * and provides a link to attempt to reload the page.
 *
 * Unlike other error components, this one doesn't receive error or reset props
 * as it's a simplified version that just provides a navigation link back to the signup page.
 *
 * @returns {JSX.Element} The rendered error component with a link back to the signup page
 */
export default function SignupError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="bg-white/10 rounded-xl p-8 max-w-sm w-full text-center">
        <h2 className="text-2xl font-semibold text-red-400 mb-4">Something went wrong</h2>
        <p className="text-gray-300 mb-6">
          We couldn't load the signup form. Please try again later.
        </p>
        <a href="/auth/signup" className="underline text-white/80 hover:text-white">
          Back to Signup
        </a>
      </div>
    </div>
  );
}
