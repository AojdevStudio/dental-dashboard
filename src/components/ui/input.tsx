/**
 * @fileoverview Input Component
 * 
 * This file implements a reusable input component with consistent styling and accessibility features.
 * The input component is designed to work within forms and supports all standard HTML input attributes.
 * It includes proper styling for different states including focus, disabled, and validation states.
 */

"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input component with consistent styling
 * 
 * A styled input component that supports all standard HTML input attributes.
 * Provides consistent styling across the application with proper states for
 * focus, disabled, and validation.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS class names
 * @param {string} [props.type='text'] - HTML input type attribute
 * @param {React.InputHTMLAttributes<HTMLInputElement>} props.props - All standard input attributes
 * @returns {JSX.Element} The input element
 * 
 * @example
 * // Basic text input
 * <Input placeholder="Enter your name" />
 * 
 * @example
 * // Email input with validation
 * <Input 
 *   type="email" 
 *   placeholder="Email address"
 *   required
 *   aria-invalid={emailError ? true : undefined}
 * />
 * 
 * @example
 * // Password input
 * <Input type="password" placeholder="Password" />
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

/**
 * Export the Input component for use throughout the application
 */
export { Input };
