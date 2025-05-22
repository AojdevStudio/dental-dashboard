/**
 * @fileoverview Multi-Select Combobox Component
 * 
 * This file implements a reusable multi-select combobox component used in the dashboard filters.
 * It provides a searchable dropdown interface that allows users to select multiple items
 * from a list. The component includes features like search filtering, selection badges,
 * keyboard navigation, and clear all functionality.
 */

"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Represents an item in the multi-select combobox
 * 
 * @typedef {Object} ComboboxItem
 * @property {string} value - The unique identifier for the item
 * @property {string} label - The display text shown to the user
 */
export type ComboboxItem = {
  value: string;
  label: string;
};

/**
 * Props for the MultiSelectCombobox component
 * 
 * @interface MultiSelectComboboxProps
 * @property {ComboboxItem[]} items - Array of items to display in the dropdown
 * @property {string[]} selectedValues - Array of currently selected item values
 * @property {function} onValueChange - Callback fired when selection changes
 * @property {string} placeholder - Text displayed when no items are selected
 * @property {string} [searchPlaceholder="Search..."] - Placeholder for the search input
 * @property {string} [emptyMessage="No items found."] - Message shown when search returns no results
 * @property {string} [className] - Additional CSS classes to apply to the component
 * @property {boolean} [disabled=false] - Whether the combobox is disabled
 */
interface MultiSelectComboboxProps {
  items: ComboboxItem[];
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Multi-Select Combobox Component
 * 
 * A reusable component that provides a searchable, multi-select dropdown interface.
 * It allows users to select multiple items from a list, with features including:
 * - Search filtering to quickly find items
 * - Selection badges that can be individually removed
 * - Keyboard navigation support
 * - Clear all functionality
 * - Disabled state support
 * 
 * This component is built using Radix UI primitives (via shadcn/ui) and is fully
 * accessible, supporting keyboard navigation, screen readers, and proper ARIA attributes.
 * 
 * @param {MultiSelectComboboxProps} props - The component props
 * @returns {JSX.Element} The rendered multi-select combobox component
 */
export function MultiSelectCombobox({
  items,
  selectedValues,
  onValueChange,
  placeholder,
  searchPlaceholder = "Search...",
  emptyMessage = "No items found.",
  className,
  disabled = false,
}: MultiSelectComboboxProps) {
  /**
   * State to track whether the dropdown is open
   * 
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [open, setOpen] = React.useState(false);

  /**
   * Handles selection/deselection of an item
   * 
   * When an item is clicked in the dropdown:
   * - If already selected: Removes it from the selection
   * - If not selected: Adds it to the selection
   * 
   * @param {string} value - The value of the item to toggle
   * @returns {void}
   */
  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      onValueChange(selectedValues.filter((item) => item !== value));
    } else {
      onValueChange([...selectedValues, value]);
    }
  };

  /**
   * Handles removal of an item via the badge's remove button
   * 
   * @param {string} value - The value of the item to remove
   * @returns {void}
   */
  const handleRemove = (value: string) => {
    onValueChange(selectedValues.filter((item) => item !== value));
  };

  /**
   * Clears all selected items
   * 
   * @returns {void}
   */
  const handleClear = () => {
    onValueChange([]);
  };

  /**
   * Render the multi-select combobox interface
   * 
   * The component consists of two main parts:
   * 1. A button that displays the selected items as badges and opens the dropdown
   * 2. A dropdown with search input and selectable items
   * 
   * @returns {JSX.Element} The rendered multi-select combobox
   */
  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            type="button" /* Adding explicit type prop to fix lint error */
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              selectedValues.length > 0 ? "h-full min-h-10" : "h-10"
            )}
            disabled={disabled}
          >
            {/* Display selected items as badges or placeholder text */}
            <div className="flex flex-wrap gap-1 max-w-[90%]">
              {selectedValues.length > 0 ? (
                selectedValues.map((value) => (
                  <Badge key={value} variant="secondary" className="mr-1 mb-1">
                    {items.find((item) => item.value === value)?.label || value}
                    {/* Remove button for each selected item */}
                    <button
                      type="button" /* Adding explicit type prop to fix lint error */
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRemove(value);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(value);
                      }}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {value}</span>
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          {/* Command menu for searching and selecting items */}
          <Command>
            {/* Search input */}
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              {/* Message shown when no items match the search */}
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {/* Render each item in the dropdown */}
                {items.map((item) => {
                  const isSelected = selectedValues.includes(item.value);
                  return (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      onSelect={() => handleSelect(item.value)}
                    >
                      {/* Checkmark icon for selected items */}
                      <Check
                        className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
                      />
                      {item.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
            {/* Clear all button - only shown when items are selected */}
            {selectedValues.length > 0 && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  type="button" /* Adding explicit type prop to fix lint error */
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={handleClear}
                >
                  Clear all selections
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
