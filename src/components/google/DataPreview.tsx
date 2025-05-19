"use client";

import type React from "react";

interface DataPreviewProps {
  data: unknown[][] | null; // Expecting a 2D array of cell values
  headers?: string[] | null; // Optional headers
  isLoading?: boolean;
  error?: string | null;
}

const DataPreview: React.FC<DataPreviewProps> = ({
  data,
  headers,
  isLoading = false,
  error = null,
}) => {
  if (isLoading) {
    return (
      <div className="p-4 border rounded-md bg-muted">
        <p className="text-sm text-muted-foreground">Loading data preview...</p>
        {/* Add skeletons for table rows/cells if desired */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-md bg-destructive/10">
        <p className="text-sm text-destructive">Error loading data: {error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-4 border rounded-md bg-muted">
        <p className="text-sm text-muted-foreground">No data to display.</p>
      </div>
    );
  }

  const displayHeaders =
    headers && headers.length > 0
      ? headers
      : data[0] && Array.isArray(data[0])
        ? data[0].map((_, index) => `Column ${index + 1}`)
        : [];
  const displayData = headers && headers.length > 0 ? data : data.slice(1);
  const colCount = displayHeaders.length > 0 ? displayHeaders.length : data[0] ? data[0].length : 0;

  return (
    <div className="p-4 border rounded-md overflow-x-auto">
      <h3 className="text-lg font-medium mb-2">Data Preview</h3>
      {colCount === 0 ? (
        <p className="text-sm text-muted-foreground">No columns to display.</p>
      ) : (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
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
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {displayData.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
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
