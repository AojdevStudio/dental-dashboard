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

import { Skeleton } from '@/components/ui/skeleton';

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
    <div class="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left column - only visible on large screens */}
      <div class="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div class="absolute inset-0 bg-zinc-900" />
        <div class="relative z-20 flex items-center text-lg font-medium">
          <Skeleton class="h-6 w-6 mr-2" />
          <Skeleton class="h-6 w-32" />
        </div>
        <div class="relative z-20 mt-auto">
          <Skeleton class="h-20 w-full" />
        </div>
      </div>

      {/* Right column - login form skeleton */}
      <div class="lg:p-8">
        <div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {/* Header skeleton */}
          <div class="flex flex-col space-y-2 text-center">
            <Skeleton class="h-8 w-48 mx-auto" />
            <Skeleton class="h-4 w-64 mx-auto" />
          </div>

          {/* Form fields skeleton */}
          <div class="space-y-4">
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
          </div>

          {/* Submit button skeleton */}
          <Skeleton class="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}
