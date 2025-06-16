/**
 * @file Select Components
 * @description This file defines a suite of accessible and customizable select (dropdown) components.
 * It leverages `@radix-ui/react-select` primitives and provides styled versions for consistent use
 * within the application. All components are client-side rendered.
 */
'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

/**
 * @component Select
 * @description The root component for a select dropdown. Manages the open/closed state and selected value.
 * Alias for `SelectPrimitive.Root`.
 * @see https://www.radix-ui.com/primitives/docs/components/select#root
 */
const Select = SelectPrimitive.Root;

/**
 * @component SelectGroup
 * @description Used to group related `SelectItem`s within a `SelectContent`.
 * Often used with a `SelectLabel`.
 * Alias for `SelectPrimitive.Group`.
 * @see https://www.radix-ui.com/primitives/docs/components/select#group
 */
const SelectGroup = SelectPrimitive.Group;

/**
 * @component SelectValue
 * @description Displays the selected value within the `SelectTrigger`.
 * Can also display a placeholder if no value is selected.
 * Alias for `SelectPrimitive.Value`.
 * @see https://www.radix-ui.com/primitives/docs/components/select#value
 */
const SelectValue = SelectPrimitive.Value;

/**
 * @component SelectTrigger
 * @description The button that toggles the select dropdown's open/closed state and displays the current value.
 * Forwards its ref to `SelectPrimitive.Trigger`.
 *
 * @param {object} props - Props for SelectTrigger.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.ReactNode} props.children - The content to display within the trigger, typically `SelectValue`.
 * @param {React.Ref<React.ElementRef<typeof SelectPrimitive.Trigger>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered SelectTrigger component.
 * @see https://www.radix-ui.com/primitives/docs/components/select#trigger
 */
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-start text-sm text-foreground shadow-sm shadow-black/5 focus:border-ring focus:outline-none focus:ring-[3px] focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground/70 [&>span]:min-w-0',
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild={true}>
      <ChevronDownIcon
        width={16}
        height={16}
        strokeWidth={2}
        className="shrink-0 text-muted-foreground/80"
      />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

/**
 * @component SelectScrollUpButton
 * @description A button that scrolls the `SelectContent` upwards when it has overflow.
 * Forwards its ref to `SelectPrimitive.ScrollUpButton`.
 *
 * @param {object} props - Props for SelectScrollUpButton.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref<React.ElementRef<typeof SelectPrimitive.ScrollUpButton>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered SelectScrollUpButton component.
 * @see https://www.radix-ui.com/primitives/docs/components/select#scrollupbutton
 */
const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronUpIcon width={16} height={16} strokeWidth={2} />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

/**
 * @component SelectScrollDownButton
 * @description A button that scrolls the `SelectContent` downwards when it has overflow.
 * Forwards its ref to `SelectPrimitive.ScrollDownButton`.
 *
 * @param {object} props - Props for SelectScrollDownButton.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref<React.ElementRef<typeof SelectPrimitive.ScrollDownButton>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered SelectScrollDownButton component.
 * @see https://www.radix-ui.com/primitives/docs/components/select#scrolldownbutton
 */
const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn('flex cursor-default items-center justify-center py-1', className)}
    {...props}
  >
    <ChevronDownIcon width={16} height={16} strokeWidth={2} />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

/**
 * @component SelectContent
 * @description The container for `SelectItem`s, `SelectGroup`s, and `SelectLabel`s. Appears when the `SelectTrigger` is activated.
 * Includes `SelectScrollUpButton` and `SelectScrollDownButton` for scrollable content.
 * Forwards its ref to `SelectPrimitive.Content`.
 *
 * @param {object} props - Props for SelectContent.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.ReactNode} props.children - The items and groups to display in the select dropdown.
 * @param {'popper' | 'item-aligned'} [props.position='popper'] - The positioning strategy of the content.
 * @param {React.Ref<React.ElementRef<typeof SelectPrimitive.Content>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered SelectContent component.
 * @see https://www.radix-ui.com/primitives/docs/components/select#content
 */
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-[min(24rem,var(--radix-select-content-available-height))] min-w-[8rem] overflow-hidden rounded-lg border border-input bg-popover text-popover-foreground shadow-lg shadow-black/5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 [&_[role=group]]:py-1',
        position === 'popper' &&
          'w-full min-w-[var(--radix-select-trigger-width)] data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn('p-1', position === 'popper' && 'h-[var(--radix-select-trigger-height)]')}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

/**
 * @component SelectLabel
 * @description A non-interactive label used to title a `SelectGroup` of items.
 * Forwards its ref to `SelectPrimitive.Label`.
 *
 * @param {object} props - Props for SelectLabel.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref<React.ElementRef<typeof SelectPrimitive.Label>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered SelectLabel component.
 * @see https://www.radix-ui.com/primitives/docs/components/select#label
 */
const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('py-1.5 pe-2 ps-8 text-xs font-medium text-muted-foreground', className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

/**
 * @component SelectItem
 * @description An individual selectable item within `SelectContent`.
 * Displays a checkmark when selected.
 * Forwards its ref to `SelectPrimitive.Item`.
 *
 * @param {object} props - Props for SelectItem.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.ReactNode} props.children - The content of the item, usually text.
 * @param {React.Ref<React.ElementRef<typeof SelectPrimitive.Item>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered SelectItem component.
 * @see https://www.radix-ui.com/primitives/docs/components/select#item
 */
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pe-2 ps-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute start-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon width={16} height={16} strokeWidth={2} />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

/**
 * @component SelectSeparator
 * @description A visual separator used between `SelectItem`s or `SelectGroup`s.
 * Forwards its ref to `SelectPrimitive.Separator`.
 *
 * @param {object} props - Props for SelectSeparator.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref<React.ElementRef<typeof SelectPrimitive.Separator>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered SelectSeparator component.
 * @see https://www.radix-ui.com/primitives/docs/components/select#separator
 */
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
