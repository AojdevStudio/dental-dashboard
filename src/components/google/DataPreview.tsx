/**
 * @fileoverview Data Preview Component
 * 
 * This file implements a component for displaying tabular data from Google Sheets
 * within the dental dashboard. It renders a responsive table with support for
 * headers, loading states, error handling, and empty states. The component is designed
 * to work with data fetched from Google Sheets API, but can be used with any 2D array data.
 */

"use client";

import type React from "react";

/**
 * Props for the DataPreview component
 * 
 * @typedef {Object} DataPreviewProps
 * @property {unknown[][] | null} data - 2D array of cell values from a spreadsheet or null if no data
 * @property {string[] | null} [headers] - Optional array of column headers
 * @property {boolean} [isLoading=false] - Whether the data is currently being loaded
 * @property {string | null} [error=null] - Error message if data fetching failed
 */
interface DataPreviewProps {
  data: unknown[][] | null; // Expecting a 2D array of cell values
  headers?: string[] | null; // Optional headers
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Data Preview Component
 * 
 * Renders a responsive table to display tabular data from Google Sheets.
 * The component handles various states including:
 * - Loading state with appropriate visual feedback
 * - Error state with error message display
 * - Empty state when no data is available
 * - Normal state with properly formatted tabular data
 * 
 * The component automatically generates column headers if none are provided,
 * and handles cases where rows may have different numbers of cells.
 * 
 * @param {DataPreviewProps} props - The component props
 * @returns {JSX.Element} The rendered data preview component
 */
const DataPreview: React.FC<DataPreviewProps> = ({
  data,
  headers,
  isLoading = false,
  error = null,
}) => {
  /**
   * Render loading state while data is being fetched
   * 
   * Displays a loading message to indicate that spreadsheet data is being fetched.
   * This provides visual feedback to the user during the loading process.
   * 
   * @returns {JSX.Element} Loading state UI
   */
  if (isLoading) {
    return (
      <div className="p-4 border rounded-md bg-muted">
        <p className="text-sm text-muted-foreground">Loading data preview...</p>
        {/* Add skeletons for table rows/cells if desired */}
      </div>
    );
  }

  /**
   * Render error state when data fetching fails
   * 
   * Displays an error message with details about why the data fetching failed.
   * This helps users understand what went wrong and potentially how to fix it.
   * 
   * @returns {JSX.Element} Error message UI
   */
  if (error) {
    return (
      <div className="p-4 border rounded-md bg-destructive/10">
        <p className="text-sm text-destructive">Error loading data: {error}</p>
      </div>
    );
  }

  /**
   * Render empty state when no data is available
   * 
   * Displays a message indicating that no data is available to display.
   * This helps users understand that the spreadsheet exists but contains no data.
   * 
   * @returns {JSX.Element} Empty state UI
   */
  if (!data || data.length === 0) {
    return (
      <div className="p-4 border rounded-md bg-muted">
        <p className="text-sm text-muted-foreground">No data to display.</p>
      </div>
    );
  }

  /**
   * Process and prepare data for display
   * 
   * This logic handles several scenarios:
   * 1. If headers are provided, use them directly
   * 2. If no headers are provided but data exists, use the first row as headers or generate column numbers
   * 3. If headers are provided, use all data rows; otherwise, skip the first row (assumed to be headers)
   * 4. Calculate the number of columns for consistent table rendering
   */
  const displayHeaders =
    headers && headers.length > 0
      ? headers // Use provided headers if available
      : data[0] && Array.isArray(data[0])
        ? data[0].map((_, index) => `Column ${index + 1}`) // Generate column numbers if no headers
        : [];
  const displayData = headers && headers.length > 0 ? data : data.slice(1); // Skip first row if using it as headers
  const colCount = displayHeaders.length > 0 ? displayHeaders.length : data[0] ? data[0].length : 0;

  /**
   * Render the data preview table
   * 
   * Displays a responsive table with the spreadsheet data. The table includes:
   * - A header row with column names
   * - Data rows with cell values
   * - Proper handling of empty cells
   * - Responsive design for different screen sizes
   * - Accessibility features like proper scope attributes
   * 
   * If no columns are available, a message is displayed instead of an empty table.
   * 
   * @returns {JSX.Element} Data preview table UI
   */
  return (
    <div className="p-4 border rounded-md overflow-x-auto">
      <h3 className="text-lg font-medium mb-2">Data Preview</h3>
      {colCount === 0 ? (
        <p className="text-sm text-muted-foreground">No columns to display.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* Table header row with column names */}
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {displayHeaders.map((header, index) => (
                <th
                  key={`header-${index}`}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {String(header)}
                </th>
              ))}
            </tr>
          </thead>
          {/* Table body with data rows */}
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {displayData.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                {/* Render cells with data */}
                {Array.isArray(row) &&
                  row.slice(0, colCount).map((cell, cellIndex) => (
                    <td
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                    >
                      {cell === null || cell === undefined ? "" : String(cell)}
                    </td>
                  ))}
                {/* Fill empty cells if row is shorter than headers */}
                {Array.isArray(row) &&
                  row.length < colCount &&
                  Array.from({ length: colCount - row.length }).map((_, emptyCellIndex) => (
                    <td
                      key={`empty-cell-${rowIndex}-${emptyCellIndex}`}
                      className="px-6 py-4 whitespace-nowrap text-sm"
                    />
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DataPreview;
