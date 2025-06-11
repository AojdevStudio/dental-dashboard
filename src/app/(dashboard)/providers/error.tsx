'use client';

export default function ProvidersError() {
  return (
    <div class="p-6">
      <h1 class="text-2xl font-bold text-red-600">Error loading providers</h1>
      <p class="text-gray-600 mt-2">Something went wrong while fetching provider data.</p>
    </div>
  );
}
