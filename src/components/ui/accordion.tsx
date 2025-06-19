/**
 * @fileoverview Accordion Component
 *
 * This file implements an accessible accordion component based on Radix UI's Accordion primitive.
 * An accordion is a vertically stacked set of interactive headings that each reveal a section of content.
 *
 * The implementation follows the WAI-ARIA design pattern for accordions and includes animations
 * for expanding and collapsing content sections. It's fully keyboard navigable and supports
 * all standard accordion behaviors including single and multiple expanded sections.
 */

'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDownIcon } from 'lucide-react';
// biome-ignore lint/style/useImportType: React.ComponentProps requires runtime import
import React from 'react';

import { cn } from '@/lib/utils';

/**
 * Root accordion component that contains all accordion items
 *
 * @component
 * @param {React.ComponentProps<typeof AccordionPrimitive.Root>} props - Props extending Radix UI's Accordion Root
 * @param {string} [props.type="single"] - Whether only one item can be opened at a time ("single") or multiple ("multiple")
 * @param {string} [props.defaultValue] - The value of the item that should be open by default (controlled)
 * @param {string} [props.value] - The controlled value of the item to expand
 * @param {function} [props.onValueChange] - Event handler called when the expanded state changes
 * @param {boolean} [props.collapsible=false] - When type="single", allows closing content when clicking trigger of open item
 * @returns {JSX.Element} The accordion container element
 */
function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

/**
 * Individual accordion item containing a header/trigger and content section
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {string} props.value - Unique identifier for the accordion item
 * @param {boolean} [props.disabled] - When true, prevents user interaction and applies disabled styling
 * @param {React.ReactNode} props.children - Should contain AccordionTrigger and AccordionContent
 * @returns {JSX.Element} The accordion item element
 */
function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b last:border-b-0', className)}
      {...props}
    />
  );
}

/**
 * Clickable trigger element that toggles the visibility of its associated accordion content
 *
 * The trigger includes a chevron icon that rotates to indicate the expanded/collapsed state.
 * It's wrapped in an AccordionHeader for proper accessibility semantics and keyboard navigation.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.ReactNode} props.children - Content to display in the trigger (typically text)
 * @param {boolean} [props.disabled] - When true, prevents user interaction and applies disabled styling
 * @returns {JSX.Element} The accordion trigger element wrapped in a header
 */
function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

/**
 * Content section of an accordion item that is shown or hidden based on the expanded state
 *
 * Includes smooth animations for expanding and collapsing. The content is wrapped in a div
 * with padding to provide consistent spacing within the accordion.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names for the inner content div
 * @param {boolean} [props.forceMount] - If true, forces mounting when parent is closed
 * @param {React.ReactNode} props.children - Content to display when the accordion item is expanded
 * @returns {JSX.Element} The accordion content element
 */
function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

/**
 * Export all accordion components for use throughout the application
 *
 * Typical usage:
 * ```tsx
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Section 1</AccordionTrigger>
 *     <AccordionContent>Content for section 1</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
