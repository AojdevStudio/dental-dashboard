/**
 * @fileoverview Button Component
 * 
 * This file implements a flexible button component with various styles and sizes.
 * It uses class-variance-authority (CVA) for style variants and supports rendering
 * as different elements through the asChild prop.
 * 
 * The button component is fully accessible and follows WAI-ARIA button patterns,
 * with proper focus states and keyboard interaction support.
 */

import type * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Button style variants using class-variance-authority
 * 
 * Defines the available style variations for the Button component,
 * including different visual styles and sizes.
 * 
 * @type {Function}
 * @property {Object} variants - Available style variations
 * @property {Object} variants.variant - Visual style variations
 * @property {string} variants.variant.default - Primary button style with brand color
 * @property {string} variants.variant.destructive - Red button for destructive actions
 * @property {string} variants.variant.outline - Outlined button with transparent background
 * @property {string} variants.variant.secondary - Secondary button with muted styling
 * @property {string} variants.variant.ghost - Button with no background until hovered
 * @property {string} variants.variant.link - Button that looks like a hyperlink
 * @property {Object} variants.size - Size variations
 * @property {string} variants.size.default - Standard size button
 * @property {string} variants.size.sm - Small button
 * @property {string} variants.size.lg - Large button
 * @property {string} variants.size.icon - Square button for icons
 * @property {Object} defaultVariants - Default variant selections
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Button component with multiple style variants
 * 
 * A flexible button component that supports different visual styles and sizes.
 * Can be rendered as a different element using the asChild prop, which is useful
 * for creating link buttons or other interactive elements that should have button styling.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {('default'|'destructive'|'outline'|'secondary'|'ghost'|'link')} [props.variant='default'] - Visual style variant
 * @param {('default'|'sm'|'lg'|'icon')} [props.size='default'] - Size variant
 * @param {boolean} [props.asChild=false] - When true, button will render as its child element with button props
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement>} props.props - All standard button attributes
 * @returns {JSX.Element} The button element
 * 
 * @example
 * // Default primary button
 * <Button>Click me</Button>
 * 
 * @example
 * // Small destructive button
 * <Button variant="destructive" size="sm">Delete</Button>
 * 
 * @example
 * // Link styled as a button
 * <Button asChild variant="outline">
 *   <Link href="/about">About us</Link>
 * </Button>
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

/**
 * Export the Button component and its style variants
 * 
 * buttonVariants is exported to allow for consistent styling in custom implementations
 * or when button styles need to be applied to other elements.
 */
export { Button, buttonVariants };
