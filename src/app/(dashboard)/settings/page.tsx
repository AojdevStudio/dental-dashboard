/**
 * Settings Page (Dashboard)
 *
 * This page serves as the main entry point for all application settings
 * accessible within the user dashboard. It should provide navigation or links
 * to various sub-sections like Clinic Settings, User Management, Provider Settings,
 * and Integrations.
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Settings - Dashboard",
  description: "Manage your application and account settings.",
};

/**
 * Main settings page for the dashboard.
 * Provides links to different settings categories.
 * @returns {JSX.Element}
 */
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-muted-foreground">
        Manage your clinic, user, provider, and integration settings.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* TODO: Replace with actual Card components once available and styled */}
        <Link
          href="/dashboard/settings/clinic"
          className="block p-4 border rounded-lg hover:shadow-lg"
        >
          <h2 className="font-semibold">Clinic Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your clinic details and information.
          </p>
        </Link>
        <Link
          href="/dashboard/settings/providers"
          className="block p-4 border rounded-lg hover:shadow-lg"
        >
          <h2 className="font-semibold">Provider Settings</h2>
          <p className="text-sm text-muted-foreground">Manage dental providers in your clinic.</p>
        </Link>
        <Link
          href="/dashboard/settings/users"
          className="block p-4 border rounded-lg hover:shadow-lg"
        >
          <h2 className="font-semibold">User Management</h2>
          <p className="text-sm text-muted-foreground">Manage user accounts and permissions.</p>
        </Link>
        <Link
          href="/dashboard/integrations"
          className="block p-4 border rounded-lg hover:shadow-lg"
        >
          <h2 className="font-semibold">Integrations</h2>
          <p className="text-sm text-muted-foreground">Manage connections to external services.</p>
        </Link>
      </div>
    </div>
  );
}
