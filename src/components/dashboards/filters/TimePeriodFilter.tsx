/**
 * @fileoverview Time Period Filter Component
 *
 * This file implements a filter component for selecting time periods in the dashboard.
 * It allows users to choose from predefined time periods (daily, weekly, monthly, etc.)
 * or select a custom date range using a calendar interface. The component integrates
 * with the global filter store to maintain filter state across the application.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type TimePeriod, useFilterStore } from "@/hooks/useFilterStore";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

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
 * Time Period Filter Component
 *
 * Provides a UI for selecting time periods for dashboard data filtering.
 * Features include:
 * - Dropdown for selecting predefined time periods (daily, weekly, monthly, etc.)
 * - Calendar interface for selecting custom date ranges when 'custom' is selected
 * - Integration with the global filter store to maintain state across components
 * - Automatic synchronization between the UI state and the filter store
 *
 * @returns {JSX.Element} The rendered time period filter component
 */
export function TimePeriodFilter() {
  /**
   * Extract time period filter state and setters from the global filter store
   *
   * This includes:
   * - timePeriod: The currently selected time period (daily, weekly, monthly, etc.)
   * - startDate/endDate: The selected date range (used when timePeriod is 'custom')
   * - setTimePeriod: Function to update the selected time period
   * - setDateRange: Function to update the custom date range
   */
  const { timePeriod, startDate, endDate, setTimePeriod, setDateRange } = useFilterStore();

  /**
   * State to track whether the date picker popover is open
   *
   * This is used to control the visibility of the calendar popover when
   * selecting a custom date range.
   *
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);

  /**
   * Local state for the selected date range
   *
   * This state is used to track the date selection within the calendar component
   * before it's committed to the global filter store. It's initialized with the
   * values from the filter store.
   *
   * @type {[{from: Date, to?: Date}, React.Dispatch<React.SetStateAction<{from: Date, to?: Date}>>]}
   */
  const [date, setDate] = React.useState<{
    from: Date;
    to?: Date;
  }>({
    from: startDate,
    to: endDate,
  });

  /**
   * Effect to update the global filter store when the local date range changes
   *
   * This synchronizes the local component state with the global filter store
   * when the user selects a complete date range (both from and to dates).
   *
   * @returns {void}
   */
  React.useEffect(() => {
    if (date.from && date.to) {
      setDateRange(date.from, date.to);
    }
  }, [date, setDateRange]);

  /**
   * Effect to update the local date state when the global filter store changes
   *
   * This ensures that the local component state stays in sync with the global
   * filter store, which might be updated by other components or URL parameters.
   *
   * @returns {void}
   */
  React.useEffect(() => {
    setDate({
      from: startDate,
      to: endDate,
    });
  }, [startDate, endDate]);

  /**
   * Render the time period filter interface
   *
   * The component renders differently based on the selected time period:
   * - For all time periods: A dropdown to select the time period type
   * - For 'custom' time period only: A date range picker with calendar interface
   *
   * The layout is responsive:
   * - On mobile: Components stack vertically
   * - On desktop: Components align horizontally
   *
   * @returns {JSX.Element} The rendered filter interface
   */
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
