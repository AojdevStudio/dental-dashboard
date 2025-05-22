/**
 * @fileoverview Metric Card Component
 * 
 * This file implements a reusable metric card component for displaying
 * key performance indicators and metrics in the dashboard interface.
 */

"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Interface for MetricCard component properties
 * 
 * @property {string} title - Title of the metric
 * @property {string | number} value - Current value of the metric
 * @property {string} [description] - Optional description text
 * @property {number} [changePercent] - Percentage change from previous period
 * @property {boolean} [isLoading] - Whether the card is in loading state
 * @property {React.ReactNode} [icon] - Optional icon to display
 * @property {'increase' | 'decrease' | 'neutral'} [changeDirection] - Direction of change
 * @property {boolean} [inverseColor] - Whether to invert the color meaning (e.g., for metrics where decrease is good)
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  changePercent?: number;
  isLoading?: boolean;
  icon?: React.ReactNode;
  changeDirection?: 'increase' | 'decrease' | 'neutral';
  inverseColor?: boolean;
}

/**
 * Metric Card Component
 * 
 * A card component for displaying key metrics and KPIs in the dashboard.
 * Features include:
 * - Title and current value display
 * - Optional description
 * - Change percentage from previous period with visual indicator
 * - Loading state
 * - Color-coded change direction (can be inverted for metrics where decrease is positive)
 * 
 * @param {MetricCardProps} props - Component properties
 * @returns {JSX.Element} The rendered metric card component
 */
export function MetricCard({
  title,
  value,
  description,
  changePercent,
  isLoading = false,
  icon,
  changeDirection,
  inverseColor = false,
}: MetricCardProps) {
  // Automatically determine change direction if not explicitly provided
  const direction = changeDirection || (
    changePercent ? (
      changePercent > 0 ? 'increase' : 
      changePercent < 0 ? 'decrease' : 'neutral'
    ) : 'neutral'
  );

  // Determine if the change is positive based on direction and inverseColor
  const isPositive = inverseColor 
    ? direction === 'decrease'
    : direction === 'increase';
  
  // Determine if the change is negative based on direction and inverseColor
  const isNegative = inverseColor
    ? direction === 'increase'
    : direction === 'decrease';

  // Only show loading state if isLoading is true
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-20 mb-2" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        {/* Description and change percentage */}
        <div className="flex items-center mt-1">
          {changePercent !== undefined && (
            <div className={cn(
              "text-xs font-medium mr-2 flex items-center",
              isPositive && "text-green-500",
              isNegative && "text-red-500"
            )}>
              {direction === 'increase' && <ArrowUp className="mr-1 h-3 w-3" />}
              {direction === 'decrease' && <ArrowDown className="mr-1 h-3 w-3" />}
              {direction === 'neutral' && <Minus className="mr-1 h-3 w-3" />}
              {Math.abs(changePercent)}%
            </div>
          )}
          
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
