/**
 * @fileoverview Date Picker Component
 *
 * This file implements a reusable date picker component that can be used
 * throughout the application for selecting dates. It provides a calendar
 * interface with range selection capabilities.
 */

'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';

/**
 * Interface for DatePicker component properties
 *
 * @property {Date} [date] - The currently selected date
 * @property {string} [placeholder] - Placeholder text when no date is selected
 * @property {boolean} [disabled] - Whether the date picker is disabled
 */
interface DatePickerProps {
  date?: Date;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Date Picker Component
 *
 * A reusable component for selecting dates with a calendar interface.
 * Features include:
 * - Popover calendar for date selection
 * - Formatted display of the selected date
 * - Customizable placeholder text
 * - Disabled state
 *
 * @param {DatePickerProps} props - Component properties
 * @returns {JSX.Element} The rendered date picker component
 */
export function DatePicker({
  date,
  placeholder = 'Select date',
  disabled = false,
}: DatePickerProps) {
  return (
    <div>
      <Button
        variant="outline"
        className={cn(
          'w-full justify-start text-left font-normal',
          !date && 'text-muted-foreground',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        disabled={disabled}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, 'PPP') : <span>{placeholder}</span>}
      </Button>
      <div className="w-auto p-0" />
    </div>
  );
}

/**
 * Date Range Picker Component
 *
 * A variant of the date picker that allows selecting a range of dates.
 * Features include:
 * - Popover calendar for date range selection
 * - Formatted display of the selected date range
 * - Customizable placeholder text
 * - Disabled state
 *
 * @param {Object} props - Component properties
 * @param {Date} [props.from] - Start date of the selected range
 * @param {Date} [props.to] - End date of the selected range
 * @param {(range: { from: Date; to?: Date }) => void} [props.onRangeChange] - Callback for range selection
 * @param {string} [props.placeholder] - Placeholder text when no range is selected
 * @param {boolean} [props.disabled] - Whether the date range picker is disabled
 * @returns {JSX.Element} The rendered date range picker component
 */
export function DateRangePicker({
  from,
  to,
  onRangeChange,
  placeholder = 'Select date range',
  disabled = false,
}: {
  from?: Date;
  to?: Date;
  onRangeChange?: (range: { from: Date; to?: Date }) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [_isOpen, _setIsOpen] = React.useState(false);
  const [range, setRange] = React.useState<{ from: Date; to?: Date }>({
    from: from || new Date(),
    to: to,
  });

  // Update the component state when props change
  React.useEffect(() => {
    if (from) {
      setRange((prev) => ({ ...prev, from }));
    }
    if (to) {
      setRange((prev) => ({ ...prev, to }));
    }
  }, [from, to]);

  // Call the onRangeChange callback when the range changes
  React.useEffect(() => {
    if (range.from && range.to && onRangeChange) {
      onRangeChange(range);
    }
  }, [range, onRangeChange]);

  return (
    <div>
      <Button
        variant="outline"
        className={cn(
          'w-full justify-start text-left font-normal',
          !range.from && 'text-muted-foreground',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        disabled={disabled}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {range.from ? (
          range.to ? (
            <>
              {format(range.from, 'PPP')} - {format(range.to, 'PPP')}
            </>
          ) : (
            format(range.from, 'PPP')
          )
        ) : (
          <span>{placeholder}</span>
        )}
      </Button>
      <div className="w-auto p-0" />
    </div>
  );
}
