'use client';

import type { User } from '@supabase/supabase-js';
import React, { createContext, useContext } from 'react';

/**
 * Permission context interface
 */
export interface PermissionsContextValue {
  user: User | null;
  /** Check if user can edit providers in a specific clinic */
  canEditProvider: (clinicId: string) => boolean;
  /** Check if user can view provider details */
  canViewProviderDetails: (clinicId: string) => boolean;
  /** Check if user can manage provider locations */
  canManageProviderLocations: (clinicId: string) => boolean;
  /** Check if user can create new providers */
  canCreateProvider: (clinicId: string) => boolean;
  /** Check if user can delete providers */
  canDeleteProvider: (clinicId: string) => boolean;
  /** Check if user can view provider performance metrics */
  canViewProviderMetrics: (clinicId: string) => boolean;
  /** Check if user can access clinic data */
  canAccessClinic: (clinicId: string) => boolean;
  /** Check if user is a system admin */
  isSystemAdmin: () => boolean;
  /** Check if user is a clinic admin */
  isClinicAdmin: (clinicId: string) => boolean;
  /** Get user's accessible clinic IDs */
  getAccessibleClinics: () => string[];
}

/**
 * Default permissions context value
 */
const defaultPermissions: PermissionsContextValue = {
  user: null,
  canEditProvider: () => false,
  canViewProviderDetails: () => false,
  canManageProviderLocations: () => false,
  canCreateProvider: () => false,
  canDeleteProvider: () => false,
  canViewProviderMetrics: () => false,
  canAccessClinic: () => false,
  isSystemAdmin: () => false,
  isClinicAdmin: () => false,
  getAccessibleClinics: () => [],
};

/**
 * Permissions context
 */
export const PermissionsContext = createContext<PermissionsContextValue>(defaultPermissions);

/**
 * Hook to access permissions
 */
export function usePermissions(): PermissionsContextValue {
  const context = useContext(PermissionsContext);

  if (!context) {
    // biome-ignore lint/nursery/noSecrets: This is an error message, not a secret
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }

  return context;
}

/**
 * Type for user roles
 */
export type UserRole =
  | 'system_admin'
  | 'clinic_admin'
  | 'clinic_manager'
  | 'clinic_staff'
  | 'viewer';

/**
 * Interface for user clinic access
 */
export interface UserClinicAccess {
  clinicId: string;
  role: UserRole;
  permissions: string[];
}

/**
 * Extract user role from Supabase user metadata
 */
export function getUserRole(user: User | null): UserRole {
  if (!user) {
    return 'viewer';
  }

  const role = user.app_metadata?.role || user.user_metadata?.role;

  // Validate role against known roles
  const validRoles: UserRole[] = [
    'system_admin',
    'clinic_admin',
    'clinic_manager',
    'clinic_staff',
    'viewer',
  ];

  if (validRoles.includes(role)) {
    return role as UserRole;
  }

  // Default to viewer if role is not recognized
  return 'viewer';
}

/**
 * Extract user clinic access from Supabase user metadata
 */
export function getUserClinicAccess(user: User | null): UserClinicAccess[] {
  if (!user) {
    return [];
  }

  const clinicAccess = user.app_metadata?.clinic_access || user.user_metadata?.clinic_access || [];

  if (!Array.isArray(clinicAccess)) {
    return [];
  }

  return clinicAccess.filter(
    (access: unknown): access is UserClinicAccess =>
      access !== null &&
      access !== undefined &&
      typeof access === 'object' &&
      'clinicId' in access &&
      'role' in access &&
      typeof (access as Record<string, unknown>).clinicId === 'string' &&
      typeof (access as Record<string, unknown>).role === 'string'
  );
}

/**
 * Create permissions context value from user
 */
export function createPermissionsValue(user: User | null): PermissionsContextValue {
  const userRole = getUserRole(user);
  const clinicAccess = getUserClinicAccess(user);

  // Get accessible clinic IDs
  const getAccessibleClinics = (): string[] => {
    if (userRole === 'system_admin') {
      // System admins can access all clinics
      // This would typically come from a separate API call
      return [];
    }

    return clinicAccess.map((access) => access.clinicId);
  };

  // Check if user is system admin
  const isSystemAdmin = (): boolean => {
    return userRole === 'system_admin';
  };

  // Check if user is clinic admin for specific clinic
  const isClinicAdmin = (clinicId: string): boolean => {
    if (isSystemAdmin()) {
      return true;
    }

    const access = clinicAccess.find((a) => a.clinicId === clinicId);
    return access?.role === 'clinic_admin';
  };

  // Check if user can access clinic
  const canAccessClinic = (clinicId: string): boolean => {
    if (isSystemAdmin()) {
      return true;
    }

    return clinicAccess.some((access) => access.clinicId === clinicId);
  };

  // Check if user can edit providers
  const canEditProvider = (clinicId: string): boolean => {
    if (!canAccessClinic(clinicId)) {
      return false;
    }

    if (isSystemAdmin() || isClinicAdmin(clinicId)) {
      return true;
    }

    const access = clinicAccess.find((a) => a.clinicId === clinicId);
    return (
      access?.role === 'clinic_manager' || (access?.permissions || []).includes('edit_providers')
    );
  };

  // Check if user can view provider details
  const canViewProviderDetails = (clinicId: string): boolean => {
    if (!canAccessClinic(clinicId)) {
      return false;
    }

    // All users with clinic access can view provider details
    return true;
  };

  // Check if user can manage provider locations
  const canManageProviderLocations = (clinicId: string): boolean => {
    if (!canAccessClinic(clinicId)) {
      return false;
    }

    if (isSystemAdmin() || isClinicAdmin(clinicId)) {
      return true;
    }

    const access = clinicAccess.find((a) => a.clinicId === clinicId);
    return (
      access?.role === 'clinic_manager' || (access?.permissions || []).includes('manage_locations')
    );
  };

  // Check if user can create providers
  const canCreateProvider = (clinicId: string): boolean => {
    if (!canAccessClinic(clinicId)) {
      return false;
    }

    if (isSystemAdmin() || isClinicAdmin(clinicId)) {
      return true;
    }

    const access = clinicAccess.find((a) => a.clinicId === clinicId);
    return (
      access?.role === 'clinic_manager' || (access?.permissions || []).includes('create_providers')
    );
  };

  // Check if user can delete providers
  const canDeleteProvider = (clinicId: string): boolean => {
    if (!canAccessClinic(clinicId)) {
      return false;
    }

    // Only system admins and clinic admins can delete providers
    return isSystemAdmin() || isClinicAdmin(clinicId);
  };

  // Check if user can view provider metrics
  const canViewProviderMetrics = (clinicId: string): boolean => {
    if (!canAccessClinic(clinicId)) {
      return false;
    }

    if (isSystemAdmin() || isClinicAdmin(clinicId)) {
      return true;
    }

    const access = clinicAccess.find((a) => a.clinicId === clinicId);
    return access?.role !== 'viewer';
  };

  return {
    user,
    canEditProvider,
    canViewProviderDetails,
    canManageProviderLocations,
    canCreateProvider,
    canDeleteProvider,
    canViewProviderMetrics,
    canAccessClinic,
    isSystemAdmin,
    isClinicAdmin,
    getAccessibleClinics,
  };
}

/**
 * Higher-order component for permission-based rendering
 */
export function withPermission<T extends object>(
  Component: React.ComponentType<T>,
  permission: (permissions: PermissionsContextValue) => boolean,
  fallback?: React.ComponentType<T> | null
) {
  return function PermissionWrappedComponent(props: T) {
    const permissions = usePermissions();

    if (permission(permissions)) {
      return React.createElement(Component, props);
    }

    if (fallback) {
      return React.createElement(fallback, props);
    }

    return null;
  };
}

/**
 * Hook for conditional rendering based on permissions
 */
export function usePermissionCheck(
  permission: (permissions: PermissionsContextValue) => boolean
): boolean {
  const permissions = usePermissions();
  return permission(permissions);
}
