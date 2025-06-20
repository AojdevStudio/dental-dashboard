/**
 * @fileoverview Sonner Toast Component with theme integration
 *
 * Provides toast notifications with automatic theme synchronization
 * for consistent styling across the application.
 */

'use client';

import { useTheme } from 'next-themes';
// biome-ignore lint/style/useImportType: React.CSSProperties requires runtime import
import React from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

/**
 * Themed wrapper for Sonner's toast notification system
 *
 * @param {ToasterProps} props - Sonner Toaster component props
 * @returns {JSX.Element} The themed toast container
 * @example
 * <Toaster position="bottom-right" />
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

/**
 * Export the Toaster component for use throughout the application
 */
export { Toaster };
