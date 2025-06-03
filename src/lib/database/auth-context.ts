/**
 * Auth Context Utilities
 * Provides user and clinic context for database queries
 */

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { prisma } from "./client";

export interface AuthContext {
  userId: string;
  authId: string;
  clinicIds: string[];
  currentClinicId?: string;
  selectedClinicId?: string; // For multi-clinic users to switch context
  role?: string;
  isSystemAdmin?: boolean;
}

/**
 * Get the current auth context from Supabase session
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Get user details and clinic access
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      include: {
        clinic: true,
      },
    });

    if (!dbUser) {
      return null;
    }

    const isSystemAdmin = dbUser.role === "system_admin";
    let clinicIds: string[] = [];
    let selectedClinicId: string | undefined;

    if (isSystemAdmin) {
      // System admins have access to all clinics
      const allClinics = await prisma.clinic.findMany({
        where: { status: "active" },
        select: { id: true },
      });
      clinicIds = allClinics.map((c) => c.id);
      
      // Check for selected clinic in cookies/session
      const selectedClinic = cookieStore.get("selectedClinicId");
      selectedClinicId = selectedClinic?.value || clinicIds[0];
    } else {
      // Regular users get clinic access from UserClinicRole
      const clinicAccess = await prisma.userClinicRole.findMany({
        where: {
          userId: dbUser.id,
          isActive: true,
        },
        select: {
          clinicId: true,
          role: true,
        },
      });
      clinicIds = clinicAccess.map((ca) => ca.clinicId);
      selectedClinicId = dbUser.clinicId; // Use primary clinic for regular users
    }

    return {
      userId: dbUser.id,
      authId: user.id,
      clinicIds,
      currentClinicId: dbUser.clinicId, // Primary clinic
      selectedClinicId,
      role: dbUser.role,
      isSystemAdmin,
    };
  } catch (error) {
    console.error("Error getting auth context:", error);
    return null;
  }
}

/**
 * Validate user has access to a specific clinic
 */
export async function validateClinicAccess(
  authContext: AuthContext,
  clinicId: string
): Promise<boolean> {
  return authContext.clinicIds.includes(clinicId);
}

/**
 * Get user's role in a specific clinic
 */
export async function getUserClinicRole(
  authContext: AuthContext,
  clinicId: string
): Promise<string | null> {
  const role = await prisma.userClinicRole.findUnique({
    where: {
      userId_clinicId: {
        userId: authContext.userId,
        clinicId: clinicId,
      },
    },
    select: {
      role: true,
    },
  });

  return role?.role || null;
}

/**
 * Check if user is a clinic admin
 */
export async function isClinicAdmin(authContext: AuthContext, clinicId: string): Promise<boolean> {
  const role = await getUserClinicRole(authContext, clinicId);
  return role === "clinic_admin";
}

/**
 * Get auth context for a specific user by auth ID
 * Used for scenarios where we have the user ID but not the full session
 */
export async function getAuthContextByAuthId(authId: string): Promise<AuthContext | null> {
  try {
    // Get user details and clinic access
    const dbUser = await prisma.user.findUnique({
      where: { authId },
      include: {
        clinic: true,
      },
    });

    if (!dbUser) {
      return null;
    }

    const isSystemAdmin = dbUser.role === "system_admin";
    let clinicIds: string[] = [];

    if (isSystemAdmin) {
      // System admins have access to all clinics
      const allClinics = await prisma.clinic.findMany({
        where: { status: "active" },
        select: { id: true },
      });
      clinicIds = allClinics.map((c) => c.id);
    } else {
      // Regular users get clinic access from UserClinicRole
      const clinicAccess = await prisma.userClinicRole.findMany({
        where: {
          userId: dbUser.id,
          isActive: true,
        },
        select: {
          clinicId: true,
          role: true,
        },
      });
      clinicIds = clinicAccess.map((ca) => ca.clinicId);
    }

    return {
      userId: dbUser.id,
      authId,
      clinicIds,
      currentClinicId: dbUser.clinicId, // Primary clinic
      selectedClinicId: dbUser.clinicId, // Default to primary clinic
      role: dbUser.role,
      isSystemAdmin,
    };
  } catch (error) {
    console.error("Error getting auth context by ID:", error);
    return null;
  }
}

/**
 * Update the selected clinic for the current user
 */
export async function updateSelectedClinic(clinicId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("selectedClinicId", clinicId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Get the selected clinic ID from cookies
 */
export async function getSelectedClinicId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("selectedClinicId")?.value;
}

/**
 * Service account context for system operations
 */
export function getServiceContext(): AuthContext {
  return {
    userId: "system",
    authId: "system",
    clinicIds: ["*"], // Access to all clinics
    role: "system",
    isSystemAdmin: true,
  };
}
