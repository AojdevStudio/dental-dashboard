'use client';

/** Dashboard Error UI */
export default function DashboardError({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div>
      <h2>Dashboard Error!</h2>
      <p>An error occurred: {error.message}</p>
      {error.digest && <p>Error ID: {error.digest}</p>}
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
