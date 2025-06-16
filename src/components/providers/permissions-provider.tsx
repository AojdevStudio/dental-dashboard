'use client';

import { PermissionsContext, createPermissionsValue } from '@/hooks/use-permissions';
import type { PermissionsContextValue } from '@/hooks/use-permissions';
import { useUser } from '@/hooks/use-user';
import React from 'react';

/**
 * Props for PermissionsProvider
 */
export interface PermissionsProviderProps {
  children: React.ReactNode;
  /** Override permissions for testing */
  overridePermissions?: Partial<PermissionsContextValue>;
}

/**
 * Provider component that supplies permissions context to the application
 */
export function PermissionsProvider({ children, overridePermissions }: PermissionsProviderProps) {
  const { user, isLoading } = useUser();

  // Create permissions value from user data
  const permissionsValue = React.useMemo(() => {
    if (isLoading) {
      // Return loading state permissions
      return createPermissionsValue(null);
    }

    const basePermissions = createPermissionsValue(user);

    // Apply overrides if provided (useful for testing)
    if (overridePermissions) {
      return {
        ...basePermissions,
        ...overridePermissions,
      };
    }

    return basePermissions;
  }, [user, isLoading, overridePermissions]);

  return (
    <PermissionsContext.Provider value={permissionsValue}>{children}</PermissionsContext.Provider>
  );
}

export default PermissionsProvider;
