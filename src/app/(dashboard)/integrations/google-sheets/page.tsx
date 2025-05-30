import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Google Sheets Integration Page */
export default function GoogleSheetsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Google Sheets Integration</h1>

      <div className="grid gap-6">
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
            <p className="text-sm text-muted-foreground">
              No spreadsheets connected yet. Connect your Google account to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
