"use client";

/**
 * @file Radio Group Components
 * @description This file provides `RadioGroup` and `RadioGroupItem` components, which are styled wrappers
 * around the `@radix-ui/react-radio-group` primitives. These components allow users to select one option
 * from a set.
 * This module is intended for client-side rendering.
 */

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * @component RadioGroup
 * @description A container for multiple radio buttons, allowing a user to select a single option from a set.
 * This component wraps the `RadioGroupPrimitive.Root` from Radix UI.
 *
 * @param {React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>} props - Props for the RadioGroup component.
 * @param {string} [props.className] - Additional CSS class names to apply to the radio group container.
 * @param {React.Ref<React.ElementRef<typeof RadioGroupPrimitive.Root>>} ref - Forwarded ref to the underlying Radix UI Root element.
 * @returns {JSX.Element} The rendered radio group container.
 *
 * @example
 * <RadioGroup defaultValue="option-one">
 *   <RadioGroupItem value="option-one" id="r1" />
 *   <label htmlFor="r1">Option One</label>
 *   <RadioGroupItem value="option-two" id="r2" />
 *   <label htmlFor="r2">Option Two</label>
 * </RadioGroup>
 */
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

/**
 * @component RadioGroupItem
 * @description An individual radio button item within a `RadioGroup`.
 * This component wraps the `RadioGroupPrimitive.Item` from Radix UI and includes a visual indicator.
 *
 * @param {React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>} props - Props for the RadioGroupItem component.
 * @param {string} [props.className] - Additional CSS class names to apply to the radio group item.
 * @param {React.Ref<React.ElementRef<typeof RadioGroupPrimitive.Item>>} ref - Forwarded ref to the underlying Radix UI Item element.
 * @returns {JSX.Element} The rendered radio group item.
 *
 * @example
 * <RadioGroupItem value="compact" id="rCompact" />
 * <label htmlFor="rCompact">Compact</label>
 */
const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {/* Visual indicator for the selected state, using a Circle icon */}
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

/**
 * @module radio-group
 * @description Exports the `RadioGroup` and `RadioGroupItem` components for use in forms and selection contexts.
 */
export { RadioGroup, RadioGroupItem };
