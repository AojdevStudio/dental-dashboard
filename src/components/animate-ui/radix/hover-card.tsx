/**
 * Animated Hover Card Component
 *
 * This component enhances the Radix UI HoverCard with smooth animations and transitions.
 * It provides a card that appears when the user hovers over a trigger element, with
 * configurable animation effects for entry and exit.
 *
 * Features:
 * - Spring physics-based animations for natural movement
 * - Direction-aware animations (content slides in from the appropriate side)
 * - Compound component pattern for flexible composition
 * - Context-based state sharing between components
 * - Fully accessible and customizable
 */

"use client";

import { AnimatePresence, type HTMLMotionProps, type Transition, motion } from "motion/react";
import { HoverCard as HoverCardPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Type definition for the HoverCard context
 * @typedef {Object} HoverCardContextType
 * @property {boolean} isOpen - Whether the hover card is currently open
 */
type HoverCardContextType = {
  isOpen: boolean;
};

/**
 * React context for sharing hover card state between components
 */
const HoverCardContext = React.createContext<HoverCardContextType | undefined>(undefined);

/**
 * Hook to access the current hover card state from context
 *
 * @returns {HoverCardContextType} The current hover card context value
 * @throws {Error} If used outside of a HoverCard component
 */
const useHoverCard = (): HoverCardContextType => {
  const context = React.useContext(HoverCardContext);
  if (!context) {
    throw new Error("useHoverCard must be used within a HoverCard");
  }
  return context;
};

/**
 * Possible sides for the hover card to appear relative to the trigger
 */
type Side = "top" | "bottom" | "left" | "right";

/**
 * Determines the initial animation position based on which side the card appears
 *
 * @param {Side} side - The side where the hover card will be positioned
 * @returns {Object} The initial offset position for the animation
 */
const getInitialPosition = (side: Side) => {
  switch (side) {
    case "top":
      return { y: 15 };
    case "bottom":
      return { y: -15 };
    case "left":
      return { x: 15 };
    case "right":
      return { x: -15 };
  }
};

/**
 * Props for the HoverCard component
 * Extends the props from the Radix UI HoverCard
 */
type HoverCardProps = React.ComponentProps<typeof HoverCardPrimitive.Root>;

/**
 * Root HoverCard component
 *
 * Provides context for child components and manages the open state of the hover card.
 *
 * @param {HoverCardProps} props - Component props
 * @param {React.ReactNode} props.children - Child components (typically Trigger and Content)
 * @returns {JSX.Element} The HoverCard component
 */
function HoverCard({ children, ...props }: HoverCardProps) {
  const [isOpen, setIsOpen] = React.useState(props?.open ?? props?.defaultOpen ?? false);

  // Sync with controlled open state if provided
  const { open } = props;
  React.useEffect(() => {
    if (open !== undefined) setIsOpen(open);
  }, [open]);

  // Handle open state changes and call the provided callback
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      props.onOpenChange?.(open);
    },
    [props.onOpenChange] // Only depend on the onOpenChange callback, not the entire props object
  );

  return (
    <HoverCardContext.Provider value={{ isOpen }}>
      <HoverCardPrimitive.Root data-slot="hover-card" {...props} onOpenChange={handleOpenChange}>
        {children}
      </HoverCardPrimitive.Root>
    </HoverCardContext.Provider>
  );
}

/**
 * Props for the HoverCardTrigger component
 */
type HoverCardTriggerProps = React.ComponentProps<typeof HoverCardPrimitive.Trigger>;

/**
 * HoverCard Trigger component
 *
 * Renders the element that triggers the hover card to appear when hovered.
 *
 * @param {HoverCardTriggerProps} props - Component props
 * @returns {JSX.Element} The hover card trigger element
 */
function HoverCardTrigger(props: HoverCardTriggerProps) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />;
}

/**
 * Props for the HoverCardContent component
 * Extends the base content props with animation properties
 */
type HoverCardContentProps = React.ComponentProps<typeof HoverCardPrimitive.Content> &
  HTMLMotionProps<"div"> & {
    transition?: Transition;
  };

/**
 * HoverCard Content component with animations
 *
 * Renders the content of the hover card with entrance and exit animations.
 * Uses spring physics for smooth, natural-feeling animations that adapt based on
 * which side of the trigger the content appears.
 *
 * @param {HoverCardContentProps} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {"center" | "start" | "end"} [props.align="center"] - Alignment relative to the trigger
 * @param {Side} [props.side="bottom"] - Side of the trigger where the content appears
 * @param {number} [props.sideOffset=4] - Offset from the trigger in pixels
 * @param {Transition} [props.transition] - Motion transition configuration
 * @param {React.ReactNode} props.children - Child components to render inside the content
 * @returns {JSX.Element} The animated hover card content
 */
function HoverCardContent({
  className,
  align = "center",
  side = "bottom",
  sideOffset = 4,
  transition = { type: "spring", stiffness: 300, damping: 25 },
  children,
  ...props
}: HoverCardContentProps) {
  const { isOpen } = useHoverCard();
  const initialPosition = getInitialPosition(side);

  return (
    <AnimatePresence>
      {isOpen && (
        <HoverCardPrimitive.Portal forceMount data-slot="hover-card-portal">
          <HoverCardPrimitive.Content
            forceMount
            align={align}
            sideOffset={sideOffset}
            className="z-50"
            {...props}
          >
            <motion.div
              key="hover-card-content"
              data-slot="hover-card-content"
              initial={{ opacity: 0, scale: 0.5, ...initialPosition }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, ...initialPosition }}
              transition={transition}
              className={cn(
                "w-64 rounded-lg border bg-popover p-4 text-popover-foreground shadow-md outline-none",
                className
              )}
              {...props}
            >
              {children}
            </motion.div>
          </HoverCardPrimitive.Content>
        </HoverCardPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  useHoverCard,
  type HoverCardContextType,
  type HoverCardProps,
  type HoverCardTriggerProps,
  type HoverCardContentProps,
};
