"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ColumnMappingWizard } from "@/components/google-sheets/column-mapping-wizard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface SpreadsheetData {
  spreadsheetId: string;
  title: string;
  sheets: Array<{
    name: string;
    headers: string[];
  }>;
}

export default function GoogleSheetsMappingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spreadsheetId = searchParams.get("spreadsheetId");
  const sheetName = searchParams.get("sheetName");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<any[][]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!spreadsheetId || !sheetName) {
      router.push("/integrations/google-sheets");
      return;
    }

    fetchSpreadsheetData();
  }, [spreadsheetId, sheetName]);

  const fetchSpreadsheetData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch spreadsheet metadata
      const metaResponse = await fetch(`/api/google/sheets/${spreadsheetId}/test`);
      if (!metaResponse.ok) {
        throw new Error("Failed to fetch spreadsheet metadata");
      }
      const metaData = await metaResponse.json();
      setSpreadsheetData(metaData);

      // Fetch sample data
      const dataResponse = await fetch(
        `/api/google/sheets/${spreadsheetId}/data/test?sheetName=${encodeURIComponent(sheetName!)}&range=A1:Z10`
      );
      if (!dataResponse.ok) {
        throw new Error("Failed to fetch sample data");
      }
      const data = await dataResponse.json();
      
      if (data.values && data.values.length > 0) {
        setColumns(data.values[0]); // First row as headers
        setSampleData(data.values.slice(1)); // Rest as sample data
      }
    } catch (err) {
      console.error("Error fetching spreadsheet data:", err);
      setError(err instanceof Error ? err.message : "Failed to load spreadsheet data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMapping = async (mappings: any[]) => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/google-sheets/mapping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spreadsheetId,
          sheetName,
          mappings,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save mapping configuration");
      }

      // Redirect to success or next step
      router.push(`/integrations/google-sheets?success=mapping`);
    } catch (err) {
      console.error("Error saving mapping:", err);
      setError(err instanceof Error ? err.message : "Failed to save mapping");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/integrations/google-sheets">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Google Sheets
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/integrations/google-sheets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configure Column Mapping</h1>
        <p className="text-gray-600 mt-2">
          Map columns from "{spreadsheetData?.title}" - {sheetName} to your dental metrics
        </p>
      </div>

      {columns.length > 0 ? (
        <ColumnMappingWizard
          spreadsheetId={spreadsheetId!}
          sheetName={sheetName!}
          columns={columns}
          sampleData={sampleData}
          onComplete={handleSaveMapping}
          onCancel={() => router.push("/integrations/google-sheets")}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Columns Found</CardTitle>
            <CardDescription>
              The selected sheet appears to be empty or has no headers in the first row.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/integrations/google-sheets">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Google Sheets
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}