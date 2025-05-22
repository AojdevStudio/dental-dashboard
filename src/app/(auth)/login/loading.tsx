/**
 * Login Loading Component
 *
 * This component is automatically rendered by Next.js during the loading state
 * of the login page. It provides a skeleton UI that mimics the structure of the
 * login page, giving users visual feedback while the actual login page is loading.
 *
 * This component is part of Next.js' loading UI system and is displayed when:
 * - The login page is being server-side rendered
 * - Data is being fetched for the login page
 * - The page is being hydrated on the client
 *
 * The skeleton UI maintains the same layout and approximate dimensions as the
 * actual login form, creating a smooth visual transition when the real content loads.
 */

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Login Loading Component
 *
 * Renders a skeleton UI that mimics the structure of the login page,
 * providing a visual placeholder while the actual content is loading.
 *
 * @returns {JSX.Element} The rendered loading skeleton for the login page
 */
export default function LoginLoading() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left column - only visible on large screens */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Skeleton className="h-6 w-6 mr-2" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="relative z-20 mt-auto">
          <Skeleton className="h-20 w-full" />
        </div>
      </div>

      {/* Right column - login form skeleton */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {/* Header skeleton */}
          <div className="flex flex-col space-y-2 text-center">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>

          {/* Form fields skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Submit button skeleton */}
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}
