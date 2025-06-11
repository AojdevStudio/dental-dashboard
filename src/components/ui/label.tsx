/**
 * @fileoverview Label Component
 *
 * This file implements an accessible label component based on Radix UI's Label primitive.
 * The label component is designed to be used with form controls and provides proper
 * accessibility attributes and styling for different states including disabled states.
 *
 * It follows WCAG accessibility guidelines for form labels and supports all standard
 * label attributes and behaviors.
 */

'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import type React from 'react';

import { cn } from '@/lib/utils';

/**
 * Label component for form controls
 *
 * A styled label component that provides proper accessibility and styling
 * for form controls. It automatically handles disabled states of associated
 * form elements through peer-* and group-data-* selectors.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.ComponentProps<typeof LabelPrimitive.Root>} props.props - All standard label attributes
 * @returns {JSX.Element} The label element
 *
 * @example
 * // Basic label with input
 * <div className="grid gap-2">
 *   <Label htmlFor="email">Email address</Label>
 *   <Input id="email" type="email" />
 * </div>
 *
 * @example
 * // Label with disabled input
 * <div className="grid gap-2">
 *   <Label htmlFor="disabled-input">Disabled field</Label>
 *   <Input id="disabled-input" disabled />
 * </div>
 */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      class={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

/**
 * Export the Label component for use throughout the application
 */
export { Label };
