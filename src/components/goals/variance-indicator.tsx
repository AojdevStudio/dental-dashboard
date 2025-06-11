/**
 * @fileoverview Variance Indicator Component
 *
 * This file implements a component for visualizing variance from expected progress
 * for goals in the dental dashboard. It provides a visual indicator showing whether
 * a goal is ahead, behind, or on track with its expected progress.
 */

'use client';

import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

/**
 * Interface for VarianceIndicator component properties
 *
 * @property {number} variance - Percentage variance from expected progress (positive = ahead, negative = behind)
 * @property {string} [label] - Optional label text
 * @property {boolean} [showIcon] - Whether to show direction icon
 * @property {boolean} [inverseColors] - Whether to invert color meaning (negative = good, positive = bad)
 * @property {string} [className] - Additional CSS class names
 */
interface VarianceIndicatorProps {
  variance: number;
  label?: string;
  showIcon?: boolean;
  inverseColors?: boolean;
  className?: string;
}

/**
 * Variance Indicator Component
 *
 * A visual indicator for goal variance from expected progress.
 * Features include:
 * - Color-coding based on variance direction
 * - Optional directional icon
 * - Customizable label
 * - Option to invert color meaning for goals where lower is better
 *
 * @param {VarianceIndicatorProps} props - Component properties
 * @returns {JSX.Element} The rendered variance indicator component
 */
export function VarianceIndicator({
  variance,
  label = 'Variance',
  showIcon = true,
  inverseColors = false,
  className,
}: VarianceIndicatorProps) {
  // Determine if variance is positive, negative, or neutral
  const isPositive = variance > 0;
  const isNegative = variance < 0;
  const isNeutral = variance === 0;

  // Format variance as a percentage string
  const formattedVariance = `${isPositive ? '+' : ''}${variance}%`;

  // Determine text color based on variance direction and inverseColors setting
  const getTextColorClass = () => {
    if (isNeutral) {
      return 'text-muted-foreground';
    }

    // If inverseColors is true, negative variance is good (green) and positive is bad (red)
    if (inverseColors) {
      return isNegative ? 'text-green-600' : 'text-red-600';
    }
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  // Get the appropriate icon based on variance direction
  const Icon = () => {
    if (isNeutral) {
      return <Minus class="h-3 w-3" />;
    }
    if (isPositive) {
      return <ArrowUp class="h-3 w-3" />;
    }
    return <ArrowDown class="h-3 w-3" />;
  };

  return (
    <div class={cn('flex items-center text-sm', className)}>
      {label && <span class="text-muted-foreground mr-2">{label}:</span>}

      <div class={cn('flex items-center font-medium', getTextColorClass())}>
        {showIcon && (
          <span class="mr-1">
            <Icon />
          </span>
        )}
        {formattedVariance}
      </div>
    </div>
  );
}
