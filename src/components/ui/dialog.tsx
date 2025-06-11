/**
 * @file Dialog Components
 * @description This file defines a suite of components for creating accessible dialog modals.
 * It is built on top of `@radix-ui/react-dialog` primitives, providing styled and
 * enhanced versions for consistent use within the application. Components are client-side rendered.
 */
'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * @component Dialog
 * @description The root component for a dialog. It manages the open/closed state.
 * This is an alias for `DialogPrimitive.Root` from `@radix-ui/react-dialog`.
 * @see https://www.radix-ui.com/primitives/docs/components/dialog#root
 */
const Dialog = DialogPrimitive.Root;

/**
 * @component DialogTrigger
 * @description A button that opens the dialog when clicked.
 * This is an alias for `DialogPrimitive.Trigger` from `@radix-ui/react-dialog`.
 * Must be a child of `Dialog`.
 * @see https://www.radix-ui.com/primitives/docs/components/dialog#trigger
 */
const DialogTrigger = DialogPrimitive.Trigger;

/**
 * @component DialogPortal
 * @description Portals its children into the body when the dialog is open.
 * This is an alias for `DialogPrimitive.Portal` from `@radix-ui/react-dialog`.
 * Typically used to wrap `DialogOverlay` and `DialogContent`.
 * @see https://www.radix-ui.com/primitives/docs/components/dialog#portal
 */
const DialogPortal = DialogPrimitive.Portal;

/**
 * @component DialogClose
 * @description A button that closes the dialog when clicked.
 * This is an alias for `DialogPrimitive.Close` from `@radix-ui/react-dialog`.
 * Must be a child of `Dialog`.
 * @see https://www.radix-ui.com/primitives/docs/components/dialog#close
 */
const DialogClose = DialogPrimitive.Close;

/**
 * @component DialogOverlay
 * @description A layer that covers the main content of the page when the dialog is open.
 * It's styled with a semi-transparent background and animations.
 * Forwards its ref to the underlying `DialogPrimitive.Overlay` element.
 *
 * @param {object} props - Props for DialogOverlay, extending `DialogPrimitive.Overlay` props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref<React.ElementRef<typeof DialogPrimitive.Overlay>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered DialogOverlay component.
 * @see https://www.radix-ui.com/primitives/docs/components/dialog#overlay
 */
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    class={cn(
      'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * @component DialogContent
 * @description The main content area of the dialog. It appears centered on the screen.
 * Includes a close button by default.
 * Forwards its ref to the underlying `DialogPrimitive.Content` element.
 *
 * @param {object} props - Props for DialogContent, extending `DialogPrimitive.Content` props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.ReactNode} props.children - The content to be displayed within the dialog.
 * @param {React.Ref<React.ElementRef<typeof DialogPrimitive.Content>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered DialogContent component.
 * @see https://www.radix-ui.com/primitives/docs/components/dialog#content
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      class={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

/**
 * @component DialogHeader
 * @description A container for the header section of the dialog, typically containing `DialogTitle` and `DialogDescription`.
 * Provides default styling for layout and spacing.
 *
 * @param {object} props - Props for DialogHeader, extending `React.HTMLAttributes<HTMLDivElement>`.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered DialogHeader component.
 */
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div class={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

/**
 * @component DialogFooter
 * @description A container for the footer section of the dialog, typically containing action buttons.
 * Provides default styling for layout and spacing.
 *
 * @param {object} props - Props for DialogFooter, extending `React.HTMLAttributes<HTMLDivElement>`.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered DialogFooter component.
 */
const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    class={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

/**
 * @component DialogTitle
 * @description The title of the dialog. Should be used within `DialogHeader`.
 * Forwards its ref to the underlying `DialogPrimitive.Title` element.
 *
 * @param {object} props - Props for DialogTitle, extending `DialogPrimitive.Title` props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref<React.ElementRef<typeof DialogPrimitive.Title>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered DialogTitle component.
 * @see https://www.radix-ui.com/primitives/docs/components/dialog#title
 */
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    class={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

/**
 * @component DialogDescription
 * @description The description or supporting text for the dialog. Should be used within `DialogHeader`.
 * Forwards its ref to the underlying `DialogPrimitive.Description` element.
 *
 * @param {object} props - Props for DialogDescription, extending `DialogPrimitive.Description` props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref<React.ElementRef<typeof DialogPrimitive.Description>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered DialogDescription component.
 * @see https://www.radix-ui.com/primitives/docs/components/dialog#description
 */
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    class={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
