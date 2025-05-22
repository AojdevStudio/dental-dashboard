/**
 * Animated Progress Component
 * 
 * This component provides an animated progress bar with counting number display.
 * It extends the base Progress component from @base-ui-components with animation
 * capabilities using the motion library. The component is designed as a compound
 * component with multiple parts that can be composed together.
 * 
 * Features:
 * - Smooth spring animations for progress indicator
 * - Animated counting number for progress value
 * - Customizable animation parameters
 * - Context-based value sharing between components
 * - Fully accessible and styleable
 */

"use client";

import * as React from "react";
import { Progress as ProgressPrimitives } from "@base-ui-components/react/progress";
import { motion, type Transition } from "motion/react";

import { cn } from "@/lib/utils";
import {
  CountingNumber,
  type CountingNumberProps,
} from "@/components/animate-ui/text/counting-number";

/**
 * Type definition for the Progress context
 * @typedef {Object} ProgressContextType
 * @property {number|null} value - The current progress value (0-100)
 */
type ProgressContextType = {
  value: number | null;
};

/**
 * React context for sharing progress value between components
 */
const ProgressContext = React.createContext<ProgressContextType | undefined>(undefined);

/**
 * Hook to access the current progress value from context
 * 
 * @returns {ProgressContextType} The current progress context value
 * @throws {Error} If used outside of a Progress component
 */
const useProgress = (): ProgressContextType => {
  const context = React.useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a Progress");
  }
  return context;
};

/**
 * Props for the Progress component
 * Extends the props from the base Progress component
 */
type ProgressProps = React.ComponentProps<typeof ProgressPrimitives.Root>;

/**
 * Root Progress component
 * 
 * Provides context for child components and renders the base progress container.
 * 
 * @param {ProgressProps} props - Component props
 * @param {number|null} props.value - The current progress value (0-100)
 * @returns {JSX.Element} The Progress component
 */
const Progress = ({ value, ...props }: ProgressProps) => {
  return (
    <ProgressContext.Provider value={{ value }}>
      <ProgressPrimitives.Root data-slot="progress" value={value} {...props}>
        {props.children}
      </ProgressPrimitives.Root>
    </ProgressContext.Provider>
  );
};

/**
 * Motion-enhanced version of the progress indicator for animations
 */
const MotionProgressIndicator = motion.create(ProgressPrimitives.Indicator);

/**
 * Props for the ProgressTrack component
 * Extends the base track props with animation transition options
 */
type ProgressTrackProps = React.ComponentProps<typeof ProgressPrimitives.Track> & {
  transition?: Transition;
};

/**
 * Progress Track component with animated indicator
 * 
 * Renders the track (background) and animated indicator (foreground) of the progress bar.
 * Uses spring physics for smooth, natural-feeling animations.
 * 
 * @param {ProgressTrackProps} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {Transition} [props.transition] - Motion transition configuration
 * @returns {JSX.Element} The animated progress track
 */
function ProgressTrack({
  className,
  transition = { type: "spring", stiffness: 100, damping: 30 },
  ...props
}: ProgressTrackProps) {
  const { value } = useProgress();

  return (
    <ProgressPrimitives.Track
      data-slot="progress-track"
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <MotionProgressIndicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary rounded-full"
        animate={{ width: `${value}%` }}
        transition={transition}
      />
    </ProgressPrimitives.Track>
  );
}

/**
 * Props for the ProgressLabel component
 */
type ProgressLabelProps = React.ComponentProps<typeof ProgressPrimitives.Label>;

/**
 * Progress Label component
 * 
 * Renders a label for the progress bar, typically used to describe what the progress represents.
 * 
 * @param {ProgressLabelProps} props - Component props
 * @returns {JSX.Element} The progress label
 */
function ProgressLabel(props: ProgressLabelProps) {
  return <ProgressPrimitives.Label data-slot="progress-label" {...props} />;
}

/**
 * Props for the ProgressValue component
 * Extends the base value props with counting number animation options
 */
type ProgressValueProps = Omit<React.ComponentProps<typeof ProgressPrimitives.Value>, "render"> & {
  countingNumberProps?: CountingNumberProps;
};

/**
 * Progress Value component with animated counting number
 * 
 * Displays the current progress value as an animated counting number.
 * Uses spring physics for smooth number transitions.
 * 
 * @param {ProgressValueProps} props - Component props
 * @param {CountingNumberProps} [props.countingNumberProps] - Props for the CountingNumber component
 * @returns {JSX.Element} The animated progress value
 */
function ProgressValue({ countingNumberProps, ...props }: ProgressValueProps) {
  const { value } = useProgress();

  return (
    <ProgressPrimitives.Value
      data-slot="progress-value"
      render={
        <CountingNumber
          number={value ?? 0}
          transition={{ stiffness: 80, damping: 20 }}
          {...countingNumberProps}
        />
      }
      {...props}
    />
  );
}

export {
  Progress,
  ProgressTrack,
  ProgressLabel,
  ProgressValue,
  useProgress,
  type ProgressProps,
  type ProgressTrackProps,
  type ProgressLabelProps,
  type ProgressValueProps,
};
