'use client';

/**
 * @file Tabs Components
 * @description This file provides a suite of components (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`)
 * for creating tabbed interfaces. These components are styled wrappers around the
 * `@radix-ui/react-tabs` primitives, allowing users to switch between different sections of content.
 * This module is intended for client-side rendering.
 */

import * as TabsPrimitive from '@radix-ui/react-tabs';
import type React from 'react';

import { cn } from '@/lib/utils';

/**
 * @component Tabs
 * @description The root container for a set of tabs. It manages the state of the active tab.
 * This component wraps `TabsPrimitive.Root` from Radix UI.
 *
 * @param {React.ComponentProps<typeof TabsPrimitive.Root>} props - Props for the Tabs component.
 * @param {string} [props.className] - Additional CSS class names to apply to the root tabs container.
 * @param {string} [props.defaultValue] - The value of the tab that should be active initially.
 * @param {React.ReactNode} [props.children] - The child elements, typically `TabsList` and `TabsContent` components.
 * @returns {JSX.Element} The rendered tabs root container.
 *
 * @example
 * <Tabs defaultValue="account">
 *   <TabsList>
 *     <TabsTrigger value="account">Account</TabsTrigger>
 *     <TabsTrigger value="password">Password</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="account">Account content.</TabsContent>
 *   <TabsContent value="password">Password content.</TabsContent>
 * </Tabs>
 */
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root data-slot="tabs" class={cn('flex flex-col gap-2', className)} {...props} />
  );
}

/**
 * @component TabsList
 * @description A container for the tab trigger buttons. It groups the `TabsTrigger` components.
 * This component wraps `TabsPrimitive.List` from Radix UI.
 *
 * @param {React.ComponentProps<typeof TabsPrimitive.List>} props - Props for the TabsList component.
 * @param {string} [props.className] - Additional CSS class names to apply to the tabs list container.
 * @param {React.ReactNode} [props.children] - The `TabsTrigger` components.
 * @returns {JSX.Element} The rendered list of tab triggers.
 */
function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      class={cn(
        'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]',
        className
      )}
      {...props}
    />
  );
}

/**
 * @component TabsTrigger
 * @description An individual tab button that, when clicked, activates its associated `TabsContent`.
 * This component wraps `TabsPrimitive.Trigger` from Radix UI.
 *
 * @param {React.ComponentProps<typeof TabsPrimitive.Trigger>} props - Props for the TabsTrigger component.
 * @param {string} props.value - A unique value that associates the trigger with a `TabsContent` panel.
 * @param {string} [props.className] - Additional CSS class names to apply to the tab trigger button.
 * @param {React.ReactNode} [props.children] - The content of the tab trigger, usually text or an icon.
 * @param {boolean} [props.disabled] - If true, the tab trigger is disabled and cannot be interacted with.
 * @returns {JSX.Element} The rendered tab trigger button.
 */
function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      class={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

/**
 * @component TabsContent
 * @description The content panel associated with a `TabsTrigger`. It is displayed when its corresponding trigger is active.
 * This component wraps `TabsPrimitive.Content` from Radix UI.
 *
 * @param {React.ComponentProps<typeof TabsPrimitive.Content>} props - Props for the TabsContent component.
 * @param {string} props.value - A unique value that associates the content panel with a `TabsTrigger`.
 * @param {string} [props.className] - Additional CSS class names to apply to the content panel.
 * @param {React.ReactNode} [props.children] - The content to be displayed within the panel.
 * @returns {JSX.Element} The rendered content panel.
 */
function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      class={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

/**
 * @module tabs
 * @description Exports the `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent` components
 * for building accessible and customizable tabbed interfaces.
 */
export { Tabs, TabsList, TabsTrigger, TabsContent };
