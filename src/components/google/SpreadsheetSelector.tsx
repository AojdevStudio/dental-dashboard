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

interface Spreadsheet {
  id: string;
  name: string;
}

// Expected response structure from the API
interface ListSpreadsheetsResponse {
  spreadsheets?: Spreadsheet[];
  error?: string;
  details?: string;
}

interface SpreadsheetSelectorProps {
  clinicId: string; // To scope spreadsheet fetching if necessary or pass along
  onSpreadsheetSelected: (spreadsheet: Spreadsheet) => void;
  // accessToken?: string; // Optional: if client-side fetching with token is used
}

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

export function SpreadsheetSelector({ clinicId, onSpreadsheetSelected }: SpreadsheetSelectorProps) {
  const {
    data: spreadsheets,
    error,
    isLoading,
  } = useQuery<Spreadsheet[], Error>({
    queryKey: ["spreadsheets", clinicId],
    queryFn: () => fetchSpreadsheets(clinicId),
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  const handleValueChange = (spreadsheetId: string) => {
    if (!spreadsheets) return;
    const selected = spreadsheets.find((s) => s.id === spreadsheetId);
    if (selected) {
      onSpreadsheetSelected(selected);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 w-full">
        <Label htmlFor="spreadsheet-selector-loading">Select Spreadsheet</Label>
        <Skeleton className="h-10 w-full" id="spreadsheet-selector-loading" />
        <p className="text-sm text-muted-foreground">Loading spreadsheets...</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-2 w-full">
      <Label htmlFor="spreadsheet-selector">Select Spreadsheet</Label>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-full" id="spreadsheet-selector">
          <SelectValue placeholder="Select a spreadsheet" />
        </SelectTrigger>
        <SelectContent>
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
