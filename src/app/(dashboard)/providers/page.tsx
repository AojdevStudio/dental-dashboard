'use client';

import { useProviders } from '@/hooks/use-providers';
import ProvidersError from './error';
import Loading from './loading';

export default function ProvidersPage() {
  const { providers, isLoading, isError, pagination } = useProviders();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <ProvidersError />;
  }

  return (
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-4">Providers</h1>

      {pagination && (
        <p class="text-gray-600 mb-4">
          Showing {providers.length} of {pagination.total} providers
        </p>
      )}

      <div class="grid gap-4">
        {providers.map((provider) => (
          <div key={provider.id} class="border rounded-lg p-4">
            <h3 class="font-semibold">{provider.name}</h3>
            <p class="text-gray-600">{provider.providerType}</p>
            <p class="text-sm text-gray-500">Locations: {provider.locations.length}</p>
            {provider.primaryLocation && (
              <p class="text-sm text-blue-600">Primary: {provider.primaryLocation.name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
