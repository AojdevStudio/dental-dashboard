/**
 * Query Utilities
 * Helper functions for multi-tenant database queries
 */

import type { AuthContext } from "../auth-context";

/**
 * Get clinic filter for queries based on auth context
 * System admins can see all clinics or filter by selected clinic
 * Regular users are restricted to their accessible clinics
 */
export function getClinicFilter(
  authContext: AuthContext,
  requestedClinicId?: string
): string | string[] | undefined {
  // If specific clinic requested, validate access
  if (requestedClinicId) {
    // System admins can access any clinic
    if (authContext.isSystemAdmin) {
      return requestedClinicId;
    }

    // Regular users must have access to the requested clinic
    if (authContext.clinicIds.includes(requestedClinicId)) {
      return requestedClinicId;
    }

    // No access to requested clinic
    throw new Error("Access denied to requested clinic");
  }

  // No specific clinic requested
  if (authContext.isSystemAdmin) {
    // System admin: use selected clinic or show all
    return authContext.selectedClinicId === "all"
      ? undefined // No filter = all clinics
      : authContext.selectedClinicId;
  }

  // Regular user: filter by accessible clinics
  if (authContext.clinicIds.length === 1) {
    return authContext.clinicIds[0];
  }

  return authContext.clinicIds;
}

/**
 * Build where clause for clinic filtering
 */
export function buildClinicWhereClause(
  authContext: AuthContext,
  requestedClinicId?: string
): { clinicId?: string | { in: string[] } } {
  const clinicFilter = getClinicFilter(authContext, requestedClinicId);

  if (!clinicFilter) {
    return {}; // No filter for system admins viewing all
  }

  if (Array.isArray(clinicFilter)) {
    return { clinicId: { in: clinicFilter } };
  }

  return { clinicId: clinicFilter };
}
