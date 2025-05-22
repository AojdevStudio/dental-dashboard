/**
 * @fileoverview Filter Bar Component
 * 
 * This file implements the main filter bar component used in the dashboard interface.
 * It provides a unified interface for all dashboard filters, including clinic selection,
 * provider selection, and time period filtering. The component handles filter state
 * management, URL synchronization, and query invalidation when filters change.
 */

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
import {
  useFilterStore,
  filterDependentQueries,
  createFilterUrlParams,
  parseFilterUrlParams,
} from "@/hooks/useFilterStore";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Filter Bar Component
 * 
 * A collapsible filter panel that provides a unified interface for all dashboard filters.
 * Features include:
 * - Expandable/collapsible filter panel with animation
 * - Accordion sections for different filter types
 * - URL synchronization to maintain filter state between page loads
 * - Query invalidation to refresh data when filters change
 * - Filter count badges to show active filters
 * - Clear and reset filter options
 * 
 * The component integrates with the global filter store and automatically updates
 * the URL parameters when filters change, allowing for shareable filtered views.
 * 
 * @returns {JSX.Element} The rendered filter bar component
 */
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

  /**
   * Updates URL parameters based on the current filter state
   * 
   * This function is memoized to avoid dependency issues and excessive re-renders.
   * It creates URL parameters from the current filter state and updates the browser URL
   * without triggering a page refresh, enabling shareable filtered dashboard views.
   * 
   * @returns {void}
   */
  const updateUrlParams = useCallback(() => {
    // Generate URL parameters from current filter state
    const params = createFilterUrlParams();
    // Update URL without refreshing the page
    router.replace(`${pathname}?${params.toString()}`);
  }, [router, pathname]);

  /**
   * Parses URL parameters and updates filter state on component mount and URL changes
   * 
   * This effect runs when the component mounts and whenever the URL search parameters change.
   * It ensures that the filter state is synchronized with the URL, allowing for bookmarking
   * and sharing specific filter configurations.
   * 
   * @returns {void}
   */
  useEffect(() => {
    parseFilterUrlParams(searchParams);
  }, [searchParams]);

  /**
   * Reference to track filter changes without creating effect dependencies
   * 
   * Using a ref allows us to compare previous and current filter values without
   * adding them as dependencies to the effect, which would cause infinite loops.
   */
  const filtersRef = useRef({ timePeriod, startDate, endDate, selectedClinics, selectedProviders });

  /**
   * Updates URL and invalidates queries when filter state changes
   * 
   * This effect is responsible for:
   * 1. Detecting when any filter value has changed
   * 2. Updating the URL to reflect the new filter state
   * 3. Invalidating and refetching any queries that depend on the filter values
   * 
   * It includes debouncing (via setTimeout) to prevent excessive URL updates and
   * query invalidations when multiple filters change in quick succession.
   * 
   * @returns {void | (() => void)} Cleanup function to clear the timeout if component unmounts during the delay
   */
  useEffect(() => {
    // Check if filters have actually changed by comparing with previous values
    const prevFilters = filtersRef.current;
    const filtersChanged =
      prevFilters.timePeriod !== timePeriod ||
      prevFilters.startDate !== startDate ||
      prevFilters.endDate !== endDate ||
      prevFilters.selectedClinics !== selectedClinics ||
      prevFilters.selectedProviders !== selectedProviders;

    // Update reference with current filter values
    filtersRef.current = { timePeriod, startDate, endDate, selectedClinics, selectedProviders };

    // Only update URL and invalidate queries if filters have actually changed
    if (filtersChanged) {
      // Use timeout to debounce frequent changes
      const timeoutId = setTimeout(() => {
        // Update URL parameters
        updateUrlParams();

        // Invalidate and refetch queries that depend on our filters
        queryClient.invalidateQueries({
          predicate: (query) => {
            // Only invalidate queries that have keys matching our filter-dependent query list
            return query.queryKey.some(
              (key) => typeof key === "string" && filterDependentQueries.includes(key)
            );
          },
        });
      }, 100); // Small delay to batch frequent changes

      // Return cleanup function to clear timeout if component unmounts during delay
      return () => clearTimeout(timeoutId);
    }

    return undefined;
  }, [
    queryClient,
    updateUrlParams,
    timePeriod,
    startDate,
    endDate,
    selectedClinics,
    selectedProviders,
  ]);

  /**
   * Handles clicks outside the filter bar to automatically collapse it when expanded
   * 
   * This effect adds a global click event listener that checks if the click occurred
   * outside the filter bar component. If the filter panel is expanded and the user
   * clicks outside of it, the panel will automatically collapse, improving the UX
   * by allowing users to easily dismiss the filter panel.
   * 
   * @returns {void}
   */
  useEffect(() => {
    /**
     * Event handler for clicks outside the filter bar
     * 
     * @param {MouseEvent} event - The mouse click event
     */
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterBarRef.current &&
        !filterBarRef.current.contains(event.target as Node) &&
        isExpanded
      ) {
        setIsExpanded(false);
      }
    };

    // Add event listener when component mounts or isExpanded changes
    document.addEventListener("mousedown", handleClickOutside);
    
    // Clean up event listener when component unmounts or isExpanded changes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  /**
   * Calculates the number of active filters for display in the filter badge
   * 
   * This counts each filter category that has a non-default value:
   * - Time period (if not set to the default 'monthly')
   * - Clinics (if any are selected)
   * - Providers (if any are selected)
   * 
   * @type {number}
   */
  const activeFilterCount = [
    timePeriod !== "monthly", // Assuming monthly is default
    selectedClinics.length > 0,
    selectedProviders.length > 0,
  ].filter(Boolean).length;

  /**
   * Boolean flag indicating if any filters are currently active
   * Used to conditionally show the clear filters button
   * 
   * @type {boolean}
   */
  const hasActiveFilters = activeFilterCount > 0;

  /**
   * Clears all filters to their empty state
   * 
   * This resets all filters to empty values (not default values):
   * - Time period: empty
   * - Date range: empty
   * - Selected clinics: empty array
   * - Selected providers: empty array
   * 
   * The filter panel remains open after clearing to allow the user to select new filters.
   * 
   * @returns {void}
   */
  const handleClearFilters = () => {
    clearFilters();
    // Keep the filter panel open for user convenience
  };

  /**
   * Resets all filters to their default values
   * 
   * This sets all filters back to their system defaults:
   * - Time period: 'monthly'
   * - Date range: current month
   * - Selected clinics: empty array
   * - Selected providers: empty array
   * 
   * The filter panel remains open after resetting to allow the user to make adjustments.
   * 
   * @returns {void}
   */
  const handleResetFilters = () => {
    resetToDefaults();
    // Keep the filter panel open for user convenience
  };

  /**
   * Applies the current filters and closes the filter panel
   * 
   * This function:
   * 1. Collapses the filter panel
   * 2. Triggers a refetch of all filter-dependent queries to update the dashboard data
   * 
   * Each query in the filterDependentQueries list is individually invalidated to ensure
   * all data components are updated with the new filter values.
   * 
   * @returns {void}
   */
  const handleApplyFilters = () => {
    setIsExpanded(false);
    // Trigger a specific refetch for each filter-dependent query
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
