/**
 * @fileoverview Utility Functions
 *
 * This file contains utility functions used throughout the application.
 * Currently includes a class name utility for merging Tailwind CSS classes
 * safely while handling conflicts.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges class names using clsx and tailwind-merge
 *
 * This utility function combines multiple class names or conditional class expressions
 * using clsx, then processes the result with tailwind-merge to properly handle
 * Tailwind CSS class conflicts (like applying both 'px-4' and 'px-6' where the latter should win).
 *
 * @param {...ClassValue[]} inputs - Any number of class values, class name strings,
 *                                   objects of class names with boolean values,
 *                                   or arrays of class names
 * @returns {string} A string of merged class names with conflicts resolved
 *
 * @example
 * // Basic usage with strings
 * cn('px-4 py-2', 'bg-blue-500'); // 'px-4 py-2 bg-blue-500'
 *
 * @example
 * // With conditional classes
 * cn('px-4', isActive && 'bg-blue-500', !isActive && 'bg-gray-500');
 *
 * @example
 * // Resolving conflicts (px-6 overrides px-4)
 * cn('px-4 py-2', 'px-6'); // 'py-2 px-6'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
