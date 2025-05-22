/**
 * Animated Counting Number Component
 * 
 * This component provides a smooth, animated transition when displaying changing numbers.
 * It uses spring physics to create natural-feeling animations when a number changes,
 * giving the appearance of counting up or down to the new value.
 * 
 * Features:
 * - Spring physics-based animations for natural counting effect
 * - Intersection Observer integration for triggering animations when in view
 * - Configurable decimal places and separators
 * - Zero-padding support for consistent width
 * - Customizable animation parameters
 * 
 * This component is particularly useful for metrics, statistics, and other numerical
 * data that changes and should draw the user's attention through animation.
 */

"use client";

import * as React from "react";
import {
  type SpringOptions,
  type UseInViewOptions,
  useInView,
  useMotionValue,
  useSpring,
} from "motion/react";

/**
 * Props for the CountingNumber component
 * 
 * @typedef {Object} CountingNumberProps
 * @property {number} number - The target number to animate to
 * @property {number} [fromNumber=0] - The starting number for the animation
 * @property {boolean} [padStart=false] - Whether to pad the number with leading zeros
 * @property {boolean} [inView=false] - Whether to trigger animation only when in viewport
 * @property {string} [inViewMargin="0px"] - Margin around the element for intersection detection
 * @property {boolean} [inViewOnce=true] - Whether to trigger the animation only once when it enters the viewport
 * @property {string} [decimalSeparator="."] - Character to use as decimal separator
 * @property {SpringOptions} [transition] - Motion spring animation configuration
 * @property {number} [decimalPlaces=0] - Number of decimal places to display
 */
type CountingNumberProps = React.ComponentProps<"span"> & {
  number: number;
  fromNumber?: number;
  padStart?: boolean;
  inView?: boolean;
  inViewMargin?: UseInViewOptions["margin"];
  inViewOnce?: boolean;
  decimalSeparator?: string;
  transition?: SpringOptions;
  decimalPlaces?: number;
};

/**
 * CountingNumber Component
 * 
 * Renders a number that animates when it changes, creating a counting effect.
 * Uses spring physics for smooth, natural-feeling animations and supports
 * viewport-based animation triggering.
 * 
 * @param {CountingNumberProps} props - Component props
 * @param {React.Ref<HTMLSpanElement>} props.ref - Ref to access the DOM element
 * @param {number} props.number - The target number to animate to
 * @param {number} [props.fromNumber=0] - The starting number for the animation
 * @param {boolean} [props.padStart=false] - Whether to pad the number with leading zeros
 * @param {boolean} [props.inView=false] - Whether to trigger animation only when in viewport
 * @param {string} [props.inViewMargin="0px"] - Margin around the element for intersection detection
 * @param {boolean} [props.inViewOnce=true] - Whether to trigger the animation only once
 * @param {string} [props.decimalSeparator="."] - Character to use as decimal separator
 * @param {SpringOptions} [props.transition] - Motion spring animation configuration
 * @param {number} [props.decimalPlaces=0] - Number of decimal places to display
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} The animated number span element
 */
function CountingNumber({
  ref,
  number,
  fromNumber = 0,
  padStart = false,
  inView = false,
  inViewMargin = "0px",
  inViewOnce = true,
  decimalSeparator = ".",
  transition = { stiffness: 90, damping: 50 },
  decimalPlaces = 0,
  className,
  ...props
}: CountingNumberProps) {
  // Create a local ref and expose it via useImperativeHandle if an external ref is provided
  const localRef = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLSpanElement);

  // Determine the number of decimal places to display
  const numberStr = number.toString();
  const decimals =
    typeof decimalPlaces === "number"
      ? decimalPlaces
      : numberStr.includes(".")
        ? (numberStr.split(".")[1]?.length ?? 0)
        : 0;

  // Set up motion values and spring animation
  const motionVal = useMotionValue(fromNumber);
  const springVal = useSpring(motionVal, transition);
  
  // Set up intersection observer to trigger animation when element is in view
  const inViewResult = useInView(localRef, {
    once: inViewOnce,
    margin: inViewMargin,
  });
  const isInView = !inView || inViewResult;

  // Update the motion value when the target number changes or element comes into view
  React.useEffect(() => {
    if (isInView) motionVal.set(number);
  }, [isInView, number, motionVal]);

  // Update the DOM element's text content when the spring value changes
  React.useEffect(() => {
    const unsubscribe = springVal.on("change", (latest) => {
      if (localRef.current) {
        let formatted = decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toString();

        // Replace the default decimal separator with the custom one if needed
        if (decimals > 0) {
          formatted = formatted.replace(".", decimalSeparator);
        }

        // Apply padding if enabled to maintain consistent width
        if (padStart) {
          const finalIntLength = Math.floor(Math.abs(number)).toString().length;
          const [intPart, fracPart] = formatted.split(decimalSeparator);
          const paddedInt = intPart?.padStart(finalIntLength, "0") ?? "";
          formatted = fracPart ? `${paddedInt}${decimalSeparator}${fracPart}` : paddedInt;
        }

        localRef.current.textContent = formatted;
      }
    });
    return () => unsubscribe();
  }, [springVal, decimals, padStart, number, decimalSeparator]);

  // Calculate the initial text to display before animation starts
  const finalIntLength = Math.floor(Math.abs(number)).toString().length;
  const initialText = padStart
    ? `${'0'.padStart(finalIntLength, '0')}${decimals > 0 ? `${decimalSeparator}${'0'.repeat(decimals)}` : ''}`
    : `0${decimals > 0 ? `${decimalSeparator}${'0'.repeat(decimals)}` : ''}`;

  return (
    <span ref={localRef} data-slot="counting-number" className={className} {...props}>
      {initialText}
    </span>
  );
}

export { CountingNumber, type CountingNumberProps };
