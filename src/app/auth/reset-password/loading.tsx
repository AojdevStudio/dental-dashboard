/**
 * Reset Password Loading Component
 *
 * This component is automatically rendered by Next.js during the loading state
 * of the reset password page. It provides a skeleton UI that mimics the structure
 * of the reset password form, giving users visual feedback while the actual page
 * is loading.
 *
 * This component is part of Next.js' loading UI system and is displayed when:
 * - The reset password page is being server-side rendered
 * - Data is being fetched for the reset password page
 * - The page is being hydrated on the client
 *
 * The skeleton UI maintains the same layout and approximate dimensions as the
 * actual reset password form, creating a smooth visual transition when the real content loads.
 */

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Reset Password Loading Component
 *
 * Renders a skeleton UI that mimics the structure of the reset password page,
 * providing a visual placeholder while the actual content is loading.
 *
 * @returns {JSX.Element} The rendered loading skeleton for the reset password page
 */
export default function ResetPasswordLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden w-full rounded-xl">
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-[#ffffff10] to-[#121212] backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center">
        {/* Logo skeleton */}
        <Skeleton className="w-24 h-24 rounded-full bg-white/10 mb-6" />

        {/* Title skeleton */}
        <Skeleton className="h-8 w-48 bg-white/10 mb-6 rounded-lg" />

        {/* Form skeleton */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            <Skeleton className="w-full h-12 rounded-xl bg-white/10" />
          </div>
          <Skeleton className="w-full h-px bg-white/10 my-2" />
          <Skeleton className="w-full h-12 rounded-full bg-white/10" />
          <Skeleton className="w-32 h-4 rounded-md bg-white/10 mx-auto mt-2" />
        </div>
      </div>
    </div>
  );
}
