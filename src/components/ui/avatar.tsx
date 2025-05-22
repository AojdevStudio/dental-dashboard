/**
 * @fileoverview Avatar Component
 * 
 * This file implements an accessible avatar component based on Radix UI's Avatar primitive.
 * Avatars are used to represent users with profile pictures, initials, or fallback icons.
 * 
 * The implementation includes three main components:
 * - Avatar: The root container component
 * - AvatarImage: The image element that displays the user's profile picture
 * - AvatarFallback: The fallback element displayed when the image fails to load
 * 
 * These components work together to provide a consistent user representation across the application
 * with appropriate fallback behavior for missing or failed images.
 */

"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

/**
 * Root avatar component that serves as a container for the avatar image and fallback
 * 
 * This component handles the overall dimensions, shape, and overflow behavior of the avatar.
 * By default, it's a circular container with a fixed size of 40px (h-10 w-10).
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.ReactNode} props.children - Should contain AvatarImage and/or AvatarFallback
 * @returns {JSX.Element} The avatar container element
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

/**
 * Image component for the avatar that displays the user's profile picture
 * 
 * This component handles the display of the actual image within the avatar container.
 * When the image fails to load, it will automatically hide and show the AvatarFallback component.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.src - URL of the image to display
 * @param {string} [props.alt] - Alternative text description of the image for accessibility
 * @param {string} [props.className] - Additional CSS class names
 * @param {function} [props.onLoadingStatusChange] - Callback fired when loading status changes
 * @returns {JSX.Element} The avatar image element
 */
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

/**
 * Fallback component displayed when the avatar image fails to load
 * 
 * This component is shown when:
 * - The image src is not provided
 * - The image fails to load
 * - The image is still loading (with delayMs prop)
 * 
 * Typically contains user initials, an icon, or a placeholder graphic.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {React.ReactNode} props.children - Content to display as fallback (typically text initials or an icon)
 * @param {number} [props.delayMs] - Delay in milliseconds before showing the fallback
 * @returns {JSX.Element} The avatar fallback element
 */
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

/**
 * Export all avatar components for use throughout the application
 * 
 * Typical usage:
 * ```tsx
 * <Avatar>
 *   <AvatarImage src="https://example.com/user-profile.jpg" alt="User Name" />
 *   <AvatarFallback>UN</AvatarFallback>
 * </Avatar>
 * ```
 */
export { Avatar, AvatarImage, AvatarFallback };
