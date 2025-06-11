import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/database/prisma';
import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

// Type for registration request data
interface RegistrationData {
  email: string;
  password: string;
  fullName: string;
  role: string;
  phone?: string;
  clinicMode: 'join' | 'create';
  clinicRegistrationCode?: string;
  newClinic?: {
    name: string;
    location: string;
  };
  providerInfo?: {
    providerType?: string;
  };
}

// Generate a 6-character alphanumeric clinic code
function generateClinicCode(): string {
  return randomBytes(3).toString('hex').toUpperCase();
}

export async function POST(request: NextRequest) {
  let data: RegistrationData;

  try {
    data = await request.json();
    const supabase = await createClient();

    // Validate required fields
    if (!(data.email && data.password && data.fullName && data.role)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      let clinicId: string;
      let isNewClinic = false;

      // Handle clinic association
      if (data.clinicMode === 'join') {
        // Verify clinic registration code
        if (!data.clinicRegistrationCode) {
          throw new Error('Clinic registration code is required');
        }

        const clinic = await tx.clinic.findFirst({
          where: {
            registrationCode: data.clinicRegistrationCode.toUpperCase(),
          },
        });

        if (!clinic) {
          throw new Error('Invalid clinic registration code');
        }

        clinicId = clinic.id;
      } else {
        // Create new clinic
        if (!(data.newClinic?.name && data.newClinic?.location)) {
          throw new Error('Clinic name and location are required');
        }

        const newClinic = await tx.clinic.create({
          data: {
            id: `clinic-${Date.now()}`,
            name: data.newClinic.name,
            location: data.newClinic.location,
            status: 'active',
            registrationCode: generateClinicCode(),
          },
        });

        clinicId = newClinic.id;
        isNewClinic = true;
      }

      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
            phone: data.phone || null,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Failed to create auth user');
      }

      // Create database user
      const dbUser = await tx.user.create({
        data: {
          id: `user-${Date.now()}`,
          authId: authData.user.id,
          email: data.email,
          name: data.fullName,
          role: data.role,
          clinicId: clinicId,
        },
      });

      // Create user clinic role
      const clinicRole =
        data.role === 'admin' || (data.role === 'dentist' && isNewClinic)
          ? 'clinic_admin'
          : 'staff';

      await tx.userClinicRole.create({
        data: {
          id: `ucr-${Date.now()}`,
          userId: dbUser.id,
          clinicId: clinicId,
          role: clinicRole,
          isActive: true,
          createdBy: 'system',
        },
      });

      // Create provider record if needed
      if (data.role === 'dentist' && data.providerInfo) {
        await tx.provider.create({
          data: {
            id: `provider-${Date.now()}`,
            name: data.fullName,
            providerType: data.providerInfo.providerType || 'dentist',
            status: 'active',
            clinicId: clinicId,
          },
        });
      }

      // If creating a new clinic, generate a registration code for future users
      if (isNewClinic) {
      }

      return {
        user: dbUser,
        authUser: authData.user,
        clinicId,
        isNewClinic,
      };
    });

    return NextResponse.json({
      success: true,
      message: result.isNewClinic
        ? 'Registration successful! Check your email to verify your account. You can now invite team members to your clinic.'
        : 'Registration successful! Check your email to verify your account.',
      userId: result.user.id,
      clinicId: result.clinicId,
    });
  } catch (error) {
    // Note: In production, you'd want to handle cleanup of partial registrations
    // This could be done via a scheduled job or admin API
    if (data?.email) {
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Registration failed',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 400 }
    );
  }
}
