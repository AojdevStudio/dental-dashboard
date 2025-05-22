/**
 * @fileoverview Badge Component
 * 
 * This file implements a badge component for displaying short status descriptors.
 * Badges are small visual indicators typically used to highlight status, count, or categorize items.
 * 
 * The implementation uses class-variance-authority (CVA) to manage style variants,
 * allowing for consistent styling across different badge types (default, secondary, destructive, outline).
 * 
 * Badges are designed to be compact, visually distinct, and accessible with appropriate focus states.
 */

import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Style variants for the Badge component
 * 
 * Defines the base styles and variants for badges using class-variance-authority.
 * The base style includes rounded corners, small padding, and focus states for accessibility.
 * 
 * @type {Function}
 * @param {Object} [props] - Style variant properties
 * @param {string} [props.variant] - The badge style variant
 * @returns {string} The composed class names based on the selected variant
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Props for the Badge component
 * 
 * @typedef {Object} BadgeProps
 * @property {string} [variant] - The visual style variant of the badge (default, secondary, destructive, outline)
 * @property {string} [className] - Additional CSS class names to apply to the badge
 * @property {React.ReactNode} children - The content to display inside the badge
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge component for displaying status, count, or category indicators
 * 
 * Badges are small, visually distinct elements used to draw attention to a status,
 * count, or category. They're typically used in navigation, notifications, and to highlight
 * statuses in tables or lists.
 * 
 * @component
 * @param {BadgeProps} props - The component props
 * @param {string} [props.variant="default"] - The visual style variant of the badge
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.ReactNode} props.children - The content to display inside the badge
 * @returns {JSX.Element} The badge element
 * 
 * @example
 * // Default badge
 * <Badge>New</Badge>
 * 
 * @example
 * // Destructive badge
 * <Badge variant="destructive">Removed</Badge>
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/**
 * Export the Badge component and its style variants
 * 
 * badgeVariants is exported to allow for consistent styling in custom implementations
 * or when badge styles need to be applied to other elements.
 */
export { Badge, badgeVariants };
