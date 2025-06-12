import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/database/prisma';
import type { Prisma, User } from '@prisma/client';
import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

// Type for registration request data
export interface RegistrationData {
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

interface RegistrationResult {
  user: User;
  authUser: SupabaseUser;
  clinicId: string;
  isNewClinic: boolean;
}

// Generate a 6-character alphanumeric clinic code
function generateClinicCode(): string {
  return randomBytes(3).toString('hex').toUpperCase();
}

export class RegistrationService {
  constructor(private supabase: SupabaseClient) {}

  async register(data: RegistrationData): Promise<RegistrationResult> {
    // Validate required fields
    this.validateRequiredFields(data);

    // Execute registration in transaction
    return await prisma.$transaction(async (tx) => {
      // Handle clinic association
      const { clinicId, isNewClinic } = await this.handleClinicAssociation(data, tx);

      // Create Supabase auth user
      const authUser = await this.createAuthUser(data);

      // Create database records
      const user = await this.createDatabaseRecords(data, authUser, clinicId, isNewClinic, tx);

      return {
        user,
        authUser,
        clinicId,
        isNewClinic,
      };
    });
  }

  private validateRequiredFields(data: RegistrationData): void {
    if (!(data.email && data.password && data.fullName && data.role)) {
      throw new Error('Missing required fields');
    }
  }

  private async handleClinicAssociation(
    data: RegistrationData,
    tx: Prisma.TransactionClient
  ): Promise<{ clinicId: string; isNewClinic: boolean }> {
    if (data.clinicMode === 'join') {
      return await this.joinExistingClinic(data, tx);
    }
    return await this.createNewClinic(data, tx);
  }

  private async joinExistingClinic(
    data: RegistrationData,
    tx: Prisma.TransactionClient
  ): Promise<{ clinicId: string; isNewClinic: boolean }> {
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

    return { clinicId: clinic.id, isNewClinic: false };
  }

  private async createNewClinic(
    data: RegistrationData,
    tx: Prisma.TransactionClient
  ): Promise<{ clinicId: string; isNewClinic: boolean }> {
    // Validate new clinic data
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

    return { clinicId: newClinic.id, isNewClinic: true };
  }

  private async createAuthUser(data: RegistrationData): Promise<SupabaseUser> {
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
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

    return authData.user;
  }

  private async createDatabaseRecords(
    data: RegistrationData,
    authUser: SupabaseUser,
    clinicId: string,
    isNewClinic: boolean,
    tx: Prisma.TransactionClient
  ): Promise<User> {
    // Create database user
    const dbUser = await tx.user.create({
      data: {
        id: `user-${Date.now()}`,
        authId: authUser.id,
        email: data.email,
        name: data.fullName,
        role: data.role,
        clinicId: clinicId,
      },
    });

    // Create user clinic role
    await this.createUserClinicRole(dbUser.id, clinicId, data.role, isNewClinic, tx);

    // Create provider record if needed
    if (data.role === 'dentist' && data.providerInfo) {
      await this.createProviderRecord(data, clinicId, tx);
    }

    return dbUser;
  }

  private async createUserClinicRole(
    userId: string,
    clinicId: string,
    role: string,
    isNewClinic: boolean,
    tx: Prisma.TransactionClient
  ): Promise<void> {
    const clinicRole =
      role === 'admin' || (role === 'dentist' && isNewClinic) ? 'clinic_admin' : 'staff';

    await tx.userClinicRole.create({
      data: {
        id: `ucr-${Date.now()}`,
        userId: userId,
        clinicId: clinicId,
        role: clinicRole,
        isActive: true,
        createdBy: 'system',
      },
    });
  }

  private async createProviderRecord(
    data: RegistrationData,
    clinicId: string,
    tx: Prisma.TransactionClient
  ): Promise<void> {
    await tx.provider.create({
      data: {
        id: `provider-${Date.now()}`,
        name: data.fullName,
        providerType: data.providerInfo?.providerType || 'dentist',
        status: 'active',
        clinicId: clinicId,
      },
    });
  }
}
