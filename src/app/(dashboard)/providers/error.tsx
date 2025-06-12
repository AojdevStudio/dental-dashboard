'use client';

export default function ProvidersError() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-red-600">Error loading providers</h1>
      <p className="text-gray-600 mt-2">Something went wrong while fetching provider data.</p>
    </div>
  );
}
