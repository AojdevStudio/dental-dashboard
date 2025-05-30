/**
 * @file Alert Component
 * @description This file defines the Alert, AlertTitle, and AlertDescription components,
 * which are used to display important messages to the user. These components are styled
 * using Tailwind CSS and class-variance-authority for different visual variants (e.g., default, destructive).
 * They are built using React's forwardRef for proper ref handling.
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * @constant alertVariants
 * @description Defines the visual styles and variants for the Alert component using `class-variance-authority`.
 * It includes base styles and variants like "default" and "destructive".
 * The styles are applied using Tailwind CSS classes.
 * @type {ReturnType<typeof cva>}
 */
const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * @component Alert
 * @description A React component that displays an alert message box.
 * It utilizes `alertVariants` for styling and supports different visual variants.
 * This component forwards its ref to the underlying `div` element.
 *
 * @param {object} props - The properties for the Alert component.
 * @param {string} [props.className] - Additional CSS classes to apply to the alert.
 * @param {VariantProps<typeof alertVariants>["variant"]} [props.variant] - The visual variant of the alert (e.g., "default", "destructive").
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref to the main div element of the alert.
 * @returns {JSX.Element} The rendered Alert component.
 * @example
 * <Alert variant="destructive">
 *   <AlertTitle>Error</AlertTitle>
 *   <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
 * </Alert>
 */
const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

/**
 * @component AlertTitle
 * @description A React component used to display the title within an Alert.
 * It is typically used as a child of the `Alert` component.
 * This component forwards its ref to the underlying `h5` element.
 *
 * @param {object} props - The properties for the AlertTitle component.
 * @param {string} [props.className] - Additional CSS classes to apply to the alert title.
 * @param {React.Ref<HTMLParagraphElement>} ref - Forwarded ref to the h5 element used for the title.
 * @returns {JSX.Element} The rendered AlertTitle component.
 */
const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
);
AlertTitle.displayName = "AlertTitle";

/**
 * @component AlertDescription
 * @description A React component used to display the main content or description within an Alert.
 * It is typically used as a child of the `Alert` component, often following an `AlertTitle`.
 * This component forwards its ref to the underlying `div` element.
 *
 * @param {object} props - The properties for the AlertDescription component.
 * @param {string} [props.className] - Additional CSS classes to apply to the alert description.
 * @param {React.Ref<HTMLParagraphElement>} ref - Forwarded ref to the div element used for the description.
 * @returns {JSX.Element} The rendered AlertDescription component.
 */
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
