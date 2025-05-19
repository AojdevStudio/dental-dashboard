"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
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
import { cn } from "@/lib/utils";
import { useFilterStore, type TimePeriod } from "@/hooks/useFilterStore";

const timePeriodOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "custom", label: "Custom Date Range" },
];

export function TimePeriodFilter() {
  const { timePeriod, startDate, endDate, setTimePeriod, setDateRange } = useFilterStore();

  // Track open state for the date picker popover
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);

  // For date range selection
  const [date, setDate] = React.useState<{
    from: Date;
    to?: Date;
  }>({
    from: startDate,
    to: endDate,
  });

  // Update filter store when date range changes
  React.useEffect(() => {
    if (date.from && date.to) {
      setDateRange(date.from, date.to);
    }
  }, [date, setDateRange]);

  // Update local date state when filter store changes
  React.useEffect(() => {
    setDate({
      from: startDate,
      to: endDate,
    });
  }, [startDate, endDate]);

  return (
    <div className="flex flex-col sm:flex-row gap-2">
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
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={{
                from: date?.from,
                to: date?.to,
              }}
              onSelect={(range) => {
                setDate(range as { from: Date; to?: Date });
                if (range?.from && range?.to) {
                  setIsDatePickerOpen(false);
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
