/**
 * @fileoverview Dashboard Filters Component
 *
 * This file implements all filter components used in the dashboard interface.
 * It provides a unified interface for filtering dashboard data by:
 * - Time period (daily, weekly, monthly, quarterly, annual, or custom date range)
 * - Clinics (multiple selection of dental clinics)
 * - Providers (multiple selection of dental providers/doctors)
 *
 * These components are designed to work together with the global filter store
 * to maintain consistent filter state across the application.
 */

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  type TimePeriod,
  createFilterUrlParams,
  parseFilterUrlParams,
  useFilterStore,
} from "@/hooks/use-filters";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarIcon, ChevronDown, ChevronUp, Filter, RotateCcw, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Available time period options for the filter
 *
 * Each option has a value (used internally) and a label (displayed to the user).
 * The 'custom' option enables the date range picker for selecting specific date ranges.
 *
 * @type {Array<{value: string, label: string}>}
 */
const timePeriodOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "custom", label: "Custom Date Range" },
];

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
 * Fetches the list of available providers
 *
 * In this example implementation, it returns mock data with a simulated delay.
 * In a production environment, this would be replaced with an actual API call
 * to fetch providers from the backend.
 *
 * @returns {Promise<Array<{id: string, name: string}>>} Promise resolving to an array of provider objects
 */
const fetchProviders = async () => {
  // Simulating API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    { id: "provider-1", name: "Dr. Smith" },
    { id: "provider-2", name: "Dr. Johnson" },
    { id: "provider-3", name: "Dr. Williams" },
    { id: "provider-4", name: "Dr. Brown" },
    { id: "provider-5", name: "Dr. Jones" },
  ];
};

/**
 * MultiSelectCombobox Component
 *
 * A reusable component for multi-select dropdown with search functionality.
 * Features include:
 * - Dropdown menu with search input
 * - Multi-selection with checkboxes
 * - Keyboard navigation
 * - Custom placeholder text and messages
 *
 * @param {Object} props - Component properties
 * @param {Array<{value: string, label: string}>} props.items - Available items for selection
 * @param {string[]} props.selectedValues - Currently selected item values
 * @param {(values: string[]) => void} props.onValueChange - Handler for selection changes
 * @param {string} props.placeholder - Placeholder when no items are selected
 * @param {string} props.searchPlaceholder - Placeholder for the search input
 * @param {string} props.emptyMessage - Message shown when no items match the search
 * @param {boolean} props.disabled - Whether the component is disabled
 * @returns {JSX.Element} The rendered multi-select combobox component
 */
export function MultiSelectCombobox({
  items,
  selectedValues,
  onValueChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  emptyMessage = "No items found.",
  disabled = false,
}: {
  items: { value: string; label: string }[];
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}) {
  // State for the search input value
  const [search, setSearch] = useState("");

  // Filter items based on search input
  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  // Get the labels of selected items for display
  const selectedLabels = items
    .filter((item) => selectedValues.includes(item.value))
    .map((item) => item.label);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-between", disabled && "opacity-50 cursor-not-allowed")}
          disabled={disabled}
        >
          {selectedValues.length > 0 ? (
            <div className="flex flex-wrap gap-1 mr-2">
              {selectedValues.length <= 2 ? (
                selectedLabels.join(", ")
              ) : (
                <span>{`${selectedValues.length} selected`}</span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <Filter className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="flex flex-col">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder={searchPlaceholder}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                /**
                 * Handle item selection for both click and keyboard events
                 */
                const handleItemSelect = () => {
                  const newValues = selectedValues.includes(item.value)
                    ? selectedValues.filter((v) => v !== item.value)
                    : [...selectedValues, item.value];
                  onValueChange(newValues);
                };

                /**
                 * Handle keyboard events for accessibility
                 * @param {React.KeyboardEvent} event - The keyboard event
                 */
                const handleKeyDown = (event: React.KeyboardEvent) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleItemSelect();
                  }
                };

                return (
                  <div
                    key={item.value}
                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-accent"
                    onClick={handleItemSelect}
                    onKeyDown={handleKeyDown}
                    // biome-ignore lint/a11y/useSemanticElements: Custom combobox requires role="option" on div elements per ARIA spec
                    role="option"
                    tabIndex={0}
                    aria-selected={selectedValues.includes(item.value)}
                    aria-label={`${selectedValues.includes(item.value) ? "Deselect" : "Select"} ${item.label}`}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        selectedValues.includes(item.value)
                          ? "bg-primary border-primary"
                          : "border-primary"
                      )}
                    >
                      {selectedValues.includes(item.value) && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span>{item.label}</span>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-muted-foreground">{emptyMessage}</div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Time Period Filter Component
 *
 * Provides a UI for selecting time periods for dashboard data filtering.
 * Features include:
 * - Dropdown for selecting predefined time periods (daily, weekly, monthly, etc.)
 * - Calendar interface for selecting custom date ranges when 'custom' is selected
 * - Integration with the global filter store to maintain state across components
 *
 * @returns {JSX.Element} The rendered time period filter component
 */
export function TimePeriodFilter() {
  const { timePeriod, startDate, endDate, setTimePeriod, setDateRange } = useFilterStore();
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [date, setDate] = React.useState<{
    from: Date;
    to?: Date;
  }>({
    from: startDate,
    to: endDate,
  });

  React.useEffect(() => {
    if (date.from && date.to) {
      setDateRange(date.from, date.to);
    }
  }, [date, setDateRange]);

  React.useEffect(() => {
    setDate({
      from: startDate,
      to: endDate,
    });
  }, [startDate, endDate]);

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Time period type selector dropdown */}
      <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select time period" />
        </SelectTrigger>
        <SelectContent>
          {timePeriodOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Custom date range picker - only shown when 'custom' time period is selected */}
      {timePeriod === "custom" && (
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {/* Display formatted date range or prompt */}
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "PPP")} - {format(date.to, "PPP")}
                  </>
                ) : (
                  format(date.from, "PPP")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            {/* Calendar component for date range selection */}
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={{
                from: date?.from,
                to: date?.to,
              }}
              onSelect={(range) => {
                // Update local state with selected range
                setDate(range as { from: Date; to?: Date });
                // Close the popover when a complete range is selected
                if (range?.from && range?.to) {
                  setIsDatePickerOpen(false);
                }
              }}
              numberOfMonths={2} // Show two months for easier range selection
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

/**
 * Clinic Filter Component
 *
 * Provides a UI for selecting one or more clinics to filter dashboard data.
 * Features include:
 * - Multi-select combobox interface with search functionality
 * - Integration with React Query for data fetching with caching and suspense
 * - Synchronization with the global filter store
 *
 * @returns {JSX.Element} The rendered clinic filter component
 */
export function ClinicFilter() {
  const { selectedClinics, setSelectedClinics } = useFilterStore();
  const { data: clinics = [], isLoading } = useSuspenseQuery({
    queryKey: ["clinics"], // Unique key for caching and invalidation
    queryFn: fetchClinics, // Function that fetches the data
  });

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

/**
 * Provider Filter Component
 *
 * Provides a UI for selecting one or more providers to filter dashboard data.
 * Features include:
 * - Multi-select combobox interface with search functionality
 * - Integration with React Query for data fetching with caching and suspense
 * - Synchronization with the global filter store
 *
 * @returns {JSX.Element} The rendered provider filter component
 */
export function ProviderFilter() {
  const { selectedProviders, setSelectedProviders } = useFilterStore();
  const { data: providers = [], isLoading } = useSuspenseQuery({
    queryKey: ["providers"],
    queryFn: fetchProviders,
  });

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

  const updateUrlParams = useCallback(() => {
    const params = createFilterUrlParams();
    router.replace(`${pathname}?${params.toString()}`);
  }, [router, pathname]);

  useEffect(() => {
    parseFilterUrlParams(searchParams);
  }, [searchParams]);

  const filtersRef = useRef({ timePeriod, startDate, endDate, selectedClinics, selectedProviders });

  useEffect(() => {
    const prevFilters = filtersRef.current;
    const filtersChanged =
      prevFilters.timePeriod !== timePeriod ||
      prevFilters.startDate !== startDate ||
      prevFilters.endDate !== endDate ||
      prevFilters.selectedClinics !== selectedClinics ||
      prevFilters.selectedProviders !== selectedProviders;

    if (filtersChanged) {
      // Update the reference to current filter values
      filtersRef.current = { timePeriod, startDate, endDate, selectedClinics, selectedProviders };

      // Update URL parameters with new filter values
      const timeoutId = setTimeout(() => {
        updateUrlParams();

        // Invalidate queries that depend on the filter values
        const filterDependentQueries = [
          "dashboard",
          "metrics",
          "appointments",
          "patients",
          "providers",
          "financial",
        ];
        for (const queryKey of filterDependentQueries) {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        }
      }, 300); // Small delay to avoid excessive URL updates for quick successive changes

      return () => clearTimeout(timeoutId);
    }
  }, [
    timePeriod,
    startDate,
    endDate,
    selectedClinics,
    selectedProviders,
    queryClient,
    updateUrlParams,
  ]);

  // Calculate the count of active filters
  const activeFilterCount =
    (timePeriod !== "monthly" ? 1 : 0) + // Count non-default time period
    (selectedClinics.length > 0 ? 1 : 0) + // Count if any clinics are selected
    (selectedProviders.length > 0 ? 1 : 0); // Count if any providers are selected

  return (
    <div ref={filterBarRef} className="w-full space-y-2">
      {/* Filter bar toggle button with filter count badge */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {/* Reset and clear buttons - only shown when filters are active */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-1 text-muted-foreground"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefaults}
              className="flex items-center gap-1 text-muted-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </Button>
          </div>
        )}
      </div>

      {/* Animated expandable filter panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card>
              <CardContent className="p-4">
                <Accordion
                  type="single"
                  collapsible
                  value={activeAccordion || undefined}
                  onValueChange={(value) => setActiveAccordion(value)}
                  className="w-full"
                >
                  {/* Time period filter section */}
                  <AccordionItem value="time-period">
                    <AccordionTrigger>Time Period</AccordionTrigger>
                    <AccordionContent>
                      <TimePeriodFilter />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Clinic filter section */}
                  <AccordionItem value="clinics">
                    <AccordionTrigger>Clinics</AccordionTrigger>
                    <AccordionContent>
                      <ClinicFilter />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Provider filter section */}
                  <AccordionItem value="providers">
                    <AccordionTrigger>Providers</AccordionTrigger>
                    <AccordionContent>
                      <ProviderFilter />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Import required icons
function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
