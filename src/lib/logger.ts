import winston from "winston";
import { format } from "winston";
import path from "node:path";

// Determine environment
const environment = process.env.NODE_ENV || "development";

// Set log level based on environment
const getLogLevel = () => {
  switch (environment) {
    case "production":
      return "warn";
    case "test":
      return "info";
    default:
      return "debug";
  }
};

// Define custom format for human-readable logs
const humanReadableFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
  // Convert metadata to a readable string, but only if it exists
  let metadataStr = "";
  if (Object.keys(metadata).length > 0) {
    // Format metadata in a more readable way
    metadataStr = `\nDetails: ${Object.entries(metadata)
      .map(([key, value]) => {
        // Handle error objects specially
        if (key === "error" && value instanceof Error) {
          return `${key}: ${value.message}`;
        }
        // Handle stack traces specially
        if (key === "stack") {
          return `stack trace: ${value}`;
        }
        // For other values, convert to string representation
        return `${key}: ${JSON.stringify(value)}`;
      })
      .join(", ")}`;
  }

  return `${timestamp} [${level.toUpperCase()}] ${message}${metadataStr}`;
});

// Create custom format with colors
const customFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.colorize({
    colors: {
      error: "red",
      warn: "yellow",
      info: "green",
      debug: "blue",
    },
  }),
  humanReadableFormat
);

// Define transports based on environment
const transports = [];

// Always add console transport
transports.push(new winston.transports.Console());

// Add file transports in production
if (environment === "production") {
  // Ensure logs directory exists
  const logsDir = path.join(process.cwd(), "logs");

  // Add file transport for errors
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Add file transport for all logs
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create Winston logger instance
// Note: We're using a custom 4-level system instead of Winston's default 7 levels
// This simplifies logging categories for our application needs
const logger = winston.createLogger({
  level: getLogLevel(),
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  },
  format: customFormat,
  transports,
  // Handle uncaught exceptions
  exceptionHandlers:
    environment === "production"
      ? [
          new winston.transports.File({
            filename: path.join(process.cwd(), "logs", "exceptions.log"),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
        ]
      : [new winston.transports.Console()],
  // Prevent Winston from exiting on uncaught exceptions
  exitOnError: false,
});

// Configure unhandled promise rejection handling
if (environment === "production") {
  logger.rejections.handle(
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs", "rejections.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
} else {
  logger.rejections.handle(new winston.transports.Console());
}

export default logger;
