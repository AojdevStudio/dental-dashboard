/**
 * Progress Component
 *
 * This component provides a simple progress bar with support for animations.
 * It's built using Radix UI primitives and styled with Tailwind CSS.
 *
 * Features:
 * - Smooth animations for progress indicator
 * - Customizable styling
 * - Fully accessible
 */

"use client";

import { cn } from "@/lib/utils";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
