'use client';

import type React from 'react';

import { AuthGuard } from '@/components/auth/auth-guard';
import { DashboardLayout as Layout } from '@/components/common/dashboard-layout';
import { Providers } from './dashboard-providers';

interface DashboardLayoutProps {
  children: React.ReactNode;
  clinics?: Array<{ id: string; name: string; location: string }>;
  currentClinicId?: string;
  isSystemAdmin?: boolean;
}

export default function DashboardLayout({
  children,
  clinics: _clinics = [],
  currentClinicId: _currentClinicId,
  isSystemAdmin: _isSystemAdmin = false,
}: DashboardLayoutProps) {
  return (
    <Providers>
      <AuthGuard>
        <Layout>{children}</Layout>
      </AuthGuard>
    </Providers>
  );
}
