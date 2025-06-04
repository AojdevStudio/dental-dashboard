"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardLayout as Layout } from "@/components/common/dashboard-layout";
import { Providers } from "./providers";

interface DashboardLayoutProps {
  children: React.ReactNode;
  clinics?: Array<{ id: string; name: string; location: string }>;
  currentClinicId?: string;
  isSystemAdmin?: boolean;
}

export default function DashboardLayout({
  children,
  clinics = [],
  currentClinicId,
  isSystemAdmin = false,
}: DashboardLayoutProps) {
  return (
    <Providers>
      <AuthGuard>
        <Layout>{children}</Layout>
      </AuthGuard>
    </Providers>
  );
}
