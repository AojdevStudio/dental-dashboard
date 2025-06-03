"use client";

import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { type TopNavProps } from "@/lib/types/layout";
import { UserNav } from "./user-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Calendar as CalendarIcon, Search, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import * as React from "react";

export function TopNav({
  className,
  showDateRangePicker = true,
  showSearch = true,
  showNotifications = true,
}: TopNavProps) {
  const { user, isAuthenticated } = useAuth();
  
  // Date range state
  const [dateRange, setDateRange] = React.useState<{
    from: Date;
    to?: Date;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(), // today
  });
  
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4",
        className
      )}
    >
      {/* Left section - Search and Date Range */}
      <div className="flex flex-1 items-center gap-4">
        {showSearch && (
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 pr-4"
              aria-label="Search"
            />
          </div>
        )}
        
        {showDateRangePicker && (
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "hidden md:flex items-center gap-2 justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
                aria-label="Select date range"
              >
                <CalendarIcon className="h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
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
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  if (range) {
                    setDateRange({
                      from: range.from || new Date(),
                      to: range.to,
                    });
                    // Close popover when complete range is selected
                    if (range.from && range.to) {
                      setIsDatePickerOpen(false);
                    }
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Right section - Actions and User */}
      <div className="flex items-center gap-2">
        {showNotifications && (
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-destructive" />
            <span className="absolute -right-1 -top-1 text-xs font-semibold text-destructive">
              3
            </span>
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>

        <div className="ml-2 border-l pl-2">
          {isAuthenticated ? (
            <UserNav />
          ) : (
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}