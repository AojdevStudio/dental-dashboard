/**
 * Auth Context Utilities
 * Provides user and clinic context for database queries
 */

import { cookies } from "next/headers";
import { createClient } from "../supabase/server";
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
    console.log("🔍 Starting getAuthContext...");
    // Call cookies() before creating client to opt out of Next.js caching
    const cookieStore = await cookies();
    const supabase = await createClient();

    console.log("📡 Getting Supabase user...");
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.log("❌ Supabase auth failed:", error?.message || "No user");
      return null;
    }

    console.log("✅ Supabase user found:", user.email, "ID:", user.id);

    // Get user details and clinic access
    console.log("🔍 Looking up database user with authId:", user.id);
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      include: {
        clinic: true,
      },
    });

    if (!dbUser) {
      console.log("❌ Database user not found for authId:", user.id);
      return null;
    }

    console.log("✅ Database user found:", dbUser.email, "Role:", dbUser.role);

    const isSystemAdmin = dbUser.role === "system_admin";
    let clinicIds: string[] = [];
    let selectedClinicId: string | undefined;

    if (isSystemAdmin) {
      console.log("👑 System admin detected, fetching all active clinics...");
      // System admins have access to all clinics
      const allClinics = await prisma.clinic.findMany({
        where: { status: "active" },
        select: { id: true },
      });
      console.log("🏥 Found clinics:", allClinics);
      clinicIds = allClinics.map((c) => c.id);
      console.log("🆔 Clinic IDs:", clinicIds);

      // Check for selected clinic in cookies/session
      const selectedClinic = cookieStore.get("selectedClinicId");
      selectedClinicId = selectedClinic?.value || clinicIds[0];
      console.log("🎯 Selected clinic ID:", selectedClinicId);
    } else {
      console.log("👤 Regular user, fetching clinic roles...");
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
      console.log("🔑 Clinic access found:", clinicAccess);
      clinicIds = clinicAccess.map((ca) => ca.clinicId);
      selectedClinicId = dbUser.clinicId || undefined; // Use primary clinic for regular users
    }

    const authContext = {
      userId: dbUser.id,
      authId: user.id,
      clinicIds,
      currentClinicId: dbUser.clinicId || undefined, // Primary clinic
      selectedClinicId,
      role: dbUser.role,
      isSystemAdmin,
    };

    console.log("🎉 Auth context created successfully:", authContext);
    return authContext;
  } catch (error) {
    console.error("❌ Error getting auth context:", error);
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
      currentClinicId: dbUser.clinicId || undefined, // Primary clinic
      selectedClinicId: dbUser.clinicId || undefined, // Default to primary clinic
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
