# Provider Card - Manage Locations Feature

This document demonstrates how to use the new `onManageLocations` prop in the ProviderCard components.

## Overview

The `onManageLocations` prop has been added to make the "Manage Locations" dropdown menu item functional. When provided, it enables users to click on "Manage Locations" and trigger a callback with the current provider data.

## Usage

### CompactProviderCard

```tsx
import { CompactProviderCard } from '@/components/providers/provider-card';
import type { ProviderWithLocations } from '@/types/providers';

function ProvidersPage() {
  const handleManageLocations = (provider: ProviderWithLocations) => {
    // Handle the manage locations action
    console.log('Managing locations for:', provider.name);
    
    // Example: Navigate to locations management page
    router.push(`/providers/${provider.id}/locations`);
    
    // Example: Open a modal
    setSelectedProvider(provider);
    setShowLocationsModal(true);
  };

  return (
    <CompactProviderCard
      provider={provider}
      onEdit={handleEdit}
      onViewDetails={handleViewDetails}
      onManageLocations={handleManageLocations} // New prop
    />
  );
}
```

### DetailedProviderCard

```tsx
import { DetailedProviderCard } from '@/components/providers/provider-card';
import type { ProviderWithLocations } from '@/types/providers';

function ProviderDetailsPage() {
  const handleManageLocations = (provider: ProviderWithLocations) => {
    // Handle the manage locations action
    console.log('Managing locations for:', provider.name);
    console.log('Current locations:', provider.locations);
    
    // Example: Open locations management interface
    openLocationsManager(provider);
  };

  return (
    <DetailedProviderCard
      provider={provider}
      onEdit={handleEdit}
      onViewDetails={handleViewDetails}
      onManageLocations={handleManageLocations} // New prop
    />
  );
}
```

### Using the Compound Component

```tsx
import { ProviderCard } from '@/components/providers/provider-card';

function CustomProviderCard({ provider }: { provider: ProviderWithLocations }) {
  const handleManageLocations = (provider: ProviderWithLocations) => {
    // Your custom logic here
    console.log('Managing locations for:', provider.name);
  };

  return (
    <ProviderCard.Root provider={provider}>
      <ProviderCard.Header>
        <ProviderCard.Title />
        <ProviderCard.Actions
          onEdit={handleEdit}
          onViewDetails={handleViewDetails}
          onManageLocations={handleManageLocations} // New prop
        />
      </ProviderCard.Header>
      <ProviderCard.Content>
        <ProviderCard.Metrics />
        <ProviderCard.Locations />
      </ProviderCard.Content>
    </ProviderCard.Root>
  );
}
```

## Behavior

- **When `onManageLocations` is provided**: The "Manage Locations" dropdown menu item is rendered and clickable
- **When `onManageLocations` is not provided**: The "Manage Locations" dropdown menu item is not rendered
- **Callback signature**: `(provider: ProviderWithLocations) => void`
- **Provider data**: The callback receives the complete provider object including locations, metrics, and all other properties

## Example Implementation

Here's a complete example of how you might implement the manage locations functionality:

```tsx
import { useState } from 'react';
import { CompactProviderCard } from '@/components/providers/provider-card';
import { LocationsManagementModal } from '@/components/modals/locations-management-modal';
import type { ProviderWithLocations } from '@/types/providers';

function ProvidersListPage() {
  const [selectedProvider, setSelectedProvider] = useState<ProviderWithLocations | null>(null);
  const [showLocationsModal, setShowLocationsModal] = useState(false);

  const handleManageLocations = (provider: ProviderWithLocations) => {
    setSelectedProvider(provider);
    setShowLocationsModal(true);
  };

  const handleCloseModal = () => {
    setShowLocationsModal(false);
    setSelectedProvider(null);
  };

  return (
    <div>
      {providers.map((provider) => (
        <CompactProviderCard
          key={provider.id}
          provider={provider}
          onManageLocations={handleManageLocations}
        />
      ))}
      
      {selectedProvider && (
        <LocationsManagementModal
          provider={selectedProvider}
          isOpen={showLocationsModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
```

## Notes

- The callback is optional - if not provided, the "Manage Locations" menu item won't appear
- The provider object passed to the callback includes all location data and counts
- The menu item uses the MapPin icon for consistency with the locations theme
- Event propagation is handled automatically to prevent card click events when the dropdown is used
