/**
 * @fileoverview Sheet Connector Component
 *
 * This file implements a component for connecting Google Sheets to the dental dashboard.
 * It allows users to select a specific sheet (tab) from a spreadsheet and map columns
 * to required data fields (date, production, collection). The component handles
 * fetching sheet metadata, loading headers, and validating column mappings before
 * establishing the connection.
 *
 * The component integrates with the Google Sheets API via server endpoints and uses
 * React Query for data fetching, caching, and state management.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/**
 * Represents a sheet (tab) within a Google Spreadsheet
 *
 * @typedef {Object} Sheet
 * @property {string} id - The unique identifier for the sheet within the spreadsheet
 * @property {string} title - The display name of the sheet (tab name)
 */
interface Sheet {
  id: string; // Or number, depending on API, API returns number for sheetId
  title: string;
}

/**
 * Response structure from the sheets API endpoint
 *
 * @typedef {Object} SheetsApiResponse
 * @property {string} spreadsheetId - The ID of the spreadsheet
 * @property {string} spreadsheetTitle - The title of the spreadsheet
 * @property {Sheet[]} sheets - Array of sheets (tabs) in the spreadsheet
 * @property {string} [error] - Error message if request fails
 */
interface SheetsApiResponse {
  spreadsheetId: string;
  spreadsheetTitle: string;
  sheets: Sheet[]; // Assuming this structure based on API work
  error?: string;
}

/**
 * Response structure from the sheet headers API endpoint
 *
 * @typedef {Object} SheetHeadersApiResponse
 * @property {string[][]} [values] - 2D array of cell values, headers are in the first row
 * @property {string} [error] - Error message if request fails
 */
interface SheetHeadersApiResponse {
  values?: string[][]; // Google API returns a 2D array, headers are the first row
  error?: string;
  // Headers might also be a specific flat array depending on backend processing
  // For now, assume values[0] contains headers if values exist.
}

/**
 * Represents a column header in a spreadsheet
 *
 * @typedef {Object} SheetHeader
 * @property {string} key - Unique identifier for the header
 * @property {string} label - Display text of the header
 */
interface SheetHeader {
  key: string;
  label: string; // This would be the actual header string
}

/**
 * Mapping of required data fields to spreadsheet column headers
 *
 * @typedef {Object} ColumnMapping
 * @property {string|null} date - Header of the column containing date data
 * @property {string|null} production - Header of the column containing production data
 * @property {string|null} collection - Header of the column containing collection data
 */
interface ColumnMapping {
  date: string | null;
  production: string | null;
  collection: string | null;
}

/**
 * Props for the SheetConnector component
 *
 * @typedef {Object} SheetConnectorProps
 * @property {string} clinicId - ID of the current clinic to scope data access
 * @property {string|null} spreadsheetId - ID of the selected Google Spreadsheet
 */
interface SheetConnectorProps {
  clinicId: string;
  spreadsheetId: string | null;
  /**
   * Callback function when a sheet is successfully connected
   * @param {string} spreadsheetId - ID of the selected spreadsheet
   * @param {string} sheetName - Name of the selected sheet
   * @param {ColumnMapping} columnMapping - Mapping of required fields to sheet columns
   * @returns {void}
   */
  onSheetConnected: (
    spreadsheetId: string,
    sheetName: string,
    columnMapping: ColumnMapping
  ) => void;

  /**
   * Callback function when the user cancels the sheet connection process
   * @returns {void}
   */
  onCancel: () => void;
}

/**
 * Fetches the list of sheets (tabs) in a Google Spreadsheet
 *
 * Makes an API call to the server endpoint that interfaces with Google Sheets API
 * to retrieve metadata about all sheets in the specified spreadsheet.
 *
 * @param {string} spreadsheetId - The ID of the Google Spreadsheet to fetch sheets from
 * @param {string} dataSourceId - The clinic ID to scope data access permissions
 * @returns {Promise<Sheet[]>} Promise resolving to an array of sheet objects
 * @throws {Error} If the API request fails or returns an error
 */
async function fetchSheets(
  spreadsheetId: string,
  dataSourceId: string // Added dataSourceId
): Promise<Sheet[]> {
  if (!spreadsheetId || !dataSourceId) return [];

  // Actual API call
  const response = await fetch(`/api/google/sheets/${spreadsheetId}?dataSourceId=${dataSourceId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Catch if response.json() fails
    throw new Error(
      `Failed to fetch sheets: ${response.status} ${response.statusText}. ${errorData.error || ""}`.trim()
    );
  }
  const data: SheetsApiResponse = await response.json();
  if (data.error) {
    throw new Error(`Failed to fetch sheets: ${data.error}`);
  }
  return data.sheets || []; // Return sheets array, or empty if undefined
}

/**
 * Fetches the column headers from the first row of a specific sheet
 *
 * Makes an API call to retrieve the first row of the specified sheet, which contains
 * the column headers. Handles special characters in sheet names and properly encodes
 * the range parameter for the API request.
 *
 * @param {string} spreadsheetId - The ID of the Google Spreadsheet
 * @param {string} sheetName - The name of the sheet (tab) to fetch headers from
 * @param {string} dataSourceId - The clinic ID to scope data access permissions
 * @returns {Promise<string[]>} Promise resolving to an array of header strings
 * @throws {Error} If the API request fails or returns an error
 */
async function fetchSheetHeaders(
  spreadsheetId: string,
  sheetName: string, // sheetName is used to construct the range
  dataSourceId: string // Added dataSourceId
): Promise<string[]> {
  if (!spreadsheetId || !sheetName || !dataSourceId) return [];

  // Construct range for the first row of the given sheet.
  // Sheet names with spaces or special chars need to be quoted.
  const safeSheetName =
    sheetName.includes(" ") || sheetName.includes("!")
      ? `'${sheetName.replace(/'/g, "''")}'`
      : sheetName;
  const range = `${safeSheetName}!1:1`; // Fetch first row for headers

  const response = await fetch(
    `/api/google/sheets/${spreadsheetId}/data?range=${encodeURIComponent(range)}&dataSourceId=${dataSourceId}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to fetch sheet headers: ${response.status} ${response.statusText}. ${errorData.error || ""}`.trim()
    );
  }
  const data: SheetHeadersApiResponse = await response.json();
  if (data.error) {
    throw new Error(`Failed to fetch sheet headers: ${data.error}`);
  }

  // Extract headers from the first row of values
  if (data.values && data.values.length > 0 && data.values[0]) {
    return data.values[0].filter((header) => header && header.trim() !== ""); // Filter out empty headers
  }
  return [];
}

/**
 * Sheet Connector Component
 *
 * Provides a multi-step interface for connecting a Google Sheet to the dental dashboard.
 * The component guides users through:
 * 1. Selecting a sheet (tab) from the spreadsheet
 * 2. Mapping required data columns (date, production, collection) to sheet headers
 * 3. Validating the mapping and establishing the connection
 *
 * Features:
 * - Fetches available sheets using React Query for caching and error handling
 * - Dynamically loads column headers when a sheet is selected
 * - Validates that all required fields are mapped before allowing connection
 * - Provides clear error messages and loading states
 * - Allows cancellation at any point in the process
 *
 * @param {SheetConnectorProps} props - Component props
 * @returns {JSX.Element} The rendered sheet connector component
 */
const SheetConnector: React.FC<SheetConnectorProps> = ({
  clinicId,
  spreadsheetId,
  onSheetConnected,
  onCancel,
}) => {
  const [selectedSheetName, setSelectedSheetName] = useState<string | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    date: null,
    production: null,
    collection: null,
  });

  /**
   * Fetch available sheets using React Query
   *
   * This query fetches the list of sheets (tabs) in the selected spreadsheet.
   * It's only enabled when both spreadsheetId and clinicId are available.
   */
  const {
    data: sheets,
    error: sheetsError,
    isLoading: sheetsLoading,
  } = useQuery<Sheet[], Error>({
    queryKey: ["sheets", spreadsheetId, clinicId],
    queryFn: () => fetchSheets(spreadsheetId!, clinicId),
    enabled: !!spreadsheetId && !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  /**
   * Fetch sheet headers using React Query
   *
   * This query fetches the column headers from the first row of the selected sheet.
   * It's only enabled when a sheet is selected and all required parameters are available.
   */
  const {
    data: headers,
    error: headersError,
    isLoading: headersLoading,
  } = useQuery<string[], Error>({
    queryKey: ["sheetHeaders", spreadsheetId, selectedSheetName, clinicId],
    queryFn: () => fetchSheetHeaders(spreadsheetId!, selectedSheetName!, clinicId),
    enabled: !!spreadsheetId && !!selectedSheetName && !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  /**
   * Reset column mapping when sheet selection changes
   *
   * When the user selects a different sheet, clear any existing column mappings
   * since the headers will be different.
   */
  useEffect(() => {
    setColumnMapping({
      date: null,
      production: null,
      collection: null,
    });
  }, []);

  /**
   * Handles sheet selection from the dropdown
   *
   * @param {string} sheetName - The name of the selected sheet
   */
  const handleSheetSelect = (sheetName: string) => {
    setSelectedSheetName(sheetName);
  };

  /**
   * Handles column mapping for required data fields
   *
   * @param {keyof ColumnMapping} type - The type of data field (date, production, collection)
   * @param {string | null} header - The selected column header or null to clear
   */
  const handleColumnMap = (type: keyof ColumnMapping, header: string | null) => {
    setColumnMapping((prev) => ({
      ...prev,
      [type]: header,
    }));
  };

  /**
   * Handles the connection process
   *
   * Validates that all required fields are mapped and calls the onSheetConnected callback
   * with the spreadsheet ID, sheet name, and column mapping.
   */
  const handleConnect = () => {
    if (!spreadsheetId || !selectedSheetName) return;

    // Validate that all required fields are mapped
    if (!columnMapping.date || !columnMapping.production || !columnMapping.collection) {
      alert("Please map all required fields (Date, Production, Collection) before connecting.");
      return;
    }

    onSheetConnected(spreadsheetId, selectedSheetName, columnMapping);
  };

  /**
   * Check if all required fields are mapped for enabling the connect button
   */
  const isConnectEnabled =
    selectedSheetName && columnMapping.date && columnMapping.production && columnMapping.collection;

  /**
   * Render loading state while fetching sheets
   */
  if (sheetsLoading) {
    return (
      <div className="space-y-4 p-4">
        <h3 className="text-lg font-medium">Connect Google Sheet</h3>
        <div className="space-y-2">
          <Label>Select Sheet</Label>
          <Skeleton className="h-10 w-full" />
        </div>
        <p className="text-sm text-muted-foreground">Loading available sheets...</p>
      </div>
    );
  }

  /**
   * Render error state if sheet fetching fails
   */
  if (sheetsError) {
    return (
      <div className="space-y-4 p-4">
        <h3 className="text-lg font-medium">Connect Google Sheet</h3>
        <div className="text-destructive border border-destructive/50 rounded-md p-3">
          <p className="font-medium">Error loading sheets:</p>
          <p className="text-sm">{sheetsError.message}</p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  /**
   * Render empty state if no sheets are available
   */
  if (!sheets || sheets.length === 0) {
    return (
      <div className="space-y-4 p-4">
        <h3 className="text-lg font-medium">Connect Google Sheet</h3>
        <div className="border border-border rounded-md p-3 text-muted-foreground">
          <p>No sheets found in this spreadsheet.</p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  /**
   * Render the main sheet connector interface
   */
  return (
    <div className="space-y-6 p-4">
      <h3 className="text-lg font-medium">Connect Google Sheet</h3>

      {/* Sheet Selection */}
      <div className="space-y-2">
        <Label htmlFor="sheet-select">Select Sheet</Label>
        <Select onValueChange={handleSheetSelect}>
          <SelectTrigger id="sheet-select">
            <SelectValue placeholder="Choose a sheet from the spreadsheet" />
          </SelectTrigger>
          <SelectContent>
            {sheets.map((sheet) => (
              <SelectItem key={sheet.id} value={sheet.title}>
                {sheet.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Column Mapping Section - only show when sheet is selected */}
      {selectedSheetName && (
        <div className="space-y-4">
          <h4 className="font-medium">Map Data Columns</h4>
          <p className="text-sm text-muted-foreground">
            Map the required data fields to columns in your sheet:
          </p>

          {/* Show loading state while fetching headers */}
          {headersLoading && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Loading column headers...</p>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {/* Show error if header fetching fails */}
          {headersError && (
            <div className="text-destructive border border-destructive/50 rounded-md p-3">
              <p className="font-medium">Error loading column headers:</p>
              <p className="text-sm">{headersError.message}</p>
            </div>
          )}

          {/* Show column mapping dropdowns when headers are loaded */}
          {headers && headers.length > 0 && (
            <div className="grid gap-4">
              {/* Date Column Mapping */}
              <div className="space-y-2">
                <Label htmlFor="date-column">Date Column *</Label>
                <Select onValueChange={(value) => handleColumnMap("date", value)}>
                  <SelectTrigger id="date-column">
                    <SelectValue placeholder="Select the column containing dates" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((header, index) => (
                      <SelectItem key={index} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Production Column Mapping */}
              <div className="space-y-2">
                <Label htmlFor="production-column">Production Column *</Label>
                <Select onValueChange={(value) => handleColumnMap("production", value)}>
                  <SelectTrigger id="production-column">
                    <SelectValue placeholder="Select the column containing production data" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((header, index) => (
                      <SelectItem key={index} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Collection Column Mapping */}
              <div className="space-y-2">
                <Label htmlFor="collection-column">Collection Column *</Label>
                <Select onValueChange={(value) => handleColumnMap("collection", value)}>
                  <SelectTrigger id="collection-column">
                    <SelectValue placeholder="Select the column containing collection data" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((header, index) => (
                      <SelectItem key={index} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Show message if no headers found */}
          {headers && headers.length === 0 && (
            <div className="border border-border rounded-md p-3 text-muted-foreground">
              <p>No column headers found in the first row of this sheet.</p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleConnect} disabled={!isConnectEnabled}>
          Connect Sheet
        </Button>
      </div>
    </div>
  );
};

export default SheetConnector;
