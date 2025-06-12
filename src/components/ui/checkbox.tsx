/**
 * @file Checkbox Component
 * @description This file defines a reusable Checkbox component.
 * It is built on top of the `@radix-ui/react-checkbox` primitive, providing default styling
 * using Tailwind CSS and the `cn` utility. The component is client-side rendered.
 */
'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * @component Checkbox
 * @description A styled checkbox component that wraps the `@radix-ui/react-checkbox` primitive.
 * It supports all props of the Radix Checkbox Root and Indicator components and applies
 * custom styling for a consistent look and feel within the application.
 * The component forwards its ref to the underlying Radix Checkbox Root element.
 *
 * @param {object} props - The properties for the Checkbox component.
 * @param {string} [props.className] - Additional CSS classes to apply to the checkbox root element.
 * @param {React.Ref<React.ElementRef<typeof CheckboxPrimitive.Root>>} ref - Forwarded ref to the Radix Checkbox Root element.
 * @returns {JSX.Element} The rendered Checkbox component.
 * @example
 * <Checkbox id="terms" />
 * <label htmlFor="terms">Accept terms and conditions</label>
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
