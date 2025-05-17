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

// --- Type Definitions ---
interface Sheet {
  id: string; // Or number, depending on API, API returns number for sheetId
  title: string;
}

// Response type from /api/google/sheets/[spreadsheetId]
interface SheetsApiResponse {
  spreadsheetId: string;
  spreadsheetTitle: string;
  sheets: Sheet[]; // Assuming this structure based on API work
  error?: string;
}

// Response type from /api/google/sheets/[spreadsheetId]/data?range=A1:Z1 (for headers)
interface SheetHeadersApiResponse {
  values?: string[][]; // Google API returns a 2D array, headers are the first row
  error?: string;
  // Headers might also be a specific flat array depending on backend processing
  // For now, assume values[0] contains headers if values exist.
}

interface SheetHeader {
  key: string;
  label: string; // This would be the actual header string
}

interface ColumnMapping {
  date: string | null;
  production: string | null;
  collection: string | null;
}

interface SheetConnectorProps {
  clinicId: string;
  spreadsheetId: string | null;
  onSheetConnected: (
    spreadsheetId: string,
    sheetName: string,
    columnMapping: ColumnMapping
  ) => void;
  onCancel: () => void;
}

// --- API Fetcher Functions (Placeholders) ---
// Updated to fetch list of sheets in a spreadsheet
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

// Updated to fetch headers of a specific sheet (typically the first row)
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

// --- Component ---
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

  // --- Data Fetching with TanStack Query ---
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

  // --- Event Handlers ---
  const handleSheetSelect = (sheetName: string) => {
    setSelectedSheetName(sheetName);
    // Reset column mapping when sheet changes
    setColumnMapping({ date: null, production: null, collection: null });
  };

  const handleColumnMap = (type: keyof ColumnMapping, header: string | null) => {
    setColumnMapping((prev) => ({ ...prev, [type]: header }));
  };

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

  // --- Derived State ---
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
