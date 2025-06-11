import { prisma } from '@/lib/database/prisma';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { authId, email, name, clinicName, role } = body;

    if (!(authId && email && name && clinicName && role)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Start a transaction to create clinic and user
    const result = await prisma.$transaction(async (tx) => {
      // Create or find clinic
      let clinic = await tx.clinic.findFirst({
        where: { name: clinicName },
      });

      if (!clinic) {
        clinic = await tx.clinic.create({
          data: {
            id: `clinic-${Date.now()}`,
            name: clinicName,
            location: 'To be updated',
            status: 'active',
          },
        });
      }

      // Create user
      const user = await tx.user.create({
        data: {
          id: `user-${Date.now()}`,
          authId,
          email,
          name,
          role,
          clinicId: clinic.id,
        },
      });

      // Create user clinic role
      await tx.userClinicRole.create({
        data: {
          id: `ucr-${Date.now()}`,
          userId: user.id,
          clinicId: clinic.id,
          role: role === 'admin' || role === 'dentist' ? 'clinic_admin' : 'staff',
          isActive: true,
        },
      });

      return { user, clinic };
    });

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      user: result.user,
      clinic: result.clinic,
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}
