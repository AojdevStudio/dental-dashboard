/**
 * @fileoverview Export Button Component
 * 
 * This file implements a reusable export button component that provides
 * functionality for exporting dashboard data in various formats (PDF, CSV).
 */

"use client";

import * as React from "react";
import { FileDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Interface for ExportButton component properties
 * 
 * @property {() => Promise<void>} [onExportPdf] - Callback for PDF export
 * @property {() => Promise<void>} [onExportCsv] - Callback for CSV export
 * @property {boolean} [disabled] - Whether the export button is disabled
 * @property {React.ReactNode} [children] - Custom button label content
 */
interface ExportButtonProps {
  onExportPdf?: () => Promise<void>;
  onExportCsv?: () => Promise<void>;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Export Button Component
 * 
 * A dropdown button component for exporting dashboard data in different formats.
 * Features include:
 * - PDF export option
 * - CSV export option
 * - Loading state during export
 * - Success feedback after export completes
 * 
 * @param {ExportButtonProps} props - Component properties
 * @returns {JSX.Element} The rendered export button component
 */
export function ExportButton({
  onExportPdf,
  onExportCsv,
  disabled = false,
  children,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportFormat, setExportFormat] = React.useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = React.useState(false);

  /**
   * Handles the export action for the selected format
   * 
   * @param {string} format - The export format ('pdf' or 'csv')
   * @returns {Promise<void>}
   */
  const handleExport = async (format: string) => {
    try {
      setIsExporting(true);
      setExportFormat(format);
      setExportSuccess(false);

      if (format === 'pdf' && onExportPdf) {
        await onExportPdf();
      } else if (format === 'csv' && onExportCsv) {
        await onExportCsv();
      }

      setExportSuccess(true);
      
      // Reset success indicator after 2 seconds
      setTimeout(() => {
        setExportSuccess(false);
      }, 2000);
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting}>
          <FileDown className="mr-2 h-4 w-4" />
          {children || "Export"}
          {isExporting && (
            <span className="ml-2 animate-pulse">
              Exporting {exportFormat?.toUpperCase()}...
            </span>
          )}
          {exportSuccess && !isExporting && (
            <span className="ml-2 text-green-500 flex items-center">
              <Check className="h-4 w-4 mr-1" />
              Done
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          disabled={isExporting || !onExportPdf}
        >
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('csv')}
          disabled={isExporting || !onExportCsv}
        >
          Export as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
