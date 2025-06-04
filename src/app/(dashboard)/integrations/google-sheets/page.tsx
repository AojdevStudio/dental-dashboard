"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/** Google Sheets Integration Page */
export default function GoogleSheetsPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Google Sheets Integration</h1>

      <div className="grid gap-6">
        {success === "mapping" && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Column mappings saved successfully! Your Google Sheets data will now be synchronized
              with your dental metrics.
            </AlertDescription>
          </Alert>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Google Sheets</CardTitle>
            <CardDescription>
              Import and sync data from your Google Sheets to track dental practice KPIs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Connect your Google account to access spreadsheets and automatically sync data for
              real-time analytics and reporting.
            </p>
            <div className="flex gap-4">
              <Button>Connect Google Account</Button>
              <Link href="/integrations/google-sheets/test">
                <Button variant="outline">Test Integration</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connected Spreadsheets</CardTitle>
            <CardDescription>
              Manage your connected Google Sheets and column mappings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success === "mapping" ? (
              <div className="space-y-4">
                <p className="text-sm text-green-800">
                  ✅ Your column mappings have been configured successfully
                </p>
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/dashboard">View Dashboard</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/integrations/google-sheets/test">Test Data Sync</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No spreadsheets connected yet. Connect your Google account to get started.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
