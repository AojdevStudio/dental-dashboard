"use client";

/**
 * @file Scroll Area Components
 * @description This file provides `ScrollArea` and `ScrollBar` components, which are styled wrappers
 * around the `@radix-ui/react-scroll-area` primitives. These components are used to create
 * scrollable regions for content that exceeds its container's dimensions.
 * This module is intended for client-side rendering.
 */

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * @component ScrollArea
 * @description A component that provides a scrollable view for its children. It wraps the
 * `ScrollAreaPrimitive.Root` from Radix UI and includes a `ScrollAreaPrimitive.Viewport`,
 * a default `ScrollBar`, and a `ScrollAreaPrimitive.Corner`.
 *
 * @param {React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>} props - Props for the ScrollArea component.
 * @param {string} [props.className] - Additional CSS class names to apply to the root scroll area element.
 * @param {React.ReactNode} [props.children] - The content to be rendered within the scrollable viewport.
 * @param {React.Ref<React.ElementRef<typeof ScrollAreaPrimitive.Root>>} ref - Forwarded ref to the underlying Radix UI Root element.
 * @returns {JSX.Element} The rendered scroll area component.
 *
 * @example
 * <ScrollArea className="h-72 w-48 rounded-md border">
 *   <div className="p-4">
 *     <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
 *     {tags.map((tag) => (
 *       <React.Fragment key={tag}>
 *         <div className="text-sm">{tag}</div>
 *         <Separator className="my-2" />
 *       </React.Fragment>
 *     ))}
 *   </div>
 * </ScrollArea>
 */
const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

/**
 * @component ScrollBar
 * @description A component representing the scrollbar for a `ScrollArea`. It wraps the
 * `ScrollAreaPrimitive.ScrollAreaScrollbar` from Radix UI and includes a `ScrollAreaPrimitive.ScrollAreaThumb`.
 * The orientation (vertical or horizontal) can be specified.
 *
 * @param {React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>} props - Props for the ScrollBar component.
 * @param {string} [props.className] - Additional CSS class names to apply to the scrollbar element.
 * @param {('vertical' | 'horizontal')} [props.orientation='vertical'] - The orientation of the scrollbar.
 * @param {React.Ref<React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>>} ref - Forwarded ref to the underlying Radix UI ScrollAreaScrollbar element.
 * @returns {JSX.Element} The rendered scrollbar component.
 */
const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

/**
 * @module scroll-area
 * @description Exports the `ScrollArea` and `ScrollBar` components for creating scrollable content regions.
 */
export { ScrollArea, ScrollBar };
