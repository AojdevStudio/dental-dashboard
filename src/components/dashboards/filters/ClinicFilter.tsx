/**
 * @fileoverview Clinic Filter Component
 *
 * This file implements a filter component for selecting dental clinics in the dashboard.
 * It fetches clinic data using React Query and provides a multi-select combobox interface
 * for users to filter dashboard data by one or more clinics. The component integrates
 * with the global filter store to maintain filter state across the application.
 */

"use client";

import { useFilterStore } from "@/hooks/useFilterStore";
import { useSuspenseQuery } from "@tanstack/react-query";
import * as React from "react";
import { MultiSelectCombobox } from "./MultiSelectCombobox";

/**
 * Fetches the list of available clinics
 *
 * In this example implementation, it returns mock data with a simulated delay.
 * In a production environment, this would be replaced with an actual API call
 * to fetch clinics from the backend.
 *
 * @returns {Promise<Array<{id: string, name: string}>>} Promise resolving to an array of clinic objects
 */
const fetchClinics = async () => {
  // Simulating API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    { id: "clinic-1", name: "Main Street Dental" },
    { id: "clinic-2", name: "Riverside Dentistry" },
    { id: "clinic-3", name: "Downtown Dental Care" },
    { id: "clinic-4", name: "Smile Center" },
    { id: "clinic-5", name: "Family Dental Group" },
  ];
};

/**
 * Clinic Filter Component
 *
 * Provides a UI for selecting one or more clinics to filter dashboard data.
 * Features include:
 * - Multi-select combobox interface with search functionality
 * - Integration with React Query for data fetching with caching and suspense
 * - Synchronization with the global filter store
 * - Loading state handling
 *
 * @returns {JSX.Element} The rendered clinic filter component
 */
export function ClinicFilter() {
  /**
   * Extract clinic filter state and setters from the global filter store
   *
   * This includes:
   * - selectedClinics: Array of currently selected clinic IDs
   * - setSelectedClinics: Function to update the selected clinics
   */
  const { selectedClinics, setSelectedClinics } = useFilterStore();

  /**
   * Fetch clinic data using React Query with suspense mode
   *
   * The useSuspenseQuery hook provides:
   * - Automatic caching and refetching
   * - Loading state tracking
   * - Integration with React Suspense for loading states
   *
   * @type {{data: Array<{id: string, name: string}>, isLoading: boolean}}
   */
  const { data: clinics = [], isLoading } = useSuspenseQuery({
    queryKey: ["clinics"], // Unique key for caching and invalidation
    queryFn: fetchClinics, // Function that fetches the data
  });

  /**
   * Transform clinic data into the format required by MultiSelectCombobox
   *
   * @type {Array<{value: string, label: string}>}
   */
  const clinicOptions = clinics.map((clinic) => ({
    value: clinic.id, // The clinic ID used as the value
    label: clinic.name, // The clinic name displayed to the user
  }));

  /**
   * Render the clinic filter interface
   *
   * Uses the MultiSelectCombobox component to provide a searchable, multi-select
   * interface for selecting clinics. The component handles all the UI complexity
   * including dropdown, search, selection, and keyboard navigation.
   *
   * @returns {JSX.Element} The rendered clinic filter interface
   */
  return (
    <div className="w-full">
      <MultiSelectCombobox
        items={clinicOptions} // List of available clinics
        selectedValues={selectedClinics} // Currently selected clinic IDs
        onValueChange={setSelectedClinics} // Handler for selection changes
        placeholder="Select clinics..." // Placeholder when no selection
        searchPlaceholder="Search clinics..." // Placeholder in search input
        emptyMessage="No clinics found." // Message when no results match search
        disabled={isLoading} // Disable during data loading
      />
    </div>
  );
}
