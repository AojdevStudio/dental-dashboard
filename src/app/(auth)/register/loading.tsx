import { Skeleton } from '@/components/ui/skeleton';

/**
 * Signup Loading Component
 *
 * Renders a skeleton UI that mimics the structure of the signup page,
 * providing a visual placeholder while the actual content is loading.
 *
 * @returns {JSX.Element} The rendered loading skeleton for the signup page
 */
export default function SignupLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="w-full max-w-sm p-8">
        {/* Logo/avatar skeleton */}
        <Skeleton className="h-24 w-24 rounded-full mb-6 mx-auto" />

        {/* Title skeleton */}
        <Skeleton className="h-8 w-2/3 mx-auto mb-6" />

        {/* Form field skeletons */}
        <Skeleton className="h-12 w-full mb-3" />
        <Skeleton className="h-12 w-full mb-3" />
        <Skeleton className="h-12 w-full mb-3" />
        <Skeleton className="h-12 w-full mb-3" />

        {/* Submit button or link skeleton */}
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>
    </div>
  );
}
