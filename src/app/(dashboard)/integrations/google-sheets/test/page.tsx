"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

interface DataSource {
  id: string;
  name: string;
  spreadsheetId: string;
  connectionStatus: string;
  lastSyncedAt: string | null;
  clinicId: string;
}

interface Spreadsheet {
  id: string;
  name: string;
}

export default function GoogleSheetsTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [testSpreadsheetId, setTestSpreadsheetId] = useState("");
  const [testRange, setTestRange] = useState("Sheet1!A1:B10");
  const [sheetData, setSheetData] = useState<unknown>(null);

  // Check for auth callback parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authSuccess = params.get("googleAuthSuccess");
    const authError = params.get("googleAuthError");
    const dataSourceId = params.get("dataSourceId");

    if (authSuccess && dataSourceId) {
      setSuccess(`Google authentication successful! DataSource ID: ${dataSourceId}`);
      fetchDataSource(dataSourceId);
    } else if (authError) {
      setError(`Google authentication failed: ${authError}`);
    }
  }, []);

  // Step 1: Create a test data source
  const createTestDataSource = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Creating data source...");
      const response = await fetch("/api/test/data-source", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers.get("content-type"));

      const responseText = await response.text();
      console.log("Response text:", responseText);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${responseText}`);
      }

      const data = JSON.parse(responseText);
      setDataSource(data.dataSource);
      setSuccess(`Test data source created with ID: ${data.dataSource.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create data source");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Initiate Google OAuth
  const initiateGoogleAuth = () => {
    if (!dataSource) {
      setError("Please create a data source first");
      return;
    }

    // Redirect to the test Google auth connect endpoint
    window.location.href = `/api/auth/google/test-connect?dataSourceId=${dataSource.id}`;
  };

  // Step 3: Test fetching spreadsheets
  const fetchSpreadsheets = async () => {
    if (!dataSource) {
      setError("No data source available");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching spreadsheets with dataSourceId:", dataSource.id);
      const response = await fetch(`/api/google/sheets/test-noauth?dataSourceId=${dataSource.id}`);

      console.log("Response status:", response.status);
      const contentType = response.headers.get("content-type");
      console.log("Response content-type:", contentType);

      if (!response.ok) {
        const text = await response.text();
        console.log("Error response:", text);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Spreadsheets data:", data);
      setSpreadsheets(data.spreadsheets || []);
      setSuccess(`Found ${data.spreadsheets?.length || 0} spreadsheets`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch spreadsheets");
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Test fetching sheet metadata
  const fetchSheetMetadata = async () => {
    if (!dataSource || !testSpreadsheetId) {
      setError("Please enter a spreadsheet ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const trimmedId = testSpreadsheetId.trim();
      const response = await fetch(
        `/api/google/sheets/${trimmedId}/test?dataSourceId=${dataSource.id}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch sheet metadata");
      }

      const data = await response.json();
      setSuccess(
        `Spreadsheet: ${data.spreadsheetTitle}, Sheets: ${data.sheets?.map((s: any) => s.title).join(", ")}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sheet metadata");
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Test fetching sheet data
  const fetchSheetData = async () => {
    if (!dataSource || !testSpreadsheetId || !testRange) {
      setError("Please enter both spreadsheet ID and range");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const trimmedId = testSpreadsheetId.trim();
      const response = await fetch(
        `/api/google/sheets/${trimmedId}/data/test?range=${encodeURIComponent(testRange)}&dataSourceId=${dataSource.id}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch sheet data");
      }

      const data = await response.json();
      setSheetData(data);
      setSuccess(`Retrieved ${data.values?.length || 0} rows of data`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sheet data");
    } finally {
      setLoading(false);
    }
  };

  // Helper to fetch data source after auth
  const fetchDataSource = async (id: string) => {
    try {
      // For now, just reconstruct the data source from the ID
      // since we know it was created successfully
      setDataSource({
        id: id,
        name: "Test Google Sheets Connection",
        spreadsheetId: `test-${Date.now()}`,
        connectionStatus: "connected",
        lastSyncedAt: null,
        clinicId: "test-clinic",
      });
      setSuccess("Google authentication successful! You can now fetch your spreadsheets.");
    } catch (err) {
      setError(
        `Failed to fetch data source: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Google Sheets Integration Test</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Debug: Test Basic API */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Debug: Test API Routes</CardTitle>
          <CardDescription>Test if API routes are working correctly</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={async () => {
              try {
                const response = await fetch("/api/test/simple", { method: "GET" });
                const data = await response.text();
                console.log("Simple API test:", response.status, data);
                setSuccess(`API test successful: ${data}`);
              } catch (err) {
                console.error("API test failed:", err);
                setError(`API test failed: ${err}`);
              }
            }}
          >
            Test Simple API
          </Button>
          <Button
            className="ml-2"
            onClick={async () => {
              try {
                const response = await fetch("/api/test/auth-check", { method: "GET" });
                const data = await response.json();
                console.log("Auth check:", data);
                if (data.authenticated) {
                  setSuccess(`Authenticated as: ${data.user.email}`);
                } else {
                  setError(`Not authenticated: ${data.message || data.error}`);
                }
              } catch (err) {
                console.error("Auth check failed:", err);
                setError(`Auth check failed: ${err}`);
              }
            }}
          >
            Check Auth Status
          </Button>
          <Button
            variant="destructive"
            className="ml-2"
            onClick={async () => {
              try {
                const response = await fetch("/api/test/create-user", { method: "POST" });
                const data = await response.json();
                console.log("Create user response:", data);
                if (data.success) {
                  setSuccess(`User created: ${data.user.email} in clinic: ${data.clinic.name}`);
                } else {
                  setSuccess(`User status: ${data.message}`);
                }
              } catch (err) {
                console.error("Create user failed:", err);
                setError(`Create user failed: ${err}`);
              }
            }}
          >
            Fix: Create User Record
          </Button>
          <Button
            variant="secondary"
            className="ml-2"
            onClick={() => {
              // Use the most recent data source ID with active tokens
              setDataSource({
                id: "cmb8h3gr8000asiwpuynz6gi9",
                name: "Test Google Sheets Connection",
                spreadsheetId: "test",
                connectionStatus: "connected",
                lastSyncedAt: null,
                clinicId: "test-clinic",
              });
              setSuccess("Using most recent data source with active Google tokens");
            }}
          >
            Use Latest Data Source
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* Step 1: Create Data Source */}
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Create Test Data Source</CardTitle>
            <CardDescription>
              Create a test data source entry in the database to store Google credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={createTestDataSource} disabled={loading || !!dataSource}>
                {loading
                  ? "Creating..."
                  : dataSource
                    ? "Data Source Created"
                    : "Create Data Source"}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    const response = await fetch("/api/test/data-source-noauth", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                    });
                    const data = await response.json();
                    console.log("No-auth API response:", response.status, data);
                    if (response.ok) {
                      setDataSource(data.dataSource);
                      setSuccess(`Test data source created: ${data.dataSource.id}`);
                    } else {
                      setError(`API error: ${data.error} - ${data.details || ""}`);
                    }
                  } catch (err) {
                    setError(`Failed: ${err}`);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading || !!dataSource}
              >
                Try Without Middleware
              </Button>
            </div>
            {dataSource && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="text-sm">
                  <strong>Data Source ID:</strong> {dataSource.id}
                  <br />
                  <strong>Name:</strong> {dataSource.name}
                  <br />
                  <strong>Status:</strong> {dataSource.connectionStatus}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Google OAuth */}
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Authenticate with Google</CardTitle>
            <CardDescription>Connect to Google Sheets using OAuth 2.0</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={initiateGoogleAuth}
              disabled={!dataSource || dataSource.connectionStatus === "connected"}
            >
              {dataSource?.connectionStatus === "connected"
                ? "Already Connected"
                : "Connect to Google"}
            </Button>
          </CardContent>
        </Card>

        {/* Step 3: List Spreadsheets */}
        <Card>
          <CardHeader>
            <CardTitle>Step 3: List Available Spreadsheets</CardTitle>
            <CardDescription>
              Fetch all spreadsheets accessible with the connected Google account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={fetchSpreadsheets}
              disabled={loading || !dataSource || dataSource.connectionStatus !== "connected"}
            >
              {loading ? "Fetching..." : "Fetch Spreadsheets"}
            </Button>

            {spreadsheets.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">Available Spreadsheets:</h4>
                {spreadsheets.map((sheet) => (
                  <div key={sheet.id} className="p-2 bg-gray-50 rounded">
                    <p className="text-sm">
                      <strong>{sheet.name}</strong>
                      <br />
                      ID: {sheet.id}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 4: Test Sheet Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Get Sheet Metadata</CardTitle>
            <CardDescription>Fetch metadata for a specific spreadsheet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="spreadsheet-id">Spreadsheet ID</Label>
              <Input
                id="spreadsheet-id"
                value={testSpreadsheetId}
                onChange={(e) => setTestSpreadsheetId(e.target.value)}
                placeholder="Enter a spreadsheet ID from above"
              />
            </div>
            <Button
              onClick={fetchSheetMetadata}
              disabled={loading || !dataSource || !testSpreadsheetId}
            >
              {loading ? "Fetching..." : "Fetch Metadata"}
            </Button>
          </CardContent>
        </Card>

        {/* Step 5: Test Sheet Data */}
        <Card>
          <CardHeader>
            <CardTitle>Step 5: Fetch Sheet Data</CardTitle>
            <CardDescription>Fetch actual data from a spreadsheet range</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="range">Range (A1 notation)</Label>
              <Input
                id="range"
                value={testRange}
                onChange={(e) => setTestRange(e.target.value)}
                placeholder="e.g., Sheet1!A1:B10"
              />
            </div>
            <Button
              onClick={fetchSheetData}
              disabled={loading || !dataSource || !testSpreadsheetId || !testRange}
            >
              {loading ? "Fetching..." : "Fetch Data"}
            </Button>

            {sheetData && (
              <div className="mt-4 p-4 bg-gray-50 rounded overflow-auto">
                <h4 className="font-medium mb-2">Sheet Data:</h4>
                <pre className="text-xs">{JSON.stringify(sheetData, null, 2)}</pre>
                
                {/* Add button to test column mapping */}
                <div className="mt-4 pt-4 border-t">
                  <Button
                    onClick={() => {
                      const sheetName = testRange.split('!')[0] || 'Sheet1';
                      router.push(`/integrations/google-sheets/mapping?spreadsheetId=${encodeURIComponent(testSpreadsheetId)}&sheetName=${encodeURIComponent(sheetName)}`);
                    }}
                    className="w-full"
                  >
                    🚀 Test Column Mapping with this Sheet
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
