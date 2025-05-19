"use client";

import * as React from "react";
import { useFilterStore } from "@/hooks/useFilterStore";
import { MultiSelectCombobox } from "./MultiSelectCombobox";
import { useSuspenseQuery } from "@tanstack/react-query";

// Temporary mock data - In production, fetch from API
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

export function ProviderFilter() {
  const { selectedProviders, setSelectedProviders } = useFilterStore();

  // Fetch providers with React Query
  const { data: providers = [], isLoading } = useSuspenseQuery({
    queryKey: ["providers"],
    queryFn: fetchProviders,
  });

  // Format providers for the combobox
  const providerOptions = providers.map((provider) => ({
    value: provider.id,
    label: provider.name,
  }));

  return (
    <div className="w-full">
      <MultiSelectCombobox
        items={providerOptions}
        selectedValues={selectedProviders}
        onValueChange={setSelectedProviders}
        placeholder="Select providers..."
        searchPlaceholder="Search providers..."
        emptyMessage="No providers found."
        disabled={isLoading}
      />
    </div>
  );
}
