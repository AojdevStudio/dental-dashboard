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

export type ComboboxItem = {
  value: string;
  label: string;
};

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
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      onValueChange(selectedValues.filter((item) => item !== value));
    } else {
      onValueChange([...selectedValues, value]);
    }
  };

  const handleRemove = (value: string) => {
    onValueChange(selectedValues.filter((item) => item !== value));
  };

  const handleClear = () => {
    onValueChange([]);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              selectedValues.length > 0 ? "h-full min-h-10" : "h-10"
            )}
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1 max-w-[90%]">
              {selectedValues.length > 0 ? (
                selectedValues.map((value) => (
                  <Badge key={value} variant="secondary" className="mr-1 mb-1">
                    {items.find((item) => item.value === value)?.label || value}
                    <button
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
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {items.map((item) => {
                  const isSelected = selectedValues.includes(item.value);
                  return (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      onSelect={() => handleSelect(item.value)}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
                      />
                      {item.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
            {selectedValues.length > 0 && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
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
