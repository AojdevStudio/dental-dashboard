/**
 * Providers Loading Skeleton Component
 * Next.js 15 App Router loading.tsx for providers page
 */
export default function Loading() {
  return (
    <output
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading providers"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6"
    >
      {Array.from({ length: 8 }, (_, index) => ({ id: `skeleton-${index}` })).map((item) => (
        <div key={item.id} data-testid="provider-skeleton-card" className="p-4 border rounded-lg">
          <div data-testid="skeleton-heading" className="h-4 bg-gray-200 rounded mb-2" />
          <div data-testid="skeleton-subtitle" className="h-3 bg-gray-200 rounded w-3/4" />
        </div>
      ))}
    </output>
  );
}
