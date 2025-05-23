import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes efficiently.
 * 
 * This utility uses clsx for conditional class joining and tailwind-merge to handle
 * Tailwind CSS class conflicts by properly merging them according to Tailwind's specificity rules.
 * 
 * @param {ClassValue[]} inputs - Array of class values, conditionals, or objects to merge
 * @returns {string} A string of merged and deduplicated class names
 * 
 * @example
 * // Simple usage
 * cn("px-4 py-2", "bg-blue-500")
 * // With conditionals
 * cn("px-4", isActive && "bg-blue-500", !isActive && "bg-gray-200")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
