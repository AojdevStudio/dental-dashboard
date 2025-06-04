import { Button } from "@/components/ui/button";
/**
 * Integrations Page
 * Main page for managing data integrations and connections
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, Plus } from "lucide-react";
import Link from "next/link";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect your practice management systems and data sources
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Google Sheets
            </CardTitle>
            <CardDescription>Connect your Google Sheets for data synchronization</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/integrations/google-sheets">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Configure Integration
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle>Practice Management</CardTitle>
            <CardDescription>
              Connect your practice management software (Coming Soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle>Imaging Systems</CardTitle>
            <CardDescription>Connect your digital imaging systems (Coming Soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
