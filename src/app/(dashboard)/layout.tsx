import { getAuthContext } from '@/lib/database/auth-context';
import { prisma } from '@/lib/database/prisma';
import type React from 'react';
import DashboardLayout from './layout-client';

export default async function DashboardLayoutServer({
  children,
}: {
  children: React.ReactNode;
}) {
  let authContext: Awaited<ReturnType<typeof getAuthContext>> = null;
  let clinics: Array<{ id: string; name: string; location: string }> = [];

  try {
    authContext = await getAuthContext();

    // Get user's accessible clinics
    if (authContext) {
      if (authContext.isSystemAdmin) {
        // System admins can see all clinics
        clinics = await prisma.clinic.findMany({
          where: { status: 'active' },
          select: {
            id: true,
            name: true,
            location: true,
          },
          orderBy: { name: 'asc' },
        });
      } else {
        // Regular users see only their accessible clinics
        clinics = await prisma.clinic.findMany({
          where: {
            id: { in: authContext.clinicIds },
            status: 'active',
          },
          select: {
            id: true,
            name: true,
            location: true,
          },
          orderBy: { name: 'asc' },
        });
      }
    }
  } catch (error) {
    console.error('DashboardLayoutServer: Error getting auth context:', error);
    // Continue with empty context and let client-side handle auth
  }

  return (
    <DashboardLayout
      clinics={clinics}
      currentClinicId={authContext?.selectedClinicId}
      isSystemAdmin={authContext?.isSystemAdmin}
    >
      {children}
    </DashboardLayout>
  );
}
