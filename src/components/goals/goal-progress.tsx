/**
 * @fileoverview Goal Progress Component
 *
 * This file implements a progress bar component for visualizing goal progress
 * in the dental dashboard. It provides a customizable visual indicator with
 * color-coding based on the goal's status.
 */

"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

/**
 * Goal status types
 */
type GoalStatus = "on_track" | "at_risk" | "off_track" | "achieved" | "not_started";

/**
 * Interface for GoalProgress component properties
 *
 * @property {number} percent - Progress percentage (0-100)
 * @property {GoalStatus} [status] - Current goal status
 * @property {boolean} [showPercentage] - Whether to show percentage label
 * @property {string} [className] - Additional CSS class names
 */
interface GoalProgressProps {
  percent: number;
  status?: GoalStatus;
  showPercentage?: boolean;
  className?: string;
}

/**
 * Goal Progress Component
 *
 * A visual progress indicator for goals with color-coding based on status.
 * Features include:
 * - Progress bar visualization
 * - Color-coding based on goal status
 * - Optional percentage label
 * - Customizable appearance
 *
 * @param {GoalProgressProps} props - Component properties
 * @returns {JSX.Element} The rendered goal progress component
 */
export function GoalProgress({
  percent,
  status = "on_track",
  showPercentage = false,
  className,
}: GoalProgressProps) {
  // Ensure percent is in valid range
  const validPercent = Math.max(0, Math.min(100, percent));

  // Determine progress bar color based on status
  const getProgressColor = (status: GoalStatus) => {
    switch (status) {
      case "on_track":
        return "bg-green-500";
      case "at_risk":
        return "bg-amber-500";
      case "off_track":
        return "bg-red-500";
      case "achieved":
        return "bg-blue-500";
      default:
        return "bg-slate-500";
    }
  };

  // Determine background color based on status
  const getBackgroundColor = (status: GoalStatus) => {
    switch (status) {
      case "on_track":
        return "bg-green-100";
      case "at_risk":
        return "bg-amber-100";
      case "off_track":
        return "bg-red-100";
      case "achieved":
        return "bg-blue-100";
      default:
        return "bg-slate-100";
    }
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="relative h-2 w-full overflow-hidden rounded-full">
        {/* Background track */}
        <div className={cn("h-full w-full", getBackgroundColor(status))} />

        {/* Progress fill */}
        <div
          className={cn("absolute inset-y-0 left-0 w-full", getProgressColor(status))}
          style={{ width: `${validPercent}%` }}
        />
      </div>

      {/* Optional percentage label */}
      {showPercentage && (
        <div className="text-xs text-right text-muted-foreground">{validPercent}%</div>
      )}
    </div>
  );
}
