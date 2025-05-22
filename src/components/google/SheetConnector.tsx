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

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Assuming headers are in the first row of the values array
  if (data.values && data.values.length > 0 && Array.isArray(data.values[0])) {
    return data.values[0].map(String); // Convert all header values to string
  }
  return []; // Return empty array if no headers found or unexpected format
}

/**
 * SheetConnector Component
 * 
 * Allows users to connect a Google Sheet to the dental dashboard by selecting
 * a specific sheet (tab) and mapping its columns to required data fields.
 * The component handles fetching available sheets, loading column headers,
 * and validating the column mapping before establishing the connection.
 *
 * Uses React Query for data fetching and state management, with appropriate
 * loading states, error handling, and UI feedback throughout the process.
 *
 * @component
 * @param {SheetConnectorProps} props - Component props
 * @returns {React.ReactElement} The rendered SheetConnector component
 */
const SheetConnector: React.FC<SheetConnectorProps> = ({
  clinicId,
  spreadsheetId,
  onSheetConnected,
  onCancel,
}) => {
  /**
   * State for the currently selected sheet name
   */
  const [selectedSheetName, setSelectedSheetName] = useState<string | null>(null);
  
  /**
   * State for the column mapping configuration
   * Maps required data fields (date, production, collection) to sheet column headers
   */
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    date: null,
    production: null,
    collection: null,
  });

  /**
   * Fetch the list of sheets (tabs) in the selected spreadsheet
   * Uses React Query for data fetching, caching, and state management
   */
  const {
    data: sheets,
    isLoading: isLoadingSheets,
    error: errorSheets,
  } = useQuery<Sheet[], Error>({
    queryKey: ["sheets", spreadsheetId, clinicId],
    queryFn: () => fetchSheets(spreadsheetId!, clinicId),
    enabled: !!spreadsheetId && !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  /**
   * Fetch the column headers from the selected sheet
   * Only enabled when a sheet is selected
   */
  const {
    data: sheetHeaders,
    isLoading: isLoadingHeaders,
    error: errorHeaders,
    refetch: refetchHeaders,
  } = useQuery<string[], Error>({
    queryKey: ["sheetHeaders", spreadsheetId, selectedSheetName, clinicId],
    queryFn: () => fetchSheetHeaders(spreadsheetId!, selectedSheetName!, clinicId),
    enabled: !!spreadsheetId && !!selectedSheetName && !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  /**
   * Event Handlers
   */
  
  /**
   * Handles selection of a sheet (tab) from the dropdown
   * Resets column mapping when sheet changes to ensure consistent mapping
   * 
   * @param {string} sheetName - The name of the selected sheet
   */
  const handleSheetSelect = (sheetName: string) => {
    setSelectedSheetName(sheetName);
    // Reset column mapping when sheet changes
    setColumnMapping({ date: null, production: null, collection: null });
  };

  /**
   * Updates the column mapping when a user selects a header for a specific data field
   * 
   * @param {keyof ColumnMapping} type - The data field to map (date, production, or collection)
   * @param {string|null} header - The selected column header from the sheet
   */
  const handleColumnMap = (type: keyof ColumnMapping, header: string | null) => {
    setColumnMapping((prev) => ({ ...prev, [type]: header }));
  };

  /**
   * Handles the connection confirmation action
   * Validates that all required fields are mapped before calling the onSheetConnected callback
   */
  const handleConnect = () => {
    if (
      spreadsheetId &&
      selectedSheetName &&
      columnMapping.date &&
      columnMapping.production &&
      columnMapping.collection
    ) {
      onSheetConnected(spreadsheetId, selectedSheetName, columnMapping as Required<ColumnMapping>);
    }
  };

  /**
   * Derived state to determine if connection can be established
   * All required fields must be mapped for the connect button to be enabled
   */
  const canConnect =
    !!selectedSheetName &&
    !!columnMapping.date &&
    !!columnMapping.production &&
    !!columnMapping.collection;

  // --- Render Logic ---
  if (!spreadsheetId) {
    return (
      <div className="p-4 border rounded-md bg-muted">
        <p className="text-sm text-muted-foreground">Please select a spreadsheet first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 border rounded-md">
      <div>
        <Label htmlFor="sheet-select">Select Sheet (Tab)</Label>
        {isLoadingSheets && <Skeleton className="h-10 w-full mt-1" />}
        {errorSheets && (
          <p className="text-sm text-destructive mt-1">
            Error loading sheets: {errorSheets.message}
          </p>
        )}
        {!isLoadingSheets &&
          !errorSheets &&
          sheets &&
          (sheets.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-1">
              No sheets found in this spreadsheet.
            </p>
          ) : (
            <Select
              value={selectedSheetName || ""}
              onValueChange={handleSheetSelect}
              disabled={isLoadingSheets || sheets.length === 0}
            >
              <SelectTrigger id="sheet-select" className="mt-1">
                <SelectValue placeholder="Select a sheet" />
              </SelectTrigger>
              <SelectContent>
                {sheets.map((sheet) => (
                  <SelectItem key={sheet.id} value={sheet.title}>
                    {sheet.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
      </div>

      {selectedSheetName && (
        <div>
          <h3 className="text-lg font-medium mb-2">Map Columns</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select the columns from your sheet that correspond to Date, Production, and Collection.
          </p>
          {isLoadingHeaders && (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {errorHeaders && (
            <p className="text-sm text-destructive">
              Error loading sheet headers: {errorHeaders.message}
            </p>
          )}
          {!isLoadingHeaders &&
            !errorHeaders &&
            sheetHeaders &&
            (sheetHeaders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No headers found in the selected sheet, or the sheet is empty.
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="date-column">Date Column</Label>
                  <Select
                    value={columnMapping.date || ""}
                    onValueChange={(value) => handleColumnMap("date", value)}
                    disabled={sheetHeaders.length === 0}
                  >
                    <SelectTrigger id="date-column" className="mt-1">
                      <SelectValue placeholder="Select date column" />
                    </SelectTrigger>
                    <SelectContent>
                      {sheetHeaders.map((header) => (
                        <SelectItem key={`date-col-${header}`} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="production-column">Production Column</Label>
                  <Select
                    value={columnMapping.production || ""}
                    onValueChange={(value) => handleColumnMap("production", value)}
                    disabled={sheetHeaders.length === 0}
                  >
                    <SelectTrigger id="production-column" className="mt-1">
                      <SelectValue placeholder="Select production column" />
                    </SelectTrigger>
                    <SelectContent>
                      {sheetHeaders.map((header) => (
                        <SelectItem key={`prod-col-${header}`} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="collection-column">Collection Column</Label>
                  <Select
                    value={columnMapping.collection || ""}
                    onValueChange={(value) => handleColumnMap("collection", value)}
                    disabled={sheetHeaders.length === 0}
                  >
                    <SelectTrigger id="collection-column" className="mt-1">
                      <SelectValue placeholder="Select collection column" />
                    </SelectTrigger>
                    <SelectContent>
                      {sheetHeaders.map((header) => (
                        <SelectItem key={`coll-col-${header}`} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleConnect}
          disabled={!canConnect || isLoadingSheets || isLoadingHeaders}
        >
          Connect Sheet
        </Button>
      </div>
    </div>
  );
};

export default SheetConnector;
