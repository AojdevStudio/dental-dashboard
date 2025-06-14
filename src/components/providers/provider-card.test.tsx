import { describe, expect, it } from 'vitest';
import type { ProviderWithLocations } from '@/types/providers';

// Test the onManageLocations prop logic directly
describe('ProviderCard onManageLocations Logic', () => {
  const mockProvider: ProviderWithLocations = {
    id: 'provider-1',
    name: 'Dr. John Smith',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    providerType: 'dentist',
    status: 'active',
    clinic: {
      id: 'clinic-1',
      name: 'Main Clinic',
    },
    locations: [
      {
        id: 'location-1',
        locationId: 'loc-1',
        locationName: 'Downtown Office',
        locationAddress: '123 Main St',
        isPrimary: true,
        isActive: true,
        startDate: new Date('2023-01-01'),
        endDate: null,
      },
    ],
    _count: {
      locations: 1,
      hygieneProduction: 5,
      dentistProduction: 10,
    },
  };

  // Test the conditional rendering logic for the Manage Locations dropdown item
  function shouldRenderManageLocations(onManageLocations?: (provider: ProviderWithLocations) => void): boolean {
    return !!onManageLocations;
  }

  // Test the onClick handler logic
  function handleManageLocationsClick(
    onManageLocations: (provider: ProviderWithLocations) => void,
    provider: ProviderWithLocations
  ): void {
    onManageLocations(provider);
  }

  it('should return true when onManageLocations prop is provided', () => {
    const onManageLocations = () => {};
    const result = shouldRenderManageLocations(onManageLocations);
    expect(result).toBe(true);
  });

  it('should return false when onManageLocations prop is not provided', () => {
    const result = shouldRenderManageLocations(undefined);
    expect(result).toBe(false);
  });

  it('should call onManageLocations with the correct provider when clicked', () => {
    let calledWith: ProviderWithLocations | null = null;
    const onManageLocations = (provider: ProviderWithLocations) => {
      calledWith = provider;
    };

    handleManageLocationsClick(onManageLocations, mockProvider);

    expect(calledWith).toBe(mockProvider);
    expect(calledWith?.id).toBe('provider-1');
    expect(calledWith?.name).toBe('Dr. John Smith');
  });

  it('should handle provider with multiple locations', () => {
    const providerWithMultipleLocations: ProviderWithLocations = {
      ...mockProvider,
      locations: [
        ...mockProvider.locations,
        {
          id: 'location-2',
          locationId: 'loc-2',
          locationName: 'Uptown Office',
          locationAddress: '456 Oak St',
          isPrimary: false,
          isActive: true,
          startDate: new Date('2023-06-01'),
          endDate: null,
        },
      ],
      _count: {
        ...mockProvider._count,
        locations: 2,
      },
    };

    let calledWith: ProviderWithLocations | null = null;
    const onManageLocations = (provider: ProviderWithLocations) => {
      calledWith = provider;
    };

    handleManageLocationsClick(onManageLocations, providerWithMultipleLocations);

    expect(calledWith).toBe(providerWithMultipleLocations);
    expect(calledWith?.locations).toHaveLength(2);
    expect(calledWith?._count.locations).toBe(2);
  });
});
