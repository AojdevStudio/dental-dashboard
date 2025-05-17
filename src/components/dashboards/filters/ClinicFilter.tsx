"use client";

import * as React from "react";
import { useFilterStore } from "@/hooks/useFilterStore";
import { MultiSelectCombobox } from "./MultiSelectCombobox";
import { useSuspenseQuery } from "@tanstack/react-query";

// Temporary mock data - In production, fetch from API
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

export function ClinicFilter() {
  const { selectedClinics, setSelectedClinics } = useFilterStore();

  // Fetch clinics with React Query
  const { data: clinics = [], isLoading } = useSuspenseQuery({
    queryKey: ["clinics"],
    queryFn: fetchClinics,
  });

  // Format clinics for the combobox
  const clinicOptions = clinics.map((clinic) => ({
    value: clinic.id,
    label: clinic.name,
  }));

  return (
    <div className="w-full">
      <MultiSelectCombobox
        items={clinicOptions}
        selectedValues={selectedClinics}
        onValueChange={setSelectedClinics}
        placeholder="Select clinics..."
        searchPlaceholder="Search clinics..."
        emptyMessage="No clinics found."
        disabled={isLoading}
      />
    </div>
  );
}
