/**
 * @fileoverview Breadcrumb Component
 *
 * This file implements an accessible breadcrumb navigation component.
 * Breadcrumbs show the hierarchical path to the current page or resource,
 * helping users understand their location within the application and navigate to parent pages.
 *
 * The implementation follows WAI-ARIA guidelines for breadcrumb navigation,
 * providing appropriate ARIA roles, labels, and keyboard interaction.
 *
 * The component is composed of several subcomponents:
 * - Breadcrumb: The root navigation container
 * - BreadcrumbList: The ordered list of breadcrumb items
 * - BreadcrumbItem: Individual item in the breadcrumb path
 * - BreadcrumbLink: Interactive link to navigate to a parent page
 * - BreadcrumbPage: The current page indicator (non-interactive)
 * - BreadcrumbSeparator: Visual separator between breadcrumb items
 * - BreadcrumbEllipsis: Indicator for collapsed breadcrumb items
 */

import { Slot } from '@radix-ui/react-slot';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import type React from 'react';

import { cn } from '@/lib/utils';

/**
 * Root breadcrumb navigation container
 *
 * Renders a semantic nav element with appropriate ARIA attributes for breadcrumb navigation.
 * This component should contain a BreadcrumbList as its child.
 *
 * @component
 * @param {React.ComponentProps<"nav">} props - Standard HTML nav element props
 * @returns {JSX.Element} The breadcrumb navigation container
 */
function Breadcrumb({ ...props }: React.ComponentProps<'nav'>) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

/**
 * Container for breadcrumb items
 *
 * Renders an ordered list (ol) element containing the breadcrumb items.
 * The list is styled to display items horizontally with appropriate spacing and wrapping behavior.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.ReactNode} props.children - Should contain BreadcrumbItem components
 * @returns {JSX.Element} The breadcrumb list element
 */
function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot="breadcrumb-list"
      class={cn(
        'text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5',
        className
      )}
      {...props}
    />
  );
}

/**
 * Individual item in the breadcrumb path
 *
 * Renders a list item (li) element that typically contains either a BreadcrumbLink
 * for navigable pages or a BreadcrumbPage for the current page.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.ReactNode} props.children - Typically a BreadcrumbLink or BreadcrumbPage
 * @returns {JSX.Element} The breadcrumb item element
 */
function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-item"
      class={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  );
}

/**
 * Interactive link element for navigating to a parent page in the breadcrumb path
 *
 * Renders either an anchor tag or a custom component via Radix UI's Slot.
 * The link has hover styles to indicate interactivity.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} [props.asChild] - When true, the component will render its child directly with the props of the component
 * @param {string} [props.className] - Additional CSS class names
 * @param {string} props.href - The URL to navigate to when clicked
 * @param {React.ReactNode} props.children - The content of the link (typically text)
 * @returns {JSX.Element} The breadcrumb link element
 */
function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      data-slot="breadcrumb-link"
      class={cn('hover:text-foreground transition-colors', className)}
      {...props}
    />
  );
}

/**
 * Current page indicator in the breadcrumb path
 *
 * Renders a non-navigable span element that represents the current page.
 * It has appropriate ARIA attributes to indicate it's the current page.
 * Although it's not a true link, it supports keyboard interaction for consistency
 * and can trigger an onClick handler if provided.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.ReactNode} props.children - The content of the current page indicator (typically text)
 * @param {Function} [props.onClick] - Optional click handler
 * @returns {JSX.Element} The breadcrumb current page element
 */
function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Trigger click action if onClick is provided
          if (props.onClick) {
            // Cast to unknown first to safely convert between event types
            props.onClick(e as unknown as React.MouseEvent<HTMLSpanElement>);
          }
        }
      }}
      class={cn('text-foreground font-normal', className)}
      {...props}
    />
  );
}

/**
 * Visual separator between breadcrumb items
 *
 * Renders a decorative separator element (typically a chevron icon) between breadcrumb items.
 * The separator is hidden from screen readers with appropriate ARIA attributes.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Custom separator content (defaults to ChevronRight icon)
 * @param {string} [props.className] - Additional CSS class names
 * @returns {JSX.Element} The breadcrumb separator element
 */
function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      class={cn('[&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

/**
 * Ellipsis indicator for collapsed breadcrumb items
 *
 * Renders an ellipsis (three dots) to indicate that some breadcrumb items have been
 * collapsed for space efficiency. Typically used in responsive designs when the full
 * breadcrumb path would be too long to display on smaller screens.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @returns {JSX.Element} The breadcrumb ellipsis element
 */
function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      class={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal class="size-4" />
      <span class="sr-only">More</span>
    </span>
  );
}

/**
 * Export all breadcrumb components for use throughout the application
 *
 * Typical usage:
 * ```tsx
 * <Breadcrumb>
 *   <BreadcrumbList>
 *     <BreadcrumbItem>
 *       <BreadcrumbLink href="/">Home</BreadcrumbLink>
 *     </BreadcrumbItem>
 *     <BreadcrumbSeparator />
 *     <BreadcrumbItem>
 *       <BreadcrumbLink href="/products">Products</BreadcrumbLink>
 *     </BreadcrumbItem>
 *     <BreadcrumbSeparator />
 *     <BreadcrumbItem>
 *       <BreadcrumbPage>Product Details</BreadcrumbPage>
 *     </BreadcrumbItem>
 *   </BreadcrumbList>
 * </Breadcrumb>
 * ```
 */
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
