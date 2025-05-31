"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Check, AlertCircle, Sparkles } from "lucide-react";
import { STANDARD_METRICS, COLUMN_NAME_MAPPINGS } from "@/lib/metrics/definitions";

interface ColumnMappingWizardProps {
  spreadsheetId: string;
  sheetName: string;
  columns: string[];
  sampleData?: any[][];
  onComplete: (mappings: ColumnMapping[]) => void;
  onCancel: () => void;
}

interface ColumnMapping {
  sourceColumn: string;
  targetMetric: string;
  transformationRule?: string;
}

export function ColumnMappingWizard({
  spreadsheetId,
  sheetName,
  columns,
  sampleData = [],
  onComplete,
  onCancel
}: ColumnMappingWizardProps) {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [autoMappedColumns, setAutoMappedColumns] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);

  // Auto-detect mappings based on column names
  useEffect(() => {
    const detectedMappings: Record<string, string> = {};
    const autoMapped = new Set<string>();

    columns.forEach(column => {
      const normalizedColumn = column.toLowerCase().trim();
      
      // Check each metric's common variations
      for (const [metricName, variations] of Object.entries(COLUMN_NAME_MAPPINGS)) {
        if (variations.some(variation => normalizedColumn.includes(variation))) {
          detectedMappings[column] = metricName;
          autoMapped.add(column);
          break;
        }
      }
    });

    setMappings(detectedMappings);
    setAutoMappedColumns(autoMapped);
  }, [columns]);

  const handleMappingChange = (column: string, metric: string) => {
    setMappings(prev => ({
      ...prev,
      [column]: metric
    }));
    // Remove from auto-mapped if manually changed
    setAutoMappedColumns(prev => {
      const newSet = new Set(prev);
      newSet.delete(column);
      return newSet;
    });
  };

  const handleSubmit = () => {
    const finalMappings: ColumnMapping[] = Object.entries(mappings)
      .filter(([_, metric]) => metric !== "")
      .map(([column, metric]) => ({
        sourceColumn: column,
        targetMetric: metric
      }));

    onComplete(finalMappings);
  };

  const getMappedMetricsCount = () => {
    return Object.values(mappings).filter(m => m !== "").length;
  };

  const getMetricInfo = (metricName: string) => {
    return STANDARD_METRICS.find(m => m.name === metricName);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Map Your Spreadsheet Columns</CardTitle>
          <CardDescription>
            Match your spreadsheet columns to standard dental metrics. We've auto-detected some mappings for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Mapping Progress</p>
                <p className="text-2xl font-bold">{getMappedMetricsCount()} / {columns.length}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Auto-detected</p>
                <p className="text-lg font-semibold text-green-600">{autoMappedColumns.size} columns</p>
              </div>
            </div>

            {/* Mapping Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Spreadsheet Column</TableHead>
                  <TableHead>Sample Data</TableHead>
                  <TableHead></TableHead>
                  <TableHead>Maps To</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {columns.map((column, index) => {
                  const metricInfo = mappings[column] ? getMetricInfo(mappings[column]) : null;
                  const sampleValue = sampleData[0]?.[index] || "—";
                  
                  return (
                    <TableRow key={column}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {column}
                          {autoMappedColumns.has(column) && (
                            <Badge variant="secondary" className="text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Auto
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {sampleValue}
                      </TableCell>
                      <TableCell>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={mappings[column] || ""}
                          onValueChange={(value) => handleMappingChange(column, value)}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select metric..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">
                              <span className="text-gray-500">Skip this column</span>
                            </SelectItem>
                            {Object.entries(
                              STANDARD_METRICS.reduce((acc, metric) => {
                                if (!acc[metric.category]) acc[metric.category] = [];
                                acc[metric.category].push(metric);
                                return acc;
                              }, {} as Record<string, typeof STANDARD_METRICS>)
                            ).map(([category, metrics]) => (
                              <div key={category}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 capitalize">
                                  {category}
                                </div>
                                {metrics.map(metric => (
                                  <SelectItem key={metric.name} value={metric.name}>
                                    <div>
                                      <div className="font-medium">{metric.name.replace(/_/g, ' ')}</div>
                                      <div className="text-xs text-gray-500">{metric.description}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {metricInfo && (
                          <Badge variant="outline" className="capitalize">
                            {metricInfo.dataType}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Info Alert */}
            {autoMappedColumns.size > 0 && (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  We automatically detected {autoMappedColumns.size} column mappings based on common naming patterns. 
                  You can adjust these if needed.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={getMappedMetricsCount() === 0}
                >
                  Preview Mapping
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={getMappedMetricsCount() === 0}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Mapping ({getMappedMetricsCount()} columns)
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Mapping Preview</CardTitle>
            <CardDescription>
              Review how your data will be mapped to the system metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(mappings)
                .filter(([_, metric]) => metric !== "")
                .map(([column, metric]) => {
                  const metricInfo = getMetricInfo(metric);
                  return (
                    <div key={column} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{column}</p>
                        <p className="text-sm text-gray-600">Source column</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                      <div className="text-right">
                        <p className="font-medium">{metric.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-600">{metricInfo?.category} • {metricInfo?.dataType}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}