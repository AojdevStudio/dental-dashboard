"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw, X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TimePeriodFilter } from "./TimePeriodFilter";
import { ClinicFilter } from "./ClinicFilter";
import { ProviderFilter } from "./ProviderFilter";
import { useFilterStore, filterDependentQueries, createFilterUrlParams, parseFilterUrlParams } from "@/hooks/useFilterStore";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function FilterBar() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("time-period");
  const filterBarRef = useRef<HTMLDivElement>(null);

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

  // Function to update URL params based on filter state - memoized to avoid dependency issues
  const updateUrlParams = useCallback(() => {
    const params = createFilterUrlParams();
    // Update URL without refreshing the page
    router.replace(`${pathname}?${params.toString()}`);
  }, [router, pathname]);

  // Parse URL params on component mount
  useEffect(() => {
    parseFilterUrlParams(searchParams);
  }, [searchParams]);

  // We use a ref to track filter changes without creating effect dependencies
  const filtersRef = useRef({ timePeriod, startDate, endDate, selectedClinics, selectedProviders });
  
  // Update URL and invalidate queries when filter state changes
  useEffect(() => {
    // Check if filters have actually changed
    const prevFilters = filtersRef.current;
    const filtersChanged = 
      prevFilters.timePeriod !== timePeriod ||
      prevFilters.startDate !== startDate ||
      prevFilters.endDate !== endDate ||
      prevFilters.selectedClinics !== selectedClinics ||
      prevFilters.selectedProviders !== selectedProviders;
      
    // Update ref
    filtersRef.current = { timePeriod, startDate, endDate, selectedClinics, selectedProviders };
    
    // Only update URL and invalidate queries if filters have changed
    if (filtersChanged) {
      // Don't update URL on initial render
      const timeoutId = setTimeout(() => {
        updateUrlParams();

        // Invalidate and refetch queries when filters change
        queryClient.invalidateQueries({
          predicate: (query) => {
            // Invalidate queries that depend on our filters
            return query.queryKey.some(
              (key) => typeof key === "string" && filterDependentQueries.includes(key)
            );
          },
        });
      }, 100); // Small delay to batch frequent changes

      return () => clearTimeout(timeoutId);
    }
    
    return undefined;
  }, [queryClient, updateUrlParams, timePeriod, startDate, endDate, selectedClinics, selectedProviders]);
  
  // Handle clicks outside the filter bar to collapse it when expanded
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target as Node) && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // Count active filters
  const activeFilterCount = [
    timePeriod !== "monthly", // Assuming monthly is default
    selectedClinics.length > 0,
    selectedProviders.length > 0
  ].filter(Boolean).length;
  
  // Check if any filter is active
  const hasActiveFilters = activeFilterCount > 0;

  // Handle clearing all filters
  const handleClearFilters = () => {
    clearFilters();
    // Keep the filter panel open
  };

  // Handle resetting to defaults
  const handleResetFilters = () => {
    resetToDefaults();
    // Keep the filter panel open
  };
  
  // Handle applying filters and closing the panel
  const handleApplyFilters = () => {
    setIsExpanded(false);
    // Trigger a specific refetch if needed
    for (const queryKey of filterDependentQueries) {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    }
  };

  return (
    <Card className="w-full mb-6 shadow-sm" ref={filterBarRef}>
      <div className="flex items-center justify-between p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
          aria-expanded={isExpanded}
          aria-controls="filter-panel"
          aria-label={isExpanded ? "Collapse filter panel" : "Expand filter panel"}
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 px-2">
              {activeFilterCount}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-3 w-3 ml-1" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-1" />
          )}
        </Button>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="flex items-center gap-1"
              aria-label="Clear all filters"
            >
              <X className="h-3 w-3" /> <span>Clear</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="flex items-center gap-1"
            aria-label="Reset filters to defaults"
          >
            <RotateCcw className="h-3 w-3" /> <span>Reset</span>
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="filter-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pb-4">
              <Accordion 
                type="single" 
                collapsible 
                value={activeAccordion || undefined}
                onValueChange={setActiveAccordion}
                className="w-full"
              >
                <AccordionItem value="time-period">
                  <AccordionTrigger className="text-sm font-medium">
                    Time Period
                    {timePeriod !== "monthly" && (
                      <Badge variant="outline" className="ml-2">
                        {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}
                      </Badge>
                    )}
                  </AccordionTrigger>
                  <AccordionContent>
                    <TimePeriodFilter />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="clinics">
                  <AccordionTrigger className="text-sm font-medium">
                    Clinics
                    {selectedClinics.length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {selectedClinics.length}
                      </Badge>
                    )}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ClinicFilter />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="providers">
                  <AccordionTrigger className="text-sm font-medium">
                    Providers
                    {selectedProviders.length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {selectedProviders.length}
                      </Badge>
                    )}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ProviderFilter />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Separator className="my-4" />

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsExpanded(false)}
                  aria-label="Close filter panel"
                >
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleApplyFilters}
                  aria-label="Apply filters and close panel"
                >
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
