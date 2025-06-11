import { getAuthContext } from '@/lib/database/auth-context';
import { prisma } from '@/lib/database/prisma';
import DashboardLayout from './layout-client';

export default async function DashboardLayoutServer({
  children,
}: {
  children: React.ReactNode;
}) {
  const authContext = await getAuthContext();

  // Get user's accessible clinics
  let clinics = [];
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

  return (
    <DashboardLayout
      clinics={clinics}
      currentClinicId={authContext?.selectedClinicId}
      isSystemAdmin={authContext?.isSystemAdmin || false}
    >
      {children}
    </DashboardLayout>
  );
}
