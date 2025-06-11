/**
 * @file Calendar Component
 * @description This file defines a customizable Calendar component based on `react-day-picker`.
 * It provides default styling using Tailwind CSS and allows for customization of class names and internal components.
 * The component is marked with "use client" as it involves client-side interactivity.
 */
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type React from 'react';
import { DayPicker } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * @typedef {object} CalendarProps
 * @description Props for the Calendar component, extending the props of `react-day-picker`'s `DayPicker` component.
 * This allows the Calendar component to accept all valid props for `DayPicker`.
 * @see https://react-day-picker.js.org/api/interfaces/DayPickerProps
 * @type {React.ComponentProps<typeof DayPicker>}
 */
export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * @typedef {object} ChevronProps
 * @description Props for the internal Chevron component used for navigation within the Calendar.
 * This type is used when overriding the default `Chevron` component via the `components` prop of `DayPicker`.
 * It extends standard SVG props and adds specific properties for orientation, styling, and state.
 * @property {("left" | "right" | "up" | "down")} [orientation] - The direction the chevron should point.
 * @property {string} [className] - Additional CSS classes for styling the chevron.
 * @property {number} [size] - The size of the chevron icon.
 * @property {boolean} [disabled] - Whether the chevron navigation is disabled.
 * @type {object}
 */
type ChevronProps = {
  orientation?: 'left' | 'right' | 'up' | 'down';
  className?: string;
  size?: number;
  disabled?: boolean;
} & React.SVGProps<SVGSVGElement>;

/**
 * @component Calendar
 * @description A customizable calendar component built as a wrapper around `react-day-picker`.
 * It provides default styling compatible with the project's UI (using Tailwind CSS and `cn` utility)
 * and allows for extensive customization of appearance and behavior through props.
 *
 * @param {CalendarProps} props - The properties for the Calendar component.
 * @param {string} [props.className] - Additional CSS classes to apply to the root DayPicker container.
 * @param {Partial<import('react-day-picker').ClassNames>} [props.classNames] - Custom CSS class names to override default styles for various parts of the calendar.
 * @param {boolean} [props.showOutsideDays=true] - Whether to display days from previous and next months.
 * @param {Partial<import('react-day-picker').Components>} [props.components] - Custom components to override parts of DayPicker, like the navigation chevrons.
 * @returns {JSX.Element} The rendered Calendar component.
 * @example
 * <Calendar
 *   mode="single"
 *   selected={date}
 *   onSelect={setDate}
 *   className="rounded-md border"
 * />
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  ...props
}: CalendarProps) {
  const defaultClassNames = {
    months: 'relative flex flex-col sm:flex-row gap-4',
    month: 'w-full',
    month_caption: 'relative mx-10 mb-1 flex h-9 items-center justify-center z-20',
    caption_label: 'text-sm font-medium',
    nav: 'absolute top-0 flex w-full justify-between z-10',
    button_previous: cn(
      buttonVariants({ variant: 'ghost' }),
      'size-9 text-muted-foreground/80 hover:text-foreground p-0'
    ),
    button_next: cn(
      buttonVariants({ variant: 'ghost' }),
      'size-9 text-muted-foreground/80 hover:text-foreground p-0'
    ),
    weekday: 'size-9 p-0 text-xs font-medium text-muted-foreground/80',
    day_button:
      'relative flex size-9 items-center justify-center whitespace-nowrap rounded-lg p-0 text-foreground outline-offset-2 group-[[data-selected]:not(.range-middle)]:[transition-property:color,background-color,border-radius,box-shadow] group-[[data-selected]:not(.range-middle)]:duration-150 focus:outline-none group-data-[disabled]:pointer-events-none focus-visible:z-10 hover:bg-accent group-data-[selected]:bg-primary hover:text-foreground group-data-[selected]:text-primary-foreground group-data-[disabled]:text-foreground/30 group-data-[disabled]:line-through group-data-[outside]:text-foreground/30 group-data-[outside]:group-data-[selected]:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 group-[.range-start:not(.range-end)]:rounded-e-none group-[.range-end:not(.range-start)]:rounded-s-none group-[.range-middle]:rounded-none group-data-[selected]:group-[.range-middle]:bg-accent group-data-[selected]:group-[.range-middle]:text-foreground',
    day: 'group size-9 px-0 text-sm',
    range_start: 'range-start',
    range_end: 'range-end',
    range_middle: 'range-middle',
    today:
      '*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:size-[3px] *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-primary [&[data-selected]:not(.range-middle)>*]:after:bg-background [&[data-disabled]>*]:after:bg-foreground/30 *:after:transition-colors',
    outside: 'text-muted-foreground data-selected:bg-accent/50 data-selected:text-muted-foreground',
    hidden: 'invisible',
    week_number: 'size-9 p-0 text-xs font-medium text-muted-foreground/80',
  };

  /**
   * Merges default class names with user-provided class names
   * Optimized implementation to avoid accumulator spread for better performance
   */
  const mergedClassNames: typeof defaultClassNames = Object.keys(defaultClassNames).reduce<
    typeof defaultClassNames
  >(
    (acc, key) => {
      const k = key as keyof typeof defaultClassNames;
      acc[k] = classNames?.[k] ? cn(defaultClassNames[k], classNames[k]) : defaultClassNames[k];
      return acc;
    },
    {} as typeof defaultClassNames
  );

  /**
   * Default components used in the calendar
   * Using proper type definition instead of any
   */
  const defaultComponents = {
    Chevron: (props: ChevronProps) => {
      if (props.orientation === 'left') {
        return <ChevronLeft size={16} strokeWidth={2} {...props} aria-hidden="true" />;
      }
      return <ChevronRight size={16} strokeWidth={2} {...props} aria-hidden="true" />;
    },
  };

  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      class={cn('w-fit', className)}
      classNames={mergedClassNames}
      components={mergedComponents}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
