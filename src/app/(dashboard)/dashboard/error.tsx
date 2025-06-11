'use client';
/** Dashboard Error UI */
export default function DashboardError({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div>
      <h2>Dashboard Error!</h2>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
