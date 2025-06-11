/**
 * Settings Page (Dashboard)
 *
 * This page serves as the main entry point for all application settings
 * accessible within the user dashboard. It should provide navigation or links
 * to various sub-sections like Clinic Settings, User Management, Provider Settings,
 * and Integrations.
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Settings - Dashboard',
  description: 'Manage your application and account settings.',
};

/**
 * Main settings page for the dashboard.
 * Provides links to different settings categories.
 * @returns {JSX.Element}
 */
export default function SettingsPage() {
  return (
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold">Settings</h1>
      <p class="text-muted-foreground">
        Manage your clinic, user, provider, and integration settings.
      </p>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* TODO: Replace with actual Card components once available and styled */}
        <Link href="/dashboard/settings/clinic" class="block p-4 border rounded-lg hover:shadow-lg">
          <h2 class="font-semibold">Clinic Settings</h2>
          <p class="text-sm text-muted-foreground">Manage your clinic details and information.</p>
        </Link>
        <Link
          href="/dashboard/settings/providers"
          class="block p-4 border rounded-lg hover:shadow-lg"
        >
          <h2 class="font-semibold">Provider Settings</h2>
          <p class="text-sm text-muted-foreground">Manage dental providers in your clinic.</p>
        </Link>
        <Link href="/dashboard/settings/users" class="block p-4 border rounded-lg hover:shadow-lg">
          <h2 class="font-semibold">User Management</h2>
          <p class="text-sm text-muted-foreground">Manage user accounts and permissions.</p>
        </Link>
        <Link href="/dashboard/integrations" class="block p-4 border rounded-lg hover:shadow-lg">
          <h2 class="font-semibold">Integrations</h2>
          <p class="text-sm text-muted-foreground">Manage connections to external services.</p>
        </Link>
      </div>
    </div>
  );
}
