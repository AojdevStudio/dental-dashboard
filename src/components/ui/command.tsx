/**
 * @file Command Components
 * @description This file defines a suite of components for building command palette interfaces.
 * It leverages the `cmdk` library for core command functionality and integrates with
 * Radix UI's Dialog component for modal presentation. Components are styled using Tailwind CSS.
 * All components are marked "use client" due to their interactive nature.
 */
'use client';

import type { DialogProps } from '@radix-ui/react-dialog';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';
import * as React from 'react';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/**
 * @component Command
 * @description The main wrapper component for the command palette, based on `cmdk`'s `CommandPrimitive`.
 * It provides the foundational structure for the command interface.
 * Forwards its ref to the underlying `CommandPrimitive` element.
 *
 * @param {object} props - Props for the Command component, extending `CommandPrimitive` props.
 * @param {string} [props.className] - Additional CSS classes for styling.
 * @param {React.Ref<React.ElementRef<typeof CommandPrimitive>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered Command component.
 */
const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

/**
 * @interface CommandDialogProps
 * @description Props for the `CommandDialog` component, extending Radix UI's `DialogProps`.
 * @see DialogProps
 */
interface CommandDialogProps extends DialogProps {}

/**
 * @component CommandDialog
 * @description A component that presents the command palette within a modal dialog.
 * It uses Radix UI's `Dialog` and `DialogContent` for the modal structure and embeds the `Command` component.
 *
 * @param {CommandDialogProps} props - Props for the CommandDialog component.
 * @param {React.ReactNode} props.children - The content to be rendered within the command palette (typically CommandInput, CommandList, etc.).
 * @returns {JSX.Element} The rendered CommandDialog component.
 */
const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

/**
 * @component CommandInput
 * @description An input field for the command palette, based on `cmdk`'s `CommandPrimitive.Input`.
 * Includes a search icon and forwards its ref.
 *
 * @param {object} props - Props for CommandInput, extending `CommandPrimitive.Input` props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref<React.ElementRef<typeof CommandPrimitive.Input>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered CommandInput component.
 */
const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

/**
 * @component CommandList
 * @description A container for the list of command items, based on `cmdk`'s `CommandPrimitive.List`.
 * Handles scrolling for long lists.
 *
 * @param {object} props - Props for CommandList, extending `CommandPrimitive.List` props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref<React.ElementRef<typeof CommandPrimitive.List>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered CommandList component.
 */
const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

/**
 * @component CommandEmpty
 * @description A component displayed within `CommandList` when no items match the current search query.
 * Based on `cmdk`'s `CommandPrimitive.Empty`.
 *
 * @param {object} props - Props for CommandEmpty, extending `CommandPrimitive.Empty` props.
 * @param {React.Ref<React.ElementRef<typeof CommandPrimitive.Empty>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered CommandEmpty component.
 */
const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

/**
 * @component CommandGroup
 * @description A component used to group related `CommandItem`s within a `CommandList`.
 * Supports an optional heading. Based on `cmdk`'s `CommandPrimitive.Group`.
 *
 * @param {object} props - Props for CommandGroup, extending `CommandPrimitive.Group` props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref<React.ElementRef<typeof CommandPrimitive.Group>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered CommandGroup component.
 */
const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
      className
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

/**
 * @component CommandSeparator
 * @description A visual separator component used within `CommandList` or `CommandGroup`.
 * Based on `cmdk`'s `CommandPrimitive.Separator`.
 *
 * @param {object} props - Props for CommandSeparator, extending `CommandPrimitive.Separator` props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref<React.ElementRef<typeof CommandPrimitive.Separator>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered CommandSeparator component.
 */
const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 h-px bg-border', className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

/**
 * @component CommandItem
 * @description Represents an individual selectable item within a `CommandList` or `CommandGroup`.
 * Based on `cmdk`'s `CommandPrimitive.Item`.
 *
 * @param {object} props - Props for CommandItem, extending `CommandPrimitive.Item` props.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {React.Ref<React.ElementRef<typeof CommandPrimitive.Item>>} ref - Forwarded ref.
 * @returns {JSX.Element} The rendered CommandItem component.
 */
const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50",
      className
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

/**
 * @component CommandShortcut
 * @description A component used to display keyboard shortcuts associated with a `CommandItem`.
 * Typically placed on the right side of a `CommandItem`.
 *
 * @param {object} props - Props for CommandShortcut, extending `React.HTMLAttributes<HTMLSpanElement>`.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {JSX.Element} The rendered CommandShortcut component.
 */
const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      {...props}
    />
  );
};
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
