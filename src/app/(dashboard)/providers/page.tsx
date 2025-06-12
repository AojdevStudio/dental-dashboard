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
            <p className="text-sm text-gray-500">Locations: {provider.locations.length}</p>
            {provider.primaryLocation && (
              <p className="text-sm text-blue-600">Primary: {provider.primaryLocation.name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
