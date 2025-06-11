/**
 * Integrations Page
 * Main page for managing data integrations and connections
 */
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet } from 'lucide-react';

export default function IntegrationsPage() {
  return (
    <div class="space-y-6">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Integrations</h1>
        <p class="text-muted-foreground">
          Connect your practice management systems and data sources
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card class="opacity-50">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <FileSpreadsheet class="h-5 w-5" />
              Google Sheets
            </CardTitle>
            <CardDescription>Data synchronization handled via automated scripts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled={true} class="w-full">
              Managed by Admin
            </Button>
          </CardContent>
        </Card>

        <Card class="opacity-50">
          <CardHeader>
            <CardTitle>Practice Management</CardTitle>
            <CardDescription>
              Connect your practice management software (Coming Soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled={true} class="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card class="opacity-50">
          <CardHeader>
            <CardTitle>Imaging Systems</CardTitle>
            <CardDescription>Connect your digital imaging systems (Coming Soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled={true} class="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
