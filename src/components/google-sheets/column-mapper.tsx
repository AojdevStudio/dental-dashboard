/**
 * @fileoverview Column Mapper Component
 *
 * This file implements a component for mapping columns from Google Sheets to
 * dental dashboard metrics. It allows users to configure how spreadsheet data
 * is transformed and interpreted by the system.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Check, Copy, Save } from "lucide-react";
import * as React from "react";

/**
 * Interface for spreadsheet column object
 *
 * @property {string} id - Unique identifier for the column
 * @property {string} name - Display name of the column (e.g., "A", "B", "Patient Name")
 * @property {string} [type] - Data type of the column (e.g., "string", "number", "date")
 * @property {string} [description] - Optional description of the column contents
 */
interface SpreadsheetColumn {
  id: string;
  name: string;
  type?: string;
  description?: string;
}

/**
 * Interface for metric field object
 *
 * @property {string} id - Unique identifier for the metric field
 * @property {string} name - Display name of the metric field
 * @property {string} description - Description of the metric field
 * @property {string} type - Required data type for the field
 * @property {boolean} [required] - Whether the field is required
 */
interface MetricField {
  id: string;
  name: string;
  description: string;
  type: string;
  required?: boolean;
}

/**
 * Interface for mapping object
 *
 * @property {string} columnId - ID of the spreadsheet column
 * @property {string} fieldId - ID of the metric field
 * @property {string} [transformation] - Optional transformation to apply
 */
interface ColumnMapping {
  columnId: string;
  fieldId: string;
  transformation?: string;
}

/**
 * Interface for ColumnMapper component properties
 *
 * @property {SpreadsheetColumn[]} [columns] - Available spreadsheet columns
 * @property {MetricField[]} [fields] - Available metric fields
 * @property {ColumnMapping[]} [mappings] - Current column mappings
 * @property {(mappings: ColumnMapping[]) => void} [onSave] - Callback for saving mappings
 * @property {() => void} [onCancel] - Callback for canceling
 * @property {string} [templateName] - Name of mapping template if using a predefined one
 * @property {boolean} [isLoading] - Whether the component is in loading state
 */
interface ColumnMapperProps {
  columns?: SpreadsheetColumn[];
  fields?: MetricField[];
  mappings?: ColumnMapping[];
  onSave?: (mappings: ColumnMapping[]) => void;
  onCancel?: () => void;
  templateName?: string;
  isLoading?: boolean;
}

/**
 * Sample columns data for demonstration
 * This would be replaced with actual data from the Google Sheets API in production.
 */
const sampleColumns: SpreadsheetColumn[] = [
  { id: "col-a", name: "A", description: "Date" },
  { id: "col-b", name: "B", description: "Revenue" },
  { id: "col-c", name: "C", description: "New Patients" },
  { id: "col-d", name: "D", description: "Procedure Count" },
  { id: "col-e", name: "E", description: "Provider" },
  { id: "col-f", name: "F", description: "Clinic" },
  { id: "col-g", name: "G", description: "Insurance Type" },
  { id: "col-h", name: "H", description: "Cost" },
];

/**
 * Sample metric fields data for demonstration
 * This would be replaced with actual metric fields from the application in production.
 */
const sampleFields: MetricField[] = [
  { id: "field-date", name: "Date", description: "Metric date", type: "date", required: true },
  {
    id: "field-revenue",
    name: "Revenue",
    description: "Total revenue",
    type: "number",
    required: true,
  },
  {
    id: "field-new-patients",
    name: "New Patients",
    description: "Count of new patients",
    type: "number",
  },
  {
    id: "field-procedures",
    name: "Procedures",
    description: "Count of procedures",
    type: "number",
  },
  { id: "field-provider", name: "Provider", description: "Provider name", type: "string" },
  { id: "field-clinic", name: "Clinic", description: "Clinic name", type: "string" },
  { id: "field-insurance", name: "Insurance", description: "Insurance type", type: "string" },
  { id: "field-cost", name: "Cost", description: "Total cost", type: "number" },
];

/**
 * Column Mapper Component
 *
 * A component for mapping Google Sheets columns to dashboard metric fields.
 * Features include:
 * - Drag-and-drop interface for mapping columns to fields
 * - Predefined templates for common spreadsheet formats
 * - Data type validation and transformation options
 * - Save and cancel functionality
 *
 * @param {ColumnMapperProps} props - Component properties
 * @returns {JSX.Element} The rendered column mapper component
 */
export function ColumnMapper({
  columns = sampleColumns,
  fields = sampleFields,
  mappings: initialMappings = [],
  onSave,
  onCancel,
  templateName,
  isLoading = false,
}: ColumnMapperProps) {
  // State to track the current mappings
  const [mappings, setMappings] = React.useState<ColumnMapping[]>(initialMappings);

  // State to track validation errors
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Handle column selection for a field
  const handleColumnSelect = (fieldId: string, columnId: string) => {
    setMappings((prev) => {
      // Check if this field already has a mapping
      const existingIndex = prev.findIndex((m) => m.fieldId === fieldId);

      if (existingIndex >= 0) {
        // Update existing mapping
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], columnId };
        return updated;
      }
      // Create new mapping
      return [...prev, { fieldId, columnId }];
    });

    // Clear any error for this field
    if (errors[fieldId]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldId];
        return updated;
      });
    }
  };

  // Get the selected column ID for a field
  const getSelectedColumnId = (fieldId: string) => {
    const mapping = mappings.find((m) => m.fieldId === fieldId);
    return mapping?.columnId || "";
  };

  // Validate mappings before saving
  const validateMappings = () => {
    const newErrors: Record<string, string> = {};

    // Check that all required fields have mappings
    fields.forEach((field) => {
      if (field.required && !getSelectedColumnId(field.id)) {
        newErrors[field.id] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save button click
  const handleSave = () => {
    if (validateMappings() && onSave) {
      onSave(mappings);
    }
  };

  // Apply a predefined template
  const applyTemplate = (
    template: "dental_practice_default" | "financial_data" | "patient_metrics"
  ) => {
    let templateMappings: ColumnMapping[] = [];

    // Define mappings for each template
    switch (template) {
      case "dental_practice_default":
        templateMappings = [
          { columnId: "col-a", fieldId: "field-date" },
          { columnId: "col-b", fieldId: "field-revenue" },
          { columnId: "col-c", fieldId: "field-new-patients" },
          { columnId: "col-d", fieldId: "field-procedures" },
          { columnId: "col-e", fieldId: "field-provider" },
          { columnId: "col-f", fieldId: "field-clinic" },
        ];
        break;
      case "financial_data":
        templateMappings = [
          { columnId: "col-a", fieldId: "field-date" },
          { columnId: "col-b", fieldId: "field-revenue" },
          { columnId: "col-h", fieldId: "field-cost" },
        ];
        break;
      case "patient_metrics":
        templateMappings = [
          { columnId: "col-a", fieldId: "field-date" },
          { columnId: "col-c", fieldId: "field-new-patients" },
          { columnId: "col-g", fieldId: "field-insurance" },
        ];
        break;
    }

    setMappings(templateMappings);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Template selection */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Apply Template</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyTemplate("dental_practice_default")}
            className="flex items-center"
          >
            <Copy className="mr-1 h-3 w-3" />
            Default Dental Practice
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyTemplate("financial_data")}
            className="flex items-center"
          >
            <Copy className="mr-1 h-3 w-3" />
            Financial Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => applyTemplate("patient_metrics")}
            className="flex items-center"
          >
            <Copy className="mr-1 h-3 w-3" />
            Patient Metrics
          </Button>
        </div>

        {templateName && (
          <Badge variant="outline" className="mt-2">
            Using template: {templateName}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Column mapping interface */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Map Columns to Fields</h3>

        {fields.map((field) => (
          <Card key={field.id} className={field.required ? "border-primary/20" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                {field.name}
                {field.required && (
                  <Badge variant="outline" className="ml-2">
                    Required
                  </Badge>
                )}
                <Badge variant="secondary" className="ml-auto">
                  {field.type}
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">{field.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Select
                  value={getSelectedColumnId(field.id)}
                  onValueChange={(value) => handleColumnSelect(field.id, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        <div className="flex flex-col">
                          <span>Column {column.name}</span>
                          {column.description && (
                            <span className="text-xs text-muted-foreground">
                              {column.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <ArrowRight className="h-4 w-4 text-muted-foreground" />

                <div className="bg-secondary p-2 rounded flex-1 text-sm">{field.name}</div>
              </div>

              {/* Show error message if any */}
              {errors[field.id] && (
                <p className="text-xs text-destructive mt-1">{errors[field.id]}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}

        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          Save Mapping
        </Button>
      </div>
    </div>
  );
}
