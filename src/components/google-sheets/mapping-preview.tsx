/**
 * @fileoverview Mapping Preview Component
 *
 * This file implements a component for previewing the results of Google Sheets column
 * mappings before applying them. It shows sample data from the spreadsheet transformed
 * according to the configured mappings.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Check, Download, RefreshCw, TableProperties, X } from "lucide-react";
import * as React from "react";

/**
 * Interface for a data validation issue
 *
 * @property {string} id - Unique identifier for the issue
 * @property {string} rowIndex - Row index where the issue occurred
 * @property {string} field - Field with the issue
 * @property {string} message - Error message describing the issue
 * @property {'error' | 'warning'} [severity] - Severity level of the issue
 */
interface ValidationIssue {
  id: string;
  rowIndex: string;
  field: string;
  message: string;
  severity?: "error" | "warning";
}

/**
 * Interface for MappingPreview component properties
 *
 * @property {Record<string, unknown>[]} [previewData] - Sample data with mappings applied
 * @property {ValidationIssue[]} [validationIssues] - List of validation issues in the data
 * @property {string} [spreadsheetName] - Name of the spreadsheet being previewed
 * @property {() => void} [onRefresh] - Callback to refresh the preview data
 * @property {() => void} [onDownloadSample] - Callback to download sample data
 * @property {boolean} [isLoading] - Whether the component is in loading state
 * @property {boolean} [isRefreshing] - Whether the preview is being refreshed
 */
interface MappingPreviewProps {
  previewData?: Record<string, unknown>[];
  validationIssues?: ValidationIssue[];
  spreadsheetName?: string;
  onRefresh?: () => void;
  onDownloadSample?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
}

/**
 * Sample preview data for demonstration
 * This would be replaced with actual transformed data in production.
 */
const samplePreviewData = [
  {
    date: "2025-05-01",
    revenue: 5280,
    newPatients: 12,
    procedures: 45,
    provider: "Dr. Smith",
    clinic: "Main Street Dental",
  },
  {
    date: "2025-05-02",
    revenue: 4930,
    newPatients: 8,
    procedures: 38,
    provider: "Dr. Johnson",
    clinic: "Main Street Dental",
  },
  {
    date: "2025-05-03",
    revenue: 6150,
    newPatients: 15,
    procedures: 52,
    provider: "Dr. Smith",
    clinic: "Main Street Dental",
  },
  {
    date: "2025-05-04",
    revenue: 3890,
    newPatients: 5,
    procedures: 29,
    provider: "Dr. Williams",
    clinic: "Downtown Dental Care",
  },
  {
    date: "2025-05-05",
    revenue: null, // Intentional error for demonstration
    newPatients: 10,
    procedures: 42,
    provider: "Dr. Smith",
    clinic: "Main Street Dental",
  },
];

/**
 * Sample validation issues for demonstration
 */
const sampleValidationIssues: ValidationIssue[] = [
  {
    id: "issue-1",
    rowIndex: "5",
    field: "revenue",
    message: "Missing required value for revenue",
    severity: "error",
  },
  {
    id: "issue-2",
    rowIndex: "8",
    field: "date",
    message: "Invalid date format in source data",
    severity: "error",
  },
  {
    id: "issue-3",
    rowIndex: "12",
    field: "provider",
    message: "Provider name not found in system",
    severity: "warning",
  },
];

/**
 * Mapping Preview Component
 *
 * A component for previewing the results of column mapping configuration.
 * Features include:
 * - Table display of sample transformed data
 * - Validation issues summary and details
 * - Refresh button to update preview
 * - Download button for sample data
 *
 * @param {MappingPreviewProps} props - Component properties
 * @returns {JSX.Element} The rendered mapping preview component
 */
export function MappingPreview({
  previewData = samplePreviewData,
  validationIssues = sampleValidationIssues,
  spreadsheetName,
  onRefresh,
  onDownloadSample,
  isLoading = false,
  isRefreshing = false,
}: MappingPreviewProps) {
  // Extract column headers from the first data item
  const columns = previewData.length > 0 ? Object.keys(previewData[0]) : [];

  // Count validation issues by severity
  const errorCount = validationIssues.filter((i) => i.severity === "error").length;
  const warningCount = validationIssues.filter((i) => i.severity === "warning").length;

  // Only show loading state if isLoading is true
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Data Preview</span>
            {spreadsheetName && (
              <Badge variant="outline" className="font-normal">
                {spreadsheetName}
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadSample}
              className="flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              Download
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation issues summary */}
        {validationIssues.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Validation Issues</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              {errorCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <X className="h-3 w-3" />
                  {errorCount} {errorCount === 1 ? "Error" : "Errors"}
                </Badge>
              )}

              {warningCount > 0 && (
                <Badge
                  variant="outline"
                  className="bg-amber-100 text-amber-800 border-amber-300 gap-1"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {warningCount} {warningCount === 1 ? "Warning" : "Warnings"}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Data preview table */}
        <div className="border rounded-md">
          <div className="flex items-center justify-between p-2 border-b bg-muted/40">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TableProperties className="h-4 w-4 text-muted-foreground" />
              <span>Preview Data</span>
              {previewData.length > 0 && (
                <Badge variant="secondary" className="font-normal">
                  {previewData.length} rows
                </Badge>
              )}
            </div>
          </div>

          {previewData.length > 0 ? (
            <div className="max-h-[300px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead key={column} className="whitespace-nowrap">
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((column) => {
                        // Check if this cell has a validation issue
                        const hasIssue = validationIssues.some(
                          (issue) =>
                            issue.rowIndex === (rowIndex + 1).toString() && issue.field === column
                        );

                        return (
                          <TableCell
                            key={`${rowIndex}-${column}`}
                            className={hasIssue ? "text-destructive" : ""}
                          >
                            {row[column] === null ? (
                              <span className="text-destructive">Missing</span>
                            ) : (
                              String(row[column])
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">No preview data available</div>
          )}
        </div>

        {/* Validation issues details */}
        {validationIssues.length > 0 && (
          <div className="border rounded-md">
            <div className="p-2 border-b bg-muted/40">
              <h4 className="text-sm font-medium">Validation Issues Details</h4>
            </div>
            <div className="max-h-[200px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Row</TableHead>
                    <TableHead className="w-[120px]">Field</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead className="w-[100px]">Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>{issue.rowIndex}</TableCell>
                      <TableCell>{issue.field}</TableCell>
                      <TableCell>{issue.message}</TableCell>
                      <TableCell>
                        {issue.severity === "error" ? (
                          <Badge variant="destructive" className="gap-1">
                            <X className="h-3 w-3" />
                            Error
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-800 border-amber-300 gap-1"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Warning
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
