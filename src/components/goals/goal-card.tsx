/**
 * @fileoverview Goal Card Component
 *
 * This file implements a card component for displaying practice goals in the
 * dental dashboard. It shows goal details, progress, and status information.
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, CalendarClock, Clock, DollarSign, Edit, Target, Users } from "lucide-react";
import * as React from "react";
import { GoalProgress } from "./goal-progress";
import { VarianceIndicator } from "./variance-indicator";

/**
 * Goal category types
 */
type GoalCategory = "financial" | "patient" | "productivity" | "retention" | "other";

/**
 * Goal status types
 */
type GoalStatus = "on_track" | "at_risk" | "off_track" | "achieved" | "not_started";

/**
 * Interface for Goal object
 *
 * @property {string} id - Unique identifier for the goal
 * @property {string} title - Goal title/description
 * @property {number} target - Target value for the goal
 * @property {number} current - Current value/progress toward the goal
 * @property {GoalCategory} category - Category of the goal
 * @property {GoalStatus} status - Current status of the goal
 * @property {string} [unit] - Unit of measurement (e.g., "$", "%", "patients")
 * @property {Date} startDate - Start date for the goal period
 * @property {Date} endDate - End date for the goal period
 * @property {number} [variance] - Variance from expected progress (percentage)
 */
interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  category: GoalCategory;
  status: GoalStatus;
  unit?: string;
  startDate: Date;
  endDate: Date;
  variance?: number;
}

/**
 * Interface for GoalCard component properties
 *
 * @property {Goal} goal - Goal data to display
 * @property {() => void} [onEdit] - Callback for editing the goal
 * @property {() => void} [onViewDetails] - Callback for viewing goal details
 * @property {boolean} [isLoading] - Whether the component is in loading state
 */
interface GoalCardProps {
  goal: Goal;
  onEdit?: () => void;
  onViewDetails?: () => void;
  isLoading?: boolean;
}

/**
 * Goal Card Component
 *
 * A card component for displaying dental practice goals and their progress.
 * Features include:
 * - Goal title and target display
 * - Visual progress indicator
 * - Goal period dates
 * - Status badge
 * - Variance from expected progress
 * - Edit and details actions
 *
 * @param {GoalCardProps} props - Component properties
 * @returns {JSX.Element} The rendered goal card component
 */
export function GoalCard({ goal, onEdit, onViewDetails, isLoading = false }: GoalCardProps) {
  // Helper function to format values with the goal's unit
  const formatValue = (value: number) => {
    if (goal.unit === "$") {
      return `$${value.toLocaleString()}`;
    }
    if (goal.unit === "%") {
      return `${value}%`;
    }
    return `${value.toLocaleString()}${goal.unit ? ` ${goal.unit}` : ""}`;
  };

  // Calculate progress percentage
  const progressPercent = Math.min(Math.round((goal.current / goal.target) * 100), 100);

  // Helper to get status badge color
  const getStatusBadgeProps = (status: GoalStatus) => {
    switch (status) {
      case "on_track":
        return { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" };
      case "at_risk":
        return { variant: "outline", className: "bg-amber-50 text-amber-700 border-amber-200" };
      case "off_track":
        return { variant: "outline", className: "bg-red-50 text-red-700 border-red-200" };
      case "achieved":
        return { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200" };
      default:
        return { variant: "outline", className: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  // Helper to get category icon
  const CategoryIcon = () => {
    switch (goal.category) {
      case "financial":
        return <DollarSign className="h-4 w-4" />;
      case "patient":
        return <Users className="h-4 w-4" />;
      case "productivity":
        return <Clock className="h-4 w-4" />;
      case "retention":
        return <Target className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  // Only show loading state if isLoading is true
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-20" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <CategoryIcon />
            {goal.title}
          </CardTitle>
          <Badge {...getStatusBadgeProps(goal.status)}>{goal.status.replace("_", " ")}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Target and current values */}
        <div className="flex justify-between items-baseline">
          <div className="text-2xl font-bold">{formatValue(goal.current)}</div>
          <div className="text-sm text-muted-foreground">Target: {formatValue(goal.target)}</div>
        </div>

        {/* Progress bar */}
        <GoalProgress percent={progressPercent} status={goal.status} />

        {/* Date range */}
        <div className="flex items-center text-sm text-muted-foreground">
          <CalendarClock className="h-3 w-3 mr-1" />
          <span>
            {goal.startDate.toLocaleDateString()} - {goal.endDate.toLocaleDateString()}
          </span>
        </div>

        {/* Variance indicator if available */}
        {goal.variance !== undefined && (
          <VarianceIndicator variance={goal.variance} label="Variance from expected" />
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button variant="ghost" size="sm" onClick={onEdit} className="text-muted-foreground">
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button>

        <Button variant="outline" size="sm" onClick={onViewDetails}>
          Details
        </Button>
      </CardFooter>
    </Card>
  );
}
