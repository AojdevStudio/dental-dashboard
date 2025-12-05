'use client';
import { Button } from '@/components/ui/button';

/**
 * Providers Error Boundary Component
 * Next.js 15 App Router error.tsx for providers page
 * Client component with retry functionality
 */
export default function ProvidersError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground text-center">
        An unexpected error occurred while loading the providers page.
      </p>
      <Button type="button" onClick={reset} className="inline-flex">
        Try again
      </Button>
    </div>
  );
}
