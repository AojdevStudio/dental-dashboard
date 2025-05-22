/**
 * @fileoverview Spreadsheet Selector Component
 * 
 * This file implements a component for selecting Google Spreadsheets within the dental dashboard.
 * It fetches available spreadsheets from the Google Sheets API via a server endpoint,
 * and provides a dropdown interface for users to select a spreadsheet for data import
 * or integration. The component handles loading states, error conditions, and empty states
 * to provide a complete user experience.
 */

"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // If needed for wrapping

/**
 * Represents a Google Spreadsheet
 * 
 * @typedef {Object} Spreadsheet
 * @property {string} id - The unique identifier for the spreadsheet in Google's system
 * @property {string} name - The display name of the spreadsheet
 */
interface Spreadsheet {
  id: string;
  name: string;
}

/**
 * Expected response structure from the Google Sheets API endpoint
 * 
 * @typedef {Object} ListSpreadsheetsResponse
 * @property {Spreadsheet[]} [spreadsheets] - Array of spreadsheets when request is successful
 * @property {string} [error] - Error message when request fails
 * @property {string} [details] - Additional error details when available
 */
interface ListSpreadsheetsResponse {
  spreadsheets?: Spreadsheet[];
  error?: string;
  details?: string;
}

/**
 * Props for the SpreadsheetSelector component
 * 
 * @typedef {Object} SpreadsheetSelectorProps
 * @property {string} clinicId - Identifier for the current clinic to scope spreadsheet access
 * @property {function} onSpreadsheetSelected - Callback function triggered when a spreadsheet is selected
 */
interface SpreadsheetSelectorProps {
  clinicId: string; // To scope spreadsheet fetching if necessary or pass along
  onSpreadsheetSelected: (spreadsheet: Spreadsheet) => void;
  // accessToken?: string; // Optional: if client-side fetching with token is used
}

/**
 * Fetches available Google Spreadsheets from the API
 * 
 * This function makes a request to the server-side API endpoint that interfaces with
 * Google Sheets API. It handles error responses by parsing the error details and
 * throwing an appropriate error with a descriptive message.
 * 
 * @param {string} clinicId - The ID of the clinic to fetch spreadsheets for
 * @returns {Promise<Spreadsheet[]>} Promise resolving to an array of available spreadsheets
 * @throws {Error} If the API request fails, with details from the response when available
 */
const fetchSpreadsheets = async (clinicId: string): Promise<Spreadsheet[]> => {
  // TODO: Confirm the actual API endpoint. Using /api/google/sheets for now, assuming it can filter by clinicId or that the API handles authorization correctly.
  // If the API endpoint is just /api/google/sheets and returns all user spreadsheets, filtering might need to happen client-side or be adjusted based on actual API design.
  const response = await fetch(`/api/google/sheets?clinicId=${clinicId}`);
  if (!response.ok) {
    const errorData: ListSpreadsheetsResponse = await response.json();
    throw new Error(errorData.error || errorData.details || "Failed to fetch spreadsheets");
  }
  const data: ListSpreadsheetsResponse = await response.json();
  return data.spreadsheets || [];
};

/**
 * Spreadsheet Selector Component
 * 
 * Provides a dropdown interface for users to select a Google Spreadsheet.
 * The component fetches available spreadsheets using React Query and handles
 * various states including loading, error, and empty results.
 * 
 * Features:
 * - Fetches spreadsheets scoped to the current clinic
 * - Caches results with React Query for performance
 * - Shows appropriate loading states with skeletons
 * - Displays helpful error messages when fetching fails
 * - Provides empty state guidance when no spreadsheets are available
 * 
 * @param {SpreadsheetSelectorProps} props - The component props
 * @returns {JSX.Element} The rendered spreadsheet selector component
 */
export function SpreadsheetSelector({ clinicId, onSpreadsheetSelected }: SpreadsheetSelectorProps) {
  /**
   * Fetch spreadsheets data using React Query
   * 
   * This query fetches the list of available Google Spreadsheets for the specified clinic.
   * It includes configuration for:
   * - Caching: Data is considered fresh for 5 minutes (staleTime)
   * - Garbage collection: Unused data is kept in cache for 10 minutes (gcTime)
   * - Retry behavior: Failed requests are retried once
   * - Conditional execution: Query only runs when clinicId is available
   * 
   * @type {UseQueryResult<Spreadsheet[], Error>}
   */
  const {
    data: spreadsheets,
    error,
    isLoading,
  } = useQuery<Spreadsheet[], Error>({
    queryKey: ["spreadsheets", clinicId], // Cache key includes clinicId for proper cache invalidation
    queryFn: () => fetchSpreadsheets(clinicId),
    enabled: !!clinicId, // Only run query when clinicId is available
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
    retry: 1, // Retry failed requests once
  });

  /**
   * Handles selection of a spreadsheet from the dropdown
   * 
   * When a user selects a spreadsheet from the dropdown, this function finds the
   * corresponding spreadsheet object by ID and passes it to the onSpreadsheetSelected
   * callback provided by the parent component.
   * 
   * @param {string} spreadsheetId - The ID of the selected spreadsheet
   * @returns {void}
   */
  const handleValueChange = (spreadsheetId: string) => {
    if (!spreadsheets) return;
    const selected = spreadsheets.find((s) => s.id === spreadsheetId);
    if (selected) {
      onSpreadsheetSelected(selected);
    }
  };

  /**
   * Render loading state while spreadsheets are being fetched
   * 
   * Displays a skeleton UI with a loading message to indicate that spreadsheets
   * are being fetched from the Google Sheets API. This provides visual feedback
   * to the user during the loading process.
   * 
   * @returns {JSX.Element} Skeleton UI with loading message
   */
  if (isLoading) {
    return (
      <div className="space-y-2 w-full">
        <Label htmlFor="spreadsheet-selector-loading">Select Spreadsheet</Label>
        <Skeleton className="h-10 w-full" id="spreadsheet-selector-loading" />
        <p className="text-sm text-muted-foreground">Loading spreadsheets...</p>
      </div>
    );
  }

  /**
   * Render error state when spreadsheet fetching fails
   * 
   * Displays an error message with details about why the spreadsheet fetching failed.
   * This helps users understand what went wrong and potentially how to fix it.
   * 
   * @returns {JSX.Element} Error message UI
   */
  if (error) {
    return (
      <div className="space-y-2 w-full">
        <Label htmlFor="spreadsheet-selector-error">Select Spreadsheet</Label>
        <div
          id="spreadsheet-selector-error"
          className="text-destructive border border-destructive/50 rounded-md p-3"
        >
          <p className="font-medium">Error loading spreadsheets:</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  /**
   * Render empty state when no spreadsheets are available
   * 
   * Displays a message indicating that no spreadsheets were found and provides
   * guidance on how to resolve this issue. This helps users understand what
   * steps they need to take to connect their Google account or gain access to spreadsheets.
   * 
   * @returns {JSX.Element} Empty state UI with guidance
   */
  if (!spreadsheets || spreadsheets.length === 0) {
    return (
      <div className="space-y-2 w-full">
        <Label htmlFor="spreadsheet-selector-empty">Select Spreadsheet</Label>
        <div
          id="spreadsheet-selector-empty"
          className="border border-border rounded-md p-3 text-muted-foreground"
        >
          <p>
            No spreadsheets found. Ensure your Google account is connected and has access to
            spreadsheets.
          </p>
        </div>
      </div>
    );
  }

  /**
   * Render the spreadsheet selector dropdown
   * 
   * Displays a dropdown menu containing all available spreadsheets for the user to select.
   * When a spreadsheet is selected, the handleValueChange function is called to notify
   * the parent component via the onSpreadsheetSelected callback.
   * 
   * @returns {JSX.Element} Spreadsheet selector dropdown UI
   */
  return (
    <div className="space-y-2 w-full">
      <Label htmlFor="spreadsheet-selector">Select Spreadsheet</Label>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-full" id="spreadsheet-selector">
          <SelectValue placeholder="Select a spreadsheet" />
        </SelectTrigger>
        <SelectContent>
          {/* Map through available spreadsheets to create dropdown options */}
          {spreadsheets.map((spreadsheet) => (
            <SelectItem key={spreadsheet.id} value={spreadsheet.id}>
              {spreadsheet.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
