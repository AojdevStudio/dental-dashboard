/**
 * @fileoverview Application Logging System
 *
 * This file implements a centralized logging system for the dental dashboard application
 * using Winston. It provides consistent, configurable logging across different environments
 * with appropriate log levels, formatting, and storage options.
 *
 * The logger supports multiple transports (console and file-based) with environment-specific
 * configurations and handles uncaught exceptions and unhandled promise rejections.
 *
 * Log levels used:
 * - error: Critical errors that prevent normal operation (level 0)
 * - warn: Potential issues or unexpected situations that don't halt operation (level 1)
 * - info: General operational messages highlighting application progress (level 2)
 * - debug: Detailed information for development and troubleshooting (level 3)
 */

import path from 'node:path';
import winston from 'winston';
import { format } from 'winston';

/**
 * Determines the current execution environment
 * Defaults to "development" if NODE_ENV is not set
 *
 * @type {string}
 */
const environment = process.env.NODE_ENV || 'development';

/**
 * Determines the appropriate log level based on the current environment
 *
 * - Production: Only warnings and errors (less verbose)
 * - Test: Information level and above
 * - Development: All logs including debug (most verbose)
 *
 * @returns {string} The appropriate log level for the current environment
 */
const getLogLevel = () => {
  switch (environment) {
    case 'production':
      return 'warn';
    case 'test':
      return 'info';
    default:
      return 'debug';
  }
};

/**
 * Custom formatter for human-readable log output
 *
 * Creates a readable log format with timestamp, level, message, and structured metadata.
 * Special handling is provided for error objects and stack traces to improve readability.
 *
 * @type {winston.Logform.Format}
 */
const humanReadableFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
  // Convert metadata to a readable string, but only if it exists
  let metadataStr = '';
  if (Object.keys(metadata).length > 0) {
    // Format metadata in a more readable way
    metadataStr = `\nDetails: ${Object.entries(metadata)
      .map(([key, value]) => {
        // Handle error objects specially
        if (key === 'error' && value instanceof Error) {
          return `${key}: ${value.message}`;
        }
        // Handle stack traces specially
        if (key === 'stack') {
          return `stack trace: ${value}`;
        }
        // For other values, convert to string representation
        return `${key}: ${JSON.stringify(value)}`;
      })
      .join(', ')}`;
  }

  return `${timestamp} [${level.toUpperCase()}] ${message}${metadataStr}`;
});

/**
 * Combined log format with timestamps and colors
 *
 * Combines multiple Winston formatters to create a comprehensive log format:
 * - Timestamp in YYYY-MM-DD HH:mm:ss format
 * - Color-coded log levels for better visual distinction
 * - Human-readable message and metadata formatting
 *
 * @type {winston.Logform.Format}
 */
const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.colorize({
    colors: {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      debug: 'blue',
    },
  }),
  humanReadableFormat
);

/**
 * Configure Winston transport mechanisms based on environment
 *
 * In all environments, logs are output to the console.
 * In production, logs are additionally written to files with rotation policies:
 * - error.log: Contains only error-level logs
 * - combined.log: Contains all logs at the configured level
 *
 * File logs are limited to 5MB per file with a maximum of 5 files for rotation.
 *
 * @type {winston.transport[]}
 */
const transports: winston.transport[] = [];

// Always add console transport
transports.push(new winston.transports.Console());

// Add file transports in production
if (environment === 'production') {
  // Ensure logs directory exists
  const logsDir = path.join(process.cwd(), 'logs');

  // Add file transport for errors
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Add file transport for all logs
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

/**
 * Create and configure the Winston logger instance
 *
 * Creates a logger with:
 * - Custom 4-level logging system (error, warn, info, debug)
 * - Environment-appropriate log level
 * - Custom formatting with timestamps and colors
 * - Multiple transports based on environment
 * - Exception handling with appropriate storage
 *
 * The logger is configured to not exit on uncaught exceptions, allowing the
 * application to potentially recover or perform cleanup operations.
 *
 * @type {winston.Logger}
 */
const logger = winston.createLogger({
  level: getLogLevel(),
  levels: {
    error: 0, // Critical errors that prevent normal operation
    warn: 1, // Potential issues or unexpected situations
    info: 2, // General operational messages
    debug: 3, // Detailed information for development
  },
  format: customFormat,
  transports,
  // Handle uncaught exceptions
  exceptionHandlers:
    environment === 'production'
      ? [
          new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
        ]
      : [new winston.transports.Console()],
  // Prevent Winston from exiting on uncaught exceptions
  exitOnError: false,
});

/**
 * Configure handling for unhandled promise rejections
 *
 * In production, unhandled promise rejections are logged to a dedicated file.
 * In development and test environments, they are logged to the console.
 *
 * This ensures that promise-related issues are always captured even if they're
 * not properly caught in the application code.
 */
if (environment === 'production') {
  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
} else {
  logger.rejections.handle(new winston.transports.Console());
}

/**
 * Export the configured logger instance for use throughout the application
 *
 * Usage examples:
 * ```typescript
 * // Basic usage
 * logger.info("User logged in", { userId: "123" });
 *
 * // Error logging with error object
 * try {
 *   // Some operation that might fail
 * } catch (error) {
 *   logger.error("Operation failed", { error, operationName: "dataSync" });
 * }
 *
 * // Different log levels
 * logger.debug("Detailed debug information", { data: someObject });
 * logger.warn("Configuration issue detected", { configKey: "apiUrl" });
 * ```
 *
 * @default
 */
export default logger;
