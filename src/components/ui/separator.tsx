/**
 * @fileoverview Separator Component
 *
 * This file implements an accessible separator component based on Radix UI's Separator primitive.
 * A separator is a visual divider that separates content into groups, typically rendered as a
 * horizontal or vertical line.
 *
 * The implementation follows WCAG accessibility guidelines with proper ARIA attributes
 * and supports both horizontal and vertical orientations. It can be marked as decorative
 * when it doesn't represent a semantic boundary in content.
 */

"use client";

import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Separator component for visually dividing content
 *
 * A visual divider that separates content into groups. Can be rendered as
 * either a horizontal or vertical line with consistent styling. When used
 * decoratively, it doesn't represent a semantic boundary in content.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {('horizontal'|'vertical')} [props.orientation='horizontal'] - The orientation of the separator
 * @param {boolean} [props.decorative=true] - When true, indicates the separator is purely visual and not a semantic boundary
 * @param {React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>} props.props - All standard separator attributes
 * @returns {JSX.Element} The separator element
 *
 * @example
 * // Horizontal separator (default)
 * <Separator className="my-4" />
 *
 * @example
 * // Vertical separator
 * <div className="flex h-5 items-center">
 *   <div>Content left</div>
 *   <Separator orientation="vertical" className="mx-2" />
 *   <div>Content right</div>
 * </div>
 */
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

/**
 * Export the Separator component for use throughout the application
 */
export { Separator };
