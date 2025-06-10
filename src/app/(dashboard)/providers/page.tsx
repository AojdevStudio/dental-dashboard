"use client";

import { useProviders } from "@/hooks/use-providers";

export default function ProvidersPage() {
  const { providers, isLoading, isError, pagination } = useProviders();

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Providers</h1>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Providers</h1>
        <p className="text-red-600">Error loading providers data.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Providers</h1>
      
      {pagination && (
        <p className="text-gray-600 mb-4">
          Showing {providers.length} of {pagination.total} providers
        </p>
      )}
      
      <div className="grid gap-4">
        {providers.map((provider) => (
          <div key={provider.id} className="border rounded-lg p-4">
            <h3 className="font-semibold">{provider.name}</h3>
            <p className="text-gray-600">{provider.providerType}</p>
            <p className="text-sm text-gray-500">
              Locations: {provider.locations.length}
            </p>
            {provider.primaryLocation && (
              <p className="text-sm text-blue-600">
                Primary: {provider.primaryLocation.name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}