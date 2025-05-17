"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TimePeriodFilter } from "./TimePeriodFilter";
import { ClinicFilter } from "./ClinicFilter";
import { ProviderFilter } from "./ProviderFilter";
import { useFilterStore } from "@/hooks/useFilterStore";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function FilterBar() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    timePeriod,
    startDate,
    endDate,
    selectedClinics,
    selectedProviders,
    setTimePeriod,
    setDateRange,
    setSelectedClinics,
    setSelectedProviders,
    clearFilters,
    resetToDefaults,
  } = useFilterStore();

  // Function to update URL params based on filter state
  const updateUrlParams = () => {
    const params = new URLSearchParams(searchParams);

    // Update time period params
    params.set("timePeriod", timePeriod);
    params.set("startDate", startDate.toISOString());
    params.set("endDate", endDate.toISOString());

    // Update clinic params
    if (selectedClinics.length > 0) {
      params.set("clinics", selectedClinics.join(","));
    } else {
      params.delete("clinics");
    }

    // Update provider params
    if (selectedProviders.length > 0) {
      params.set("providers", selectedProviders.join(","));
    } else {
      params.delete("providers");
    }

    // Update URL without refreshing the page
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Parse URL params on component mount
  useEffect(() => {
    const loadFiltersFromUrl = () => {
      // Parse time period
      const urlTimePeriod = searchParams.get("timePeriod");
      if (urlTimePeriod) {
        setTimePeriod(urlTimePeriod as any);
      }

      // Parse date range if custom period
      const urlStartDate = searchParams.get("startDate");
      const urlEndDate = searchParams.get("endDate");
      if (urlStartDate && urlEndDate) {
        setDateRange(new Date(urlStartDate), new Date(urlEndDate));
      }

      // Parse clinics
      const urlClinics = searchParams.get("clinics");
      if (urlClinics) {
        setSelectedClinics(urlClinics.split(","));
      }

      // Parse providers
      const urlProviders = searchParams.get("providers");
      if (urlProviders) {
        setSelectedProviders(urlProviders.split(","));
      }
    };

    loadFiltersFromUrl();
  }, [searchParams, setTimePeriod, setDateRange, setSelectedClinics, setSelectedProviders]);

  // Update URL when filter state changes
  useEffect(() => {
    updateUrlParams();

    // Invalidate and refetch queries when filters change
    queryClient.invalidateQueries({
      predicate: (query) => {
        // Invalidate queries that might depend on our filters
        // You can be more specific here if needed
        return query.queryKey.some(
          (key) =>
            typeof key === "string" && ["metrics", "kpis", "appointments", "patients"].includes(key)
        );
      },
    });
  }, [timePeriod, startDate, endDate, selectedClinics, selectedProviders, queryClient]);

  // Check if any filter is active
  const hasActiveFilters =
    selectedClinics.length > 0 || selectedProviders.length > 0 || timePeriod !== "monthly"; // Assuming monthly is default

  // Handle clearing all filters
  const handleClearFilters = () => {
    clearFilters();
    setIsExpanded(false);
  };

  // Handle resetting to defaults
  const handleResetFilters = () => {
    resetToDefaults();
    setIsExpanded(false);
  };

  return (
    <Card className="w-full mb-6">
      <div className="flex items-center justify-between p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground w-5 h-5 text-xs">
              {(selectedClinics.length > 0 ? 1 : 0) +
                (selectedProviders.length > 0 ? 1 : 0) +
                (timePeriod !== "monthly" ? 1 : 0)}
            </span>
          )}
        </Button>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </Button>
        </div>
      </div>

      {isExpanded && (
        <CardContent className="pb-4">
          <Accordion type="single" collapsible defaultValue="time-period" className="w-full">
            <AccordionItem value="time-period">
              <AccordionTrigger className="text-sm font-medium">Time Period</AccordionTrigger>
              <AccordionContent>
                <TimePeriodFilter />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="clinics">
              <AccordionTrigger className="text-sm font-medium">Clinics</AccordionTrigger>
              <AccordionContent>
                <ClinicFilter />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="providers">
              <AccordionTrigger className="text-sm font-medium">Providers</AccordionTrigger>
              <AccordionContent>
                <ProviderFilter />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator className="my-4" />

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsExpanded(false)}>
              Close
            </Button>
            <Button variant="default" size="sm" onClick={() => setIsExpanded(false)}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
