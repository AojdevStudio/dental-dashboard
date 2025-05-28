/**
 * @fileoverview Client-Side Logging System
 *
 * This file implements a simple logging system for client-side components
 * that mimics the Winston logger interface but uses browser console methods.
 * This is necessary because Winston uses Node.js-specific modules that
 * cannot be used in client components.
 */

/**
 * Log levels for client-side logging
 */
type LogLevel = "error" | "warn" | "info" | "debug";

/**
 * Metadata object for structured logging
 */
type LogMetadata = Record<string, unknown>;

/**
 * Client-side logger interface that mimics Winston
 */
interface ClientLogger {
  error: (message: string, metadata?: LogMetadata) => void;
  warn: (message: string, metadata?: LogMetadata) => void;
  info: (message: string, metadata?: LogMetadata) => void;
  debug: (message: string, metadata?: LogMetadata) => void;
}

/**
 * Formats log metadata for console output
 * @param metadata - The metadata object to format
 * @returns Formatted metadata string
 */
const formatMetadata = (metadata?: LogMetadata): string => {
  if (!metadata || Object.keys(metadata).length === 0) {
    return "";
  }

  try {
    return ` | ${JSON.stringify(metadata)}`;
  } catch (error) {
    return ` | [Metadata formatting error: ${error}]`;
  }
};

/**
 * Creates a log function for a specific level
 * @param level - The log level
 * @param consoleMethod - The console method to use
 * @returns Log function
 */
const createLogFunction = (level: LogLevel, consoleMethod: (...args: unknown[]) => void) => {
  return (message: string, metadata?: LogMetadata) => {
    const timestamp = new Date().toISOString();
    const formattedMessage = `${timestamp} [${level.toUpperCase()}] ${message}${formatMetadata(metadata)}`;
    consoleMethod(formattedMessage);
  };
};

/**
 * Client-side logger implementation
 *
 * Provides the same interface as the Winston logger but uses console methods
 * for browser compatibility. Only logs in development mode to avoid cluttering
 * production console logs.
 */
const clientLogger: ClientLogger = {
  error: createLogFunction("error", console.error),
  warn: createLogFunction("warn", console.warn),
  info: createLogFunction("info", console.info),
  debug: createLogFunction("debug", console.debug),
};

/**
 * Conditional logger that only logs in development
 * In production, all log methods are no-ops to avoid console clutter
 */
const logger: ClientLogger =
  process.env.NODE_ENV === "development"
    ? clientLogger
    : {
        error: () => {},
        warn: () => {},
        info: () => {},
        debug: () => {},
      };

export default logger;
