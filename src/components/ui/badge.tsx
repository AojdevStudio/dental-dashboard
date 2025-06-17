/**
 * @file Badge Component
 * @description This file implements a badge component used for displaying short status descriptors,
 * counts, or category indicators. It leverages `class-variance-authority` (CVA) for managing
 * different visual styles (variants) of the badge, such as default, secondary, destructive, and outline.
 * The component is designed to be compact, visually distinct, and accessible, including focus states.
 */

import { type VariantProps, cva } from 'class-variance-authority';
// biome-ignore lint/style/useImportType: React is needed for JSX runtime in tests
import React from 'react';

import { cn } from '@/lib/utils';

/**
 * @constant badgeVariants
 * @description Defines the style variants for the Badge component using `class-variance-authority`.
 * This function takes variant options and returns the corresponding Tailwind CSS classes.
 *
 * The base style includes properties for inline display, flex alignment, rounded corners,
 * border, padding, text size, font weight, transition effects, and focus states for accessibility.
 *
 * @type {ReturnType<typeof cva>}
 * @property {object} variants - Defines the available style variants.
 * @property {object} variants.variant - Specifies different visual styles for the badge.
 * @property {string} variants.variant.default - Primary style, typically using the application's primary color.
 * @property {string} variants.variant.secondary - Secondary style, for less prominent badges.
 * @property {string} variants.variant.destructive - Style for indicating errors or destructive actions.
 * @property {string} variants.variant.outline - Outline style, typically with a transparent background and colored border/text.
 * @property {object} defaultVariants - Specifies the default variant to be applied if none is provided.
 * @property {string} defaultVariants.variant - Sets 'default' as the default badge style.
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * @interface BadgeProps
 * @description Defines the properties for the `Badge` component.
 * It extends standard HTML div attributes and variant props from `badgeVariants`.
 *
 * @extends {React.HTMLAttributes<HTMLDivElement>} Standard HTML attributes for a div element.
 * @extends {VariantProps<typeof badgeVariants>} Props for style variants defined by `badgeVariants`.
 * @property {('default' | 'secondary' | 'destructive' | 'outline')} [variant] - The visual style variant of the badge.
 *   Determines the background color, text color, and border. Defaults to 'default'.
 * @property {string} [className] - Additional CSS class names to apply to the badge's root `div` element.
 *   These are merged with the variant-specific classes.
 * @property {React.ReactNode} [children] - The content to be displayed inside the badge. This can be text, icons, or other React elements.
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * @component Badge
 * @description A component for displaying status indicators, counts, or category labels.
 * Badges are small, visually distinct elements typically used in UI elements like navigation items,
 * notification icons, or within tables and lists to highlight specific information.
 * The appearance of the badge can be customized using the `variant` prop.
 *
 * @param {BadgeProps} props - The properties for the Badge component.
 * @param {string} [props.className] - Additional CSS class names to be applied to the badge.
 * @param {('default' | 'secondary' | 'destructive' | 'outline')} [props.variant='default'] - The visual style variant of the badge.
 * @param {React.ReactNode} [props.children] - The content to display inside the badge.
 * @param {React.HTMLAttributes<HTMLDivElement>} [props....rest] - Any other standard HTML div attributes.
 * @returns {JSX.Element} The rendered badge element as a `div`.
 *
 * @example
 * // Default badge displaying 'New'
 * <Badge>New</Badge>
 *
 * @example
 * // Destructive badge displaying 'Removed'
 * <Badge variant="destructive">Removed</Badge>
 *
 * @example
 * // Outline badge with custom class
 * <Badge variant="outline" className="text-blue-500 border-blue-500">Info</Badge>
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/**
 * @module badge
 * @description Exports the `Badge` component and its associated `badgeVariants` function.
 * The `badgeVariants` function is exported to allow consumers to apply consistent badge styling
 * to other elements or to create custom components that adhere to the same visual language.
 */
export { Badge, badgeVariants };
