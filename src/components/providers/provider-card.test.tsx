/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CompactProviderCard, ProviderCard } from './provider-card'; // Ensure ProviderCard is imported if Actions is used directly
import type { ProviderWithLocations } from '../../types/providers';

// Create a test query client
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Mock provider data
const mockProvider: ProviderWithLocations = {
  id: 'provider-1',
  name: 'Dr. John Smith',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@example.com',
  providerType: 'dentist',
  status: 'active',
  clinicId: 'clinic-1',
  clinic: {
    id: 'clinic-1',
    name: 'Main Clinic',
    address: '123 Clinic Way',
    city: 'Healthville',
    state: 'CA',
    zipCode: '90210',
    phone: '555-1234',
    email: 'contact@mainclinic.com',
    website: 'http://mainclinic.com',
    operatingHours: 'Mon-Fri 9am-5pm',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clinicSettingsId: 'cs-1',
    subscriptionTier: 'premium',
    stripeCustomerId: 'cus_123',
    stripeSubscriptionId: 'sub_123',
    subscriptionStatus: 'active',
    trialEndDate: null,
    logoUrl: null,
    timezone: 'America/Los_Angeles',
  },
  locations: [
    {
      id: 'location-1',
      locationId: 'loc-1',
      providerId: 'provider-1',
      locationName: 'Downtown Office',
      locationAddress: '123 Main St',
      isPrimary: true,
      isActive: true,
      startDate: new Date('2023-01-01').toISOString(),
      endDate: null,
      clinicId: 'clinic-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  _count: {
    locations: 1,
    hygieneProduction: 0, 
    dentistProduction: 0,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  npiNumber: '1234567890',
  specialty: 'General Dentistry',
  notes: null,
  totalPatients: 100,
  averagePatientRating: 4.5,
  totalAppointments: 200,
  totalProduction: 50000,
  totalCollections: 45000,
  productionGoal: 60000,
  collectionsGoal: 55000,
};

describe('CompactProviderCard', () => {
  it('should call onManageLocations with the provider when "Manage Locations" is clicked', async () => {
    const user = userEvent.setup();
    const mockOnManageLocations = vi.fn();
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <CompactProviderCard
          provider={mockProvider}
          onManageLocations={mockOnManageLocations}
        />
      </QueryClientProvider>
    );

    // Find the dropdown trigger button by its accessible name
    const menuTriggerButton = screen.getByRole('button', { name: /more actions/i });

    // Use userEvent for more realistic interaction
    await user.click(menuTriggerButton);

    // Wait for the dropdown menu to appear
    const menu = await screen.findByRole('menu', {}, { timeout: 3000 });
    expect(menu).toBeInTheDocument();

    // Find and click the "Manage Locations" menu item
    const manageLocationsMenuItem = await within(menu).findByRole('menuitem', {
      name: /manage locations/i,
    });

    await user.click(manageLocationsMenuItem);

    expect(mockOnManageLocations).toHaveBeenCalledTimes(1);
    expect(mockOnManageLocations).toHaveBeenCalledWith(mockProvider);
  });

  it('should not render "Manage Locations" menu item if onManageLocations is not provided', async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <CompactProviderCard provider={mockProvider} />
      </QueryClientProvider>
    );

    const menuTriggerButton = screen.getByRole('button', { name: /more actions/i });
    await user.click(menuTriggerButton);

    // Wait for the menu to appear
    const menu = await screen.findByRole('menu', {}, { timeout: 3000 });
    expect(menu).toBeInTheDocument();

    // Check that "Manage Locations" menu item is not present
    const manageLocationsMenuItem = within(menu).queryByRole('menuitem', {
      name: /manage locations/i,
    });
    expect(manageLocationsMenuItem).toBeNull();
  });
});
