/**
 * @fileoverview Spreadsheet Selector Component
 * 
 * This file implements a component for selecting Google Sheets spreadsheets
 * for integration with the dental dashboard. It allows users to browse and select
 * spreadsheets from their connected Google account.
 */

"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Interface for a Google Spreadsheet object
 * 
 * @property {string} id - Unique identifier for the spreadsheet
 * @property {string} name - Display name of the spreadsheet
 * @property {string} url - URL to access the spreadsheet
 * @property {string} [modifiedTime] - Last modified timestamp
 * @property {string} [iconUrl] - URL for the spreadsheet's icon
 */
interface GoogleSpreadsheet {
  id: string;
  name: string;
  url: string;
  modifiedTime?: string;
  iconUrl?: string;
}

/**
 * Interface for SpreadsheetSelector component properties
 * 
 * @property {GoogleSpreadsheet[]} [spreadsheets] - List of available spreadsheets
 * @property {string} [selectedId] - ID of the currently selected spreadsheet
 * @property {(id: string) => void} [onSelect] - Callback for spreadsheet selection
 * @property {() => void} [onRefresh] - Callback to refresh the spreadsheet list
 * @property {boolean} [isLoading] - Whether the component is in loading state
 * @property {boolean} [isRefreshing] - Whether the list is being refreshed
 */
interface SpreadsheetSelectorProps {
  spreadsheets?: GoogleSpreadsheet[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
}

/**
 * Sample spreadsheet data for demonstration
 * This would be replaced with actual data from the Google Sheets API in production.
 */
const sampleSpreadsheets: GoogleSpreadsheet[] = [
  {
    id: "spreadsheet-1",
    name: "Dental Practice Financial Data 2025",
    url: "https://docs.google.com/spreadsheets/d/sample1",
    modifiedTime: "2025-05-15T14:30:00Z",
  },
  {
    id: "spreadsheet-2",
    name: "Patient Metrics Q1 2025",
    url: "https://docs.google.com/spreadsheets/d/sample2",
    modifiedTime: "2025-05-10T09:15:00Z",
  },
  {
    id: "spreadsheet-3",
    name: "Provider Performance Tracking",
    url: "https://docs.google.com/spreadsheets/d/sample3",
    modifiedTime: "2025-05-01T11:45:00Z",
  },
];

/**
 * Spreadsheet Selector Component
 * 
 * A component for selecting Google Sheets spreadsheets for integration.
 * Features include:
 * - Dropdown for selecting from available spreadsheets
 * - Search functionality to filter spreadsheets by name
 * - Refresh button to update the list of available spreadsheets
 * - Loading and refreshing states
 * 
 * @param {SpreadsheetSelectorProps} props - Component properties
 * @returns {JSX.Element} The rendered spreadsheet selector component
 */
export function SpreadsheetSelector({
  spreadsheets = sampleSpreadsheets,
  selectedId,
  onSelect,
  onRefresh,
  isLoading = false,
  isRefreshing = false,
}: SpreadsheetSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Filter spreadsheets based on search query
  const filteredSpreadsheets = React.useMemo(() => {
    if (!searchQuery.trim()) return spreadsheets;
    
    return spreadsheets.filter((sheet) =>
      sheet.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [spreadsheets, searchQuery]);
  
  // Handle spreadsheet selection
  const handleSelect = (id: string) => {
    if (onSelect) {
      onSelect(id);
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };
  
  // Only show loading state if isLoading is true
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-9" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and refresh controls */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search spreadsheets..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {/* Spreadsheet selection dropdown */}
      <Select
        value={selectedId}
        onValueChange={handleSelect}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a spreadsheet" />
        </SelectTrigger>
        <SelectContent>
          {filteredSpreadsheets.length > 0 ? (
            filteredSpreadsheets.map((sheet) => (
              <SelectItem key={sheet.id} value={sheet.id}>
                <div className="flex flex-col">
                  <span>{sheet.name}</span>
                  {sheet.modifiedTime && (
                    <span className="text-xs text-muted-foreground">
                      Modified: {new Date(sheet.modifiedTime).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-center text-sm text-muted-foreground">
              {searchQuery.trim()
                ? "No spreadsheets match your search"
                : "No spreadsheets available"}
            </div>
          )}
        </SelectContent>
      </Select>
      
      {/* Show selected spreadsheet URL if available */}
      {selectedId && (
        <div className="text-sm text-muted-foreground">
          Selected: {spreadsheets.find(s => s.id === selectedId)?.name}
        </div>
      )}
    </div>
  );
}
