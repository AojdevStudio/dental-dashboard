/**
 * @fileoverview Provider Filter Component
 *
 * This file implements a filter component for selecting dental providers/doctors in the dashboard.
 * It fetches provider data using React Query and provides a multi-select combobox interface
 * for users to filter dashboard data by one or more providers. The component integrates
 * with the global filter store to maintain filter state across the application.
 */

"use client";

import { useFilterStore } from "@/hooks/useFilterStore";
import { useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import { MultiSelectCombobox } from "./MultiSelectCombobox";

/**
 * Fetches the list of available providers (dentists/doctors)
 *
 * In this example implementation, it returns mock data with a simulated delay.
 * In a production environment, this would be replaced with an actual API call
 * to fetch providers from the backend, potentially filtered by the selected clinics.
 *
 * @returns {Promise<Array<{id: string, name: string}>>} Promise resolving to an array of provider objects
 */
const fetchProviders = async () => {
  // Simulating API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    { id: "provider-1", name: "Dr. Sarah Johnson" },
    { id: "provider-2", name: "Dr. Michael Chen" },
    { id: "provider-3", name: "Dr. Emily Rodriguez" },
    { id: "provider-4", name: "Dr. David Smith" },
    { id: "provider-5", name: "Dr. Jessica Lee" },
    { id: "provider-6", name: "Dr. Robert Williams" },
    { id: "provider-7", name: "Dr. Amanda Taylor" },
  ];
};

/**
 * Provider Filter Component
 *
 * Provides a UI for selecting one or more dental providers to filter dashboard data.
 * Features include:
 * - Multi-select combobox interface with search functionality
 * - Integration with React Query for data fetching with caching and suspense
 * - Synchronization with the global filter store
 * - Loading state handling
 *
 * In a production environment, this component might fetch providers based on the
 * currently selected clinics, allowing for hierarchical filtering.
 *
 * @returns {JSX.Element} The rendered provider filter component
 */
export function ProviderFilter() {
  /**
   * Extract provider filter state and setters from the global filter store
   *
   * This includes:
   * - selectedProviders: Array of currently selected provider IDs
   * - setSelectedProviders: Function to update the selected providers
   */
  const { selectedProviders, setSelectedProviders } = useFilterStore();

  /**
   * Fetch provider data using React Query with suspense mode
   *
   * The useSuspenseQuery hook provides:
   * - Automatic caching and refetching
   * - Loading state tracking
   * - Integration with React Suspense for loading states
   *
   * @type {{data: Array<{id: string, name: string}>, isLoading: boolean}}
   */
  const { data: providers = [], isLoading } = useSuspenseQuery({
    queryKey: ["providers"], // Unique key for caching and invalidation
    queryFn: fetchProviders, // Function that fetches the data
  });

  /**
   * Transform provider data into the format required by MultiSelectCombobox
   *
   * @type {Array<{value: string, label: string}>}
   */
  const providerOptions = providers.map((provider) => ({
    value: provider.id, // The provider ID used as the value
    label: provider.name, // The provider name displayed to the user
  }));

  /**
   * Render the provider filter interface
   *
   * Uses the MultiSelectCombobox component to provide a searchable, multi-select
   * interface for selecting providers. The component handles all the UI complexity
   * including dropdown, search, selection, and keyboard navigation.
   *
   * @returns {JSX.Element} The rendered provider filter interface
   */
  return (
    <div className="w-full">
      <MultiSelectCombobox
        items={providerOptions} // List of available providers
        selectedValues={selectedProviders} // Currently selected provider IDs
        onValueChange={setSelectedProviders} // Handler for selection changes
        placeholder="Select providers..." // Placeholder when no selection
        searchPlaceholder="Search providers..." // Placeholder in search input
        emptyMessage="No providers found." // Message when no results match search
        disabled={isLoading} // Disable during data loading
      />
    </div>
  );
}
