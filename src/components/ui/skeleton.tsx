/**
 * @fileoverview Skeleton Component
 *
 * This file implements a skeleton loading component for creating placeholder UI
 * during content loading states. Skeleton loaders improve perceived performance
 * by showing a visual representation of content before it's fully loaded.
 *
 * The implementation uses CSS animations to create a subtle pulse effect,
 * providing visual feedback that content is loading without using spinners
 * or progress indicators that can increase perceived wait time.
 */

import { cn } from '@/lib/utils';
// biome-ignore lint/style/useImportType: React.ComponentProps requires runtime import
import React from 'react';

/**
 * Skeleton component for loading states
 *
 * A placeholder UI element that indicates content is loading. It renders as a
 * pulsing block that can be sized and positioned to match the expected content.
 * Multiple skeleton components can be combined to create complex loading states
 * that match the layout of the expected content.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.HTMLAttributes<HTMLDivElement>} props.props - All standard div attributes
 * @returns {JSX.Element} The skeleton element
 *
 * @example
 * // Basic skeleton for text
 * <Skeleton className="h-4 w-[250px]" />
 *
 * @example
 * // Card loading state with multiple skeletons
 * <Card>
 *   <CardHeader>
 *     <Skeleton className="h-5 w-1/2" />
 *     <Skeleton className="h-4 w-4/5" />
 *   </CardHeader>
 *   <CardContent>
 *     <Skeleton className="h-32 w-full" />
 *   </CardContent>
 * </Card>
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

/**
 * Export the Skeleton component for use throughout the application
 */
export { Skeleton };
