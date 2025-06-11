/**
 * @file Dropdown Menu Components
 * @description This file defines a suite of accessible and customizable dropdown menu components.
 * It is built upon `@radix-ui/react-dropdown-menu` primitives, providing styled versions
 * for consistent use within the application. Components are client-side rendered.
 * Includes handling for pointer events to improve focus management.
 */
'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { CheckIcon, ChevronRightIcon, DotFilledIcon } from '@radix-ui/react-icons';

/**
 * @typedef {Parameters<NonNullable<DropdownMenuPrimitive.DropdownMenuContentProps["onPointerDown"]>>[0]} PointerDownEvent
 * @description Type definition for the event object passed to `onPointerDown` handlers
 * within the DropdownMenuContent component. Derived from Radix UI's internal types.
 */
type PointerDownEvent = Parameters<
  NonNullable<DropdownMenuPrimitive.DropdownMenuContentProps['onPointerDown']>
>[0];
/**
 * @typedef {Parameters<NonNullable<DropdownMenuPrimitive.DropdownMenuContentProps["onPointerDownOutside"]>>[0]} PointerDownOutsideEvent
 * @description Type definition for the event object passed to `onPointerDownOutside` handlers
 * within the DropdownMenuContent component. Derived from Radix UI's internal types.
 */
type PointerDownOutsideEvent = Parameters<
  NonNullable<DropdownMenuPrimitive.DropdownMenuContentProps['onPointerDownOutside']>
>[0];

/**
 * @component DropdownMenu
 * @description The root component for a dropdown menu. Manages the open/closed state.
 * Alias for `DropdownMenuPrimitive.Root`.
 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu#root
 */
const DropdownMenu = DropdownMenuPrimitive.Root;

/**
 * @component DropdownMenuTrigger
 * @description A button that toggles the dropdown menu's open/closed state.
 * Alias for `DropdownMenuPrimitive.Trigger`.
 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu#trigger
 */
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

/**
 * @component DropdownMenuGroup
 * @description Used to group related `DropdownMenuItem`s.
 * Alias for `DropdownMenuPrimitive.Group`.
 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu#group
 */
const DropdownMenuGroup = DropdownMenuPrimitive.Group;

/**
 * @component DropdownMenuPortal
 * @description Portals its children into the body when the dropdown menu is open.
 * Alias for `DropdownMenuPrimitive.Portal`.
 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu#portal
 */
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

/**
 * @component DropdownMenuSub
 * @description Contains components for a submenu.
 * Alias for `DropdownMenuPrimitive.Sub`.
 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu#sub
 */
const DropdownMenuSub = DropdownMenuPrimitive.Sub;

/**
 * @component DropdownMenuRadioGroup
 * @description Used to group `DropdownMenuRadioItem`s, managing their checked state.
 * Alias for `DropdownMenuPrimitive.RadioGroup`.
 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu#radiogroup
 */
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

/**
 * @component DropdownMenuSubTrigger
 * @description A button that opens a submenu.
 * Forwards its ref to `DropdownMenuPrimitive.SubTrigger`.
 *
 * @param {object} props - Props for DropdownMenuSubTrigger.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {boolean} [props.inset] - Whether the item should be inset (indented).
 * @param {React.ReactNode} props.children - The content of the sub-trigger.
 * @param {React.Ref<React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered DropdownMenuSubTrigger component.
 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu#subtrigger
 */
const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    class={cn(
      'flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      inset && 'pl-8',
      className
    )}
    {...props}
  >
    {children}
    <ChevronRightIcon class="ml-auto text-muted-foreground/80" />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

/**
 * @component DropdownMenuSubContent
 * @description The content of a submenu, displayed when `DropdownMenuSubTrigger` is activated.
 * Forwards its ref to `DropdownMenuPrimitive.SubContent`.
 *
 * @param {object} props - Props for DropdownMenuSubContent.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref<React.ElementRef<typeof DropdownMenuPrimitive.SubContent>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered DropdownMenuSubContent component.
 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu#subcontent
 */
const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    class={cn(
      'z-50 min-w-40 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

/**
 * @component DropdownMenuContent
 * @description The main content container for the dropdown menu, displayed when `DropdownMenuTrigger` is activated.
 * It includes custom logic to handle pointer down events for better focus management on close.
 * Forwards its ref to `DropdownMenuPrimitive.Content`.
 *
 * @param {object} props - Props for DropdownMenuContent.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {number} [props.sideOffset=4] - The offset from the trigger along the side.
 * @param {function(PointerDownEvent): void} [props.onPointerDown] - Event handler for pointer down events.
 * @param {function(PointerDownOutsideEvent): void} [props.onPointerDownOutside] - Event handler for pointer down outside events.
 * @param {function(Event): void} [props.onCloseAutoFocus] - Event handler for auto-focus on close.
 * @param {React.Ref<React.ElementRef<typeof DropdownMenuPrimitive.Content>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered DropdownMenuContent component.
 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu#content
 */
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(
  (
    { className, sideOffset = 4, onPointerDown, onPointerDownOutside, onCloseAutoFocus, ...props },
    ref
  ) => {
    const isCloseFromMouse = React.useRef<boolean>(false);

    const handlePointerDown = React.useCallback(
      (e: PointerDownEvent) => {
        isCloseFromMouse.current = true;
        onPointerDown?.(e);
      },
      [onPointerDown]
    );

    const handlePointerDownOutside = React.useCallback(
      (e: PointerDownOutsideEvent) => {
        isCloseFromMouse.current = true;
        onPointerDownOutside?.(e);
      },
      [onPointerDownOutside]
    );

    const handleCloseAutoFocus = React.useCallback(
      (e: Event) => {
        if (onCloseAutoFocus) {
          return onCloseAutoFocus(e);
        }

        if (!isCloseFromMouse.current) {
          return;
        }

        e.preventDefault();
        isCloseFromMouse.current = false;
      },
      [onCloseAutoFocus]
    );

    return (
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          class={cn(
            'z-50 min-w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className
          )}
          onPointerDown={handlePointerDown}
          onPointerDownOutside={handlePointerDownOutside}
          onCloseAutoFocus={handleCloseAutoFocus}
          {...props}
        />
      </DropdownMenuPrimitive.Portal>
    );
  }
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

/**
 * @component DropdownMenuItem
 * @description An individual item within a dropdown menu.
 * Forwards its ref to `DropdownMenuPrimitive.Item`.
 *
 * @param {object} props - Props for DropdownMenuItem.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {boolean} [props.inset] - Whether the item should be inset (indented).
 * @param {React.Ref<React.ElementRef<typeof DropdownMenuPrimitive.Item>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered DropdownMenuItem component.
 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu#item
 */
const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    class={cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

/**
 * @component DropdownMenuCheckboxItem
 * @description A dropdown menu item that can be checked or unchecked.
 * Forwards its ref to `DropdownMenuPrimitive.CheckboxItem`.
 *
 * @param {object} props - Props for DropdownMenuCheckboxItem.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.ReactNode} props.children - The content of the checkbox item.
 * @param {boolean | 'indeterminate'} [props.checked] - The checked state of the item.
 * @param {React.Ref<React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered DropdownMenuCheckboxItem component.
 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu#checkboxitem
 */
const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    class={cn(
      'relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    checked={checked}
    {...props}
  >
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <CheckIcon class="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

/**
 * @component DropdownMenuRadioItem
 * @description A dropdown menu item that functions as a radio button, part of a `DropdownMenuRadioGroup`.
 * Forwards its ref to `DropdownMenuPrimitive.RadioItem`.
 *
 * @param {object} props - Props for DropdownMenuRadioItem.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.ReactNode} props.children - The content of the radio item.
 * @param {React.Ref<React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered DropdownMenuRadioItem component.
 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu#radioitem
 */
const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    class={cn(
      'relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <DotFilledIcon class="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

/**
 * @component DropdownMenuLabel
 * @description A non-interactive label used to title a group of items or provide context.
 * Forwards its ref to `DropdownMenuPrimitive.Label`.
 *
 * @param {object} props - Props for DropdownMenuLabel.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {boolean} [props.inset] - Whether the label should be inset (indented).
 * @param {React.Ref<React.ElementRef<typeof DropdownMenuPrimitive.Label>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered DropdownMenuLabel component.
 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu#label
 */
const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    class={cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', inset && 'pl-8', className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

/**
 * @component DropdownMenuSeparator
 * @description A visual separator used between items or groups in a dropdown menu.
 * Forwards its ref to `DropdownMenuPrimitive.Separator`.
 *
 * @param {object} props - Props for DropdownMenuSeparator.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref<React.ElementRef<typeof DropdownMenuPrimitive.Separator>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered DropdownMenuSeparator component.
 * @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu#separator
 */
const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    class={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

/**
 * @component DropdownMenuShortcut
 * @description A component to display keyboard shortcuts associated with a `DropdownMenuItem`.
 * Typically aligned to the right of the item text.
 *
 * @param {object} props - Props for DropdownMenuShortcut, extending `React.HTMLAttributes<HTMLSpanElement>`.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered DropdownMenuShortcut component.
 */
const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      class={cn(
        '-me-1 ms-auto inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70',
        className
      )}
      {...props}
    />
  );
};
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
