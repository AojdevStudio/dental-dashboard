/**
 * @fileoverview Auth Context Utilities for Multi-Tenant Database Access
 *
 * This module provides comprehensive user authentication and authorization context
 * for database queries in a multi-tenant dental practice management system.
 *
 * Key Features:
 * - Multi-clinic user association management
 * - Role-based access control (RBAC)
 * - System admin privileges with clinic switching
 * - Session-based context caching
 * - Service account support for system operations
 *
 * Security Model:
 * - Users can be associated with multiple clinics
 * - Each user-clinic association has a specific role
 * - System admins have access to all clinics
 * - Regular users are restricted to their associated clinics
 * - All database queries must respect these access boundaries
 */

import { cookies } from 'next/headers';
import { createClient } from '../supabase/server';
import { prisma } from './client';

/**
 * Represents the authenticated user's context and permissions within the system
 *
 * This interface defines the complete authentication and authorization context
 * that accompanies every authenticated request. It provides all necessary
 * information for implementing multi-tenant security and role-based access control.
 *
 * @interface AuthContext
 * @property {string} userId - Internal database user ID (primary key)
 * @property {string} authId - Supabase authentication user ID
 * @property {string[]} clinicIds - Array of clinic IDs the user has access to
 * @property {string} [currentClinicId] - User's primary clinic ID (from user record)
 * @property {string} [selectedClinicId] - Currently selected clinic for multi-clinic users
 * @property {string} [role] - System-wide user role (admin, user, etc.)
 * @property {boolean} [isSystemAdmin] - Whether user has system-wide admin privileges
 */
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
 * Retrieves the current authenticated user's context from Supabase session
 *
 * This is the primary function for obtaining user authentication and authorization
 * context within the application. It combines Supabase authentication data with
 * database user information to provide complete access control context.
 *
 * The function handles different user types:
 * - System admins: Get access to all active clinics with clinic switching capability
 * - Regular users: Get access only to their explicitly associated clinics
 * - Multi-clinic users: Support for switching between authorized clinics
 *
 * @returns Promise<AuthContext | null> Complete user context or null if not authenticated
 * @throws {Error} Does not throw - returns null for any authentication failures
 *
 * @example
 * // In an API route or server component
 * const authContext = await getAuthContext();
 * if (!authContext) {
 *   return new Response('Unauthorized', { status: 401 });
 * }
 *
 * // Use the context for database queries
 * const userClinics = authContext.clinicIds;
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    // Call cookies() before creating client to opt out of Next.js caching
    const cookieStore = await cookies();
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }
    const dbUser = await prisma.user.findUnique({
      where: { authId: user.id },
      include: {
        clinic: true,
      },
    });

    if (!dbUser) {
      return null;
    }

    const isSystemAdmin = dbUser.role === 'system_admin';
    let clinicIds: string[] = [];
    let selectedClinicId: string | undefined;

    if (isSystemAdmin) {
      // System admins have access to all clinics
      const allClinics = await prisma.clinic.findMany({
        where: { status: 'active' },
        select: { id: true },
      });
      clinicIds = allClinics.map((c) => c.id);

      // Check for selected clinic in cookies/session
      const selectedClinic = cookieStore.get('selectedClinicId');
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
    return authContext;
  } catch (_error) {
    return null;
  }
}

/**
 * Validates whether the authenticated user has access to a specific clinic
 *
 * This function is essential for multi-tenant security, ensuring that users
 * can only access data from clinics they are authorized to view. It supports
 * both regular clinic access and wildcard access for service accounts.
 *
 * @param authContext - The authenticated user's context
 * @param clinicId - The clinic ID to check access for
 * @returns boolean indicating whether access is granted
 *
 * @example
 * // Validate before querying clinic data
 * if (!validateClinicAccess(authContext, clinicId)) {
 *   throw new Error('Access denied: insufficient clinic permissions');
 * }
 *
 * @example
 * // Service account with wildcard access
 * const serviceContext = getServiceContext();
 * const hasAccess = validateClinicAccess(serviceContext, 'any-clinic-id');
 * // Returns: true (service accounts have wildcard access)
 */
export function validateClinicAccess(authContext: AuthContext, clinicId: string): boolean {
  // Check for wildcard access (service accounts)
  if (authContext.clinicIds.includes('*')) {
    return true;
  }

  // Check for specific clinic access
  return authContext.clinicIds.includes(clinicId);
}

/**
 * Retrieves the user's specific role within a given clinic
 *
 * This function queries the UserClinicRole junction table to determine
 * what role the authenticated user has in a specific clinic. This is crucial
 * for implementing fine-grained permissions within clinic contexts.
 *
 * @param authContext - The authenticated user's context
 * @param clinicId - The specific clinic ID to check role for
 * @returns Promise<string | null> The user's role in the clinic or null if no association
 *
 * @example
 * // Check if user is admin of a specific clinic
 * const role = await getUserClinicRole(authContext, 'clinic-123');
 * if (role === 'clinic_admin') {
 *   // Allow admin operations
 * }
 *
 * @example
 * // Handle missing clinic association
 * const role = await getUserClinicRole(authContext, 'clinic-456');
 * if (!role) {
 *   throw new Error('User is not associated with this clinic');
 * }
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
 * Determines whether the user has clinic admin privileges for a specific clinic
 *
 * This is a convenience function that combines clinic access validation with
 * role checking to determine if a user can perform administrative operations
 * within a specific clinic context.
 *
 * @param authContext - The authenticated user's context
 * @param clinicId - The clinic ID to check admin privileges for
 * @returns Promise<boolean> Whether the user is a clinic admin for the specified clinic
 *
 * @example
 * // Protect admin-only operations
 * if (!(await isClinicAdmin(authContext, clinicId))) {
 *   return apiError('Clinic admin privileges required', 403);
 * }
 *
 * @example
 * // Use in middleware or route handlers
 * const canManageProviders = await isClinicAdmin(authContext, 'clinic-123');
 */
export async function isClinicAdmin(authContext: AuthContext, clinicId: string): Promise<boolean> {
  // First, check for basic access
  if (!validateClinicAccess(authContext, clinicId)) {
    return false;
  }
  const role = await getUserClinicRole(authContext, clinicId);
  return role === 'clinic_admin';
}

/**
 * Retrieves auth context for a specific user using their Supabase auth ID
 *
 * This function is used in scenarios where we have a user's auth ID but not
 * their active session (e.g., webhook processing, background jobs, or API
 * operations where we need to impersonate a user's context).
 *
 * Unlike getAuthContext(), this function doesn't rely on session cookies
 * and directly queries the database using the provided auth ID.
 *
 * @param authId - The Supabase authentication user ID
 * @returns Promise<AuthContext | null> User context or null if user not found
 *
 * @example
 * // In a webhook handler
 * const authContext = await getAuthContextByAuthId(webhookData.userId);
 * if (authContext) {
 *   // Process webhook with user's clinic context
 * }
 *
 * @example
 * // In background job processing
 * for (const userId of userIds) {
 *   const context = await getAuthContextByAuthId(userId);
 *   if (context) {
 *     await processUserData(context);
 *   }
 * }
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

    const isSystemAdmin = dbUser.role === 'system_admin';
    let clinicIds: string[] = [];

    if (isSystemAdmin) {
      // System admins have access to all clinics
      const allClinics = await prisma.clinic.findMany({
        where: { status: 'active' },
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
  } catch (_error) {
    return null;
  }
}

/**
 * Updates the currently selected clinic for multi-clinic users
 *
 * This function allows users with access to multiple clinics to switch
 * their active clinic context. The selection is stored in HTTP-only cookies
 * for security and persistence across requests.
 *
 * @param clinicId - The clinic ID to set as currently selected
 * @returns Promise<void>
 * @throws {Error} Does not throw - cookie setting failures are handled gracefully
 *
 * @example
 * // User switches to different clinic
 * await updateSelectedClinic('clinic-789');
 * // Subsequent requests will use this clinic as the selected context
 *
 * @example
 * // In a clinic switcher component
 * const handleClinicChange = async (newClinicId: string) => {
 *   await updateSelectedClinic(newClinicId);
 *   window.location.reload(); // Refresh to apply new context
 * };
 */
export async function updateSelectedClinic(clinicId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('selectedClinicId', clinicId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/**
 * Retrieves the currently selected clinic ID from HTTP cookies
 *
 * This function reads the selectedClinicId cookie to determine which clinic
 * a multi-clinic user has currently selected as their active context.
 * Used in conjunction with updateSelectedClinic() for clinic switching.
 *
 * @returns Promise<string | undefined> The selected clinic ID or undefined if not set
 *
 * @example
 * // Check current clinic selection
 * const selectedClinic = await getSelectedClinicId();
 * if (selectedClinic) {
 *   // Use the selected clinic for operations
 * } else {
 *   // Fall back to user's primary clinic
 * }
 *
 * @example
 * // In server components
 * const authContext = await getAuthContext();
 * const selected = await getSelectedClinicId();
 * const activeClinic = selected || authContext?.currentClinicId;
 */
export async function getSelectedClinicId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('selectedClinicId')?.value;
}

/**
 * Creates a service account context for system-level operations
 *
 * This function returns a special AuthContext for system operations that
 * need to bypass normal user access controls. Service accounts have wildcard
 * access to all clinics and system admin privileges.
 *
 * Use Cases:
 * - Background job processing
 * - System maintenance operations
 * - Data migrations
 * - Automated sync operations
 *
 * @returns AuthContext with system-wide access privileges
 *
 * @example
 * // In a background job
 * const serviceContext = getServiceContext();
 * const allProviders = await getProviders(serviceContext);
 *
 * @example
 * // In data migration script
 * const context = getServiceContext();
 * // Can access all clinics for migration operations
 *
 * @warning This should only be used for legitimate system operations.
 * Never use service context for user-facing operations.
 */
export function getServiceContext(): AuthContext {
  return {
    userId: 'system',
    authId: 'system',
    clinicIds: ['*'], // Access to all clinics
    role: 'system',
    isSystemAdmin: true,
  };
}
