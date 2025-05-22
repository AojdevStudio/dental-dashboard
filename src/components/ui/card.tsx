/**
 * @fileoverview Card Component
 * 
 * This file implements a flexible card component system with various subcomponents
 * for structured content presentation. Cards are used throughout the application
 * to group related information and actions with consistent styling.
 * 
 * The implementation includes the main Card component along with subcomponents
 * for header, footer, title, description, content, and action areas, allowing
 * for consistent and structured card layouts.
 */

import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Main Card container component
 * 
 * A container component that provides the base card styling and structure.
 * It serves as the parent component for all other card subcomponents.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.HTMLAttributes<HTMLDivElement>} props.props - All standard div attributes
 * @returns {JSX.Element} The card container element
 * 
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Main content goes here</CardContent>
 *   <CardFooter>Footer content</CardFooter>
 * </Card>
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

/**
 * Card header component
 * 
 * Contains the card's title, description, and optional action elements.
 * Uses CSS grid layout to position elements appropriately, with special handling
 * for action elements that should be positioned at the top-right.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.HTMLAttributes<HTMLDivElement>} props.props - All standard div attributes
 * @returns {JSX.Element} The card header element
 * 
 * @example
 * <CardHeader>
 *   <CardTitle>Dashboard</CardTitle>
 *   <CardDescription>View your analytics and performance metrics</CardDescription>
 *   <CardAction>
 *     <Button size="sm" variant="outline">Settings</Button>
 *   </CardAction>
 * </CardHeader>
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

/**
 * Card title component
 * 
 * Displays the main heading for the card with appropriate typography styling.
 * Typically used within CardHeader.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.HTMLAttributes<HTMLDivElement>} props.props - All standard div attributes
 * @returns {JSX.Element} The card title element
 * 
 * @example
 * <CardTitle>Analytics Overview</CardTitle>
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

/**
 * Card description component
 * 
 * Displays secondary text below the card title with muted styling.
 * Typically used within CardHeader to provide additional context.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.HTMLAttributes<HTMLDivElement>} props.props - All standard div attributes
 * @returns {JSX.Element} The card description element
 * 
 * @example
 * <CardDescription>Summary of your account activity for the past 30 days</CardDescription>
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

/**
 * Card action component
 * 
 * Container for action elements like buttons that should be positioned
 * at the top-right of the card header. Uses grid positioning to ensure
 * proper placement regardless of title and description height.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.HTMLAttributes<HTMLDivElement>} props.props - All standard div attributes
 * @returns {JSX.Element} The card action element
 * 
 * @example
 * <CardAction>
 *   <Button size="sm" variant="outline">Edit</Button>
 * </CardAction>
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

/**
 * Card content component
 * 
 * Container for the main content of the card. Provides appropriate padding
 * and styling for the content area between the header and footer.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.HTMLAttributes<HTMLDivElement>} props.props - All standard div attributes
 * @returns {JSX.Element} The card content element
 * 
 * @example
 * <CardContent>
 *   <p>This is the main content of the card.</p>
 *   <DataTable data={data} columns={columns} />
 * </CardContent>
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />;
}

/**
 * Card footer component
 * 
 * Container for content at the bottom of the card. Typically used for
 * actions, summary information, or navigation related to the card content.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.HTMLAttributes<HTMLDivElement>} props.props - All standard div attributes
 * @returns {JSX.Element} The card footer element
 * 
 * @example
 * <CardFooter>
 *   <Button variant="outline">Cancel</Button>
 *   <Button>Save Changes</Button>
 * </CardFooter>
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

/**
 * Export all card components for use throughout the application
 * 
 * Typical usage:
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card Description</CardDescription>
 *   </CardHeader>
 *   <CardContent>Main content goes here</CardContent>
 *   <CardFooter>Footer content</CardFooter>
 * </Card>
 * ```
 */
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
