'use client';

import type { ProviderWithLocations } from '@/types/providers';
import { useRouter } from 'next/navigation';
import React, { cloneElement, isValidElement } from 'react';

/**
 * Context for provider actions
 */
interface ProviderActionsContextType {
  onViewProvider: (provider: ProviderWithLocations) => void;
  onEditProvider: (provider: ProviderWithLocations) => void;
  onManageLocations: (provider: ProviderWithLocations) => void;
}

const ProviderActionsContext = React.createContext<ProviderActionsContextType | null>(null);

/**
 * Hook to access provider actions context
 */
export function useProviderActions() {
  const context = React.useContext(ProviderActionsContext);
  if (!context) {
    throw new Error('useProviderActions must be used within a ProviderActions provider');
  }
  return context;
}

/**
 * Provider Actions Component
 *
 * Provides action handlers for provider-related operations including navigation
 * to provider detail pages, editing, and location management.
 *
 * Implements AC1 navigation requirement from Story 1.1
 */
interface ProviderActionsProps {
  children: React.ReactNode;
  onCustomViewProvider?: (provider: ProviderWithLocations) => void;
  onCustomEditProvider?: (provider: ProviderWithLocations) => void;
  onCustomManageLocations?: (provider: ProviderWithLocations) => void;
}

export function ProviderActions({
  children,
  onCustomViewProvider,
  onCustomEditProvider,
  onCustomManageLocations,
}: ProviderActionsProps) {
  const router = useRouter();

  /**
   * Navigate to provider detail page
   * Implements the "View" button functionality from provider cards
   */
  const handleViewProvider = React.useCallback(
    (provider: ProviderWithLocations) => {
      if (onCustomViewProvider) {
        onCustomViewProvider(provider);
        return;
      }

      try {
        // Navigate to provider detail page using the dynamic route
        router.push(`/providers/${provider.id}`);
      } catch (error) {
        console.error('Navigation error:', error);
        console.error('Failed to navigate to provider details');
      }
    },
    [router, onCustomViewProvider]
  );

  /**
   * Handle provider editing
   * Placeholder for future implementation
   */
  const handleEditProvider = React.useCallback(
    (provider: ProviderWithLocations) => {
      if (onCustomEditProvider) {
        onCustomEditProvider(provider);
        return;
      }
    },
    [onCustomEditProvider]
  );

  /**
   * Handle location management
   * Placeholder for future implementation
   */
  const handleManageLocations = React.useCallback(
    (provider: ProviderWithLocations) => {
      if (onCustomManageLocations) {
        onCustomManageLocations(provider);
        return;
      }
    },
    [onCustomManageLocations]
  );

  const contextValue: ProviderActionsContextType = {
    onViewProvider: handleViewProvider,
    onEditProvider: handleEditProvider,
    onManageLocations: handleManageLocations,
  };

  return (
    <ProviderActionsContext.Provider value={contextValue}>
      {/* Clone child components and inject action handlers if they support them */}
      {React.Children.map(children, (child) => {
        if (isValidElement(child)) {
          // Check if the child component accepts provider action props
          const childProps = child.props as Record<string, unknown>;
          const hasActionProps =
            'onProviderView' in childProps ||
            'onProviderEdit' in childProps ||
            'onProviderClick' in childProps;

          if (hasActionProps) {
            return cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              ...childProps,
              onProviderView: handleViewProvider,
              onProviderEdit: handleEditProvider,
              onProviderClick: handleViewProvider, // Default click action is to view
            });
          }
        }
        return child;
      })}
    </ProviderActionsContext.Provider>
  );
}

/**
 * Action Button Components for use in provider cards
 */
interface ActionButtonProps {
  provider: ProviderWithLocations;
  variant?: 'view' | 'edit' | 'locations';
  className?: string;
  children?: React.ReactNode;
}

export function ProviderActionButton({
  provider,
  variant = 'view',
  className = '',
  children,
}: ActionButtonProps) {
  const { onViewProvider, onEditProvider, onManageLocations } = useProviderActions();

  const handleClick = () => {
    switch (variant) {
      case 'view':
        onViewProvider(provider);
        break;
      case 'edit':
        onEditProvider(provider);
        break;
      case 'locations':
        onManageLocations(provider);
        break;
      default:
        onViewProvider(provider);
    }
  };

  const defaultLabel = {
    view: 'View Details',
    edit: 'Edit Provider',
    locations: 'Manage Locations',
  }[variant];

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1 text-sm font-medium ${className}`}
    >
      {children || defaultLabel}
    </button>
  );
}

export default ProviderActions;
