/**
 * @fileoverview Utility functions for formatting various data types in the dental dashboard
 *
 * This module provides type-safe formatting functions for common data types used throughout
 * the application including dates, currencies, percentages, numbers, and other specialized
 * dental practice data formatting needs.
 */

// Phone number validation regex - defined at module scope for performance
const PHONE_NUMBER_REGEX = /^(\d{3})(\d{3})(\d{4})$/;

/**
 * Formats a date using localized string representation
 * @param date - The date to format
 * @param locale - Optional locale string (defaults to 'en-US')
 * @param options - Optional Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  locale = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  return date.toLocaleDateString(locale, options);
}

/**
 * Formats a monetary amount as USD currency
 * @param amount - The numeric amount to format
 * @param options - Optional currency formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  options: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
): string {
  return new Intl.NumberFormat('en-US', options).format(amount);
}

/**
 * Formats a decimal value as a percentage
 * @param value - The decimal value (0.15 = 15%)
 * @param maxFractionDigits - Maximum decimal places to show (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, maxFractionDigits = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}

/**
 * Formats a numeric value with locale-appropriate thousands separators
 * @param value - The number to format
 * @param options - Optional number formatting options
 * @returns Formatted number string
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-US', options).format(value);
}

/**
 * Formats a phone number string into standard US format: (555) 123-4567
 * @param phoneNumber - Raw phone number string or number
 * @returns Formatted phone number or original input if invalid format
 */
export function formatPhoneNumber(phoneNumber: string | number): string {
  const cleaned = String(phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(PHONE_NUMBER_REGEX);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return String(phoneNumber);
}

/**
 * Formats an address by replacing commas with newlines for display
 * @param address - Address string with comma separators
 * @returns Multi-line address string
 */
export function formatAddress(address: string): string {
  return address.replace(/,/g, '\n');
}

/**
 * Formats first and last name into full name
 * @param firstName - First name string
 * @param lastName - Last name string
 * @returns Formatted full name
 */
export function formatName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`;
}

/**
 * Formats a date as time string
 * @param date - Date object to extract time from
 * @param locale - Optional locale (defaults to 'en-US')
 * @param options - Optional time formatting options
 * @returns Formatted time string
 */
export function formatTime(
  date: Date,
  locale = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  return date.toLocaleTimeString(locale, options);
}

/**
 * Formats a date as combined date and time string
 * @param date - Date object to format
 * @param locale - Optional locale (defaults to 'en-US')
 * @param options - Optional date-time formatting options
 * @returns Formatted date-time string
 */
export function formatDateTime(
  date: Date,
  locale = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  return date.toLocaleString(locale, options);
}

/**
 * Formats a boolean value as Yes/No string
 * @param value - Boolean value to format
 * @returns 'Yes' for true, 'No' for false
 */
export function formatBoolean(value: boolean): string {
  return value ? 'Yes' : 'No';
}

/**
 * Formats an array as comma-separated string
 * @param array - Array of values to join
 * @param separator - Separator string (defaults to ', ')
 * @returns Comma-separated string representation
 */
export function formatArray(array: readonly unknown[], separator = ', '): string {
  return array.join(separator);
}

/**
 * Formats an object as JSON string with indentation
 * @param obj - Object to format
 * @param indent - Number of spaces for indentation (defaults to 2)
 * @returns Formatted JSON string
 */
export function formatObject(obj: object, indent = 2): string {
  return JSON.stringify(obj, null, indent);
}

/**
 * Returns a formatted string for null values
 * @returns 'N/A' string
 */
export function formatNull(): string {
  return 'N/A';
}

/**
 * Returns a formatted string for undefined values
 * @returns 'N/A' string
 */
export function formatUndefined(): string {
  return 'N/A';
}

/**
 * Extracts and formats error message from Error object
 * @param error - Error object
 * @returns Error message string
 */
export function formatError(error: Error): string {
  return error.message;
}

/**
 * Formats a function as string representation
 * @param func - Function to format
 * @returns Function string representation
 */
export function formatFunction(func: (...args: unknown[]) => unknown): string {
  return func.toString();
}

/**
 * Formats a symbol as string representation
 * @param symbol - Symbol to format
 * @returns Symbol string representation
 */
export function formatSymbol(symbol: symbol): string {
  return symbol.toString();
}

/**
 * Formats a BigInt as string representation
 * @param bigInt - BigInt value to format
 * @returns BigInt string representation
 */
export function formatBigInt(bigInt: bigint): string {
  return bigInt.toString();
}

/**
 * Generic value formatter that handles various data types
 * @param value - Value of any type to format
 * @returns Appropriately formatted string representation
 */
export function formatValue(value: unknown): string {
  if (value === null) {
    return formatNull();
  }
  if (value === undefined) {
    return formatUndefined();
  }
  if (typeof value === 'boolean') {
    return formatBoolean(value);
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value)) {
      return 'NaN';
    }
    if (!Number.isFinite(value)) {
      return value > 0 ? 'Infinity' : '-Infinity';
    }
    return formatNumber(value);
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'bigint') {
    return formatBigInt(value);
  }
  if (typeof value === 'symbol') {
    return formatSymbol(value);
  }
  if (typeof value === 'function') {
    return formatFunction(value as (...args: unknown[]) => unknown);
  }
  if (value instanceof Date) {
    return formatDateTime(value);
  }
  if (value instanceof Error) {
    return formatError(value);
  }
  if (Array.isArray(value)) {
    return formatArray(value);
  }
  if (typeof value === 'object') {
    return formatObject(value);
  }
  return String(value);
}
