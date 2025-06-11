/**
 * @fileoverview Database Client Configuration
 *
 * This file configures and exports a singleton Prisma client instance for database access.
 * It ensures that only one Prisma client is created per application instance to prevent
 * connection pool exhaustion, especially during development with hot reloading.
 *
 * The implementation follows the recommended pattern for Next.js applications,
 * using global object caching in development and creating a fresh instance in production.
 */

import { PrismaClient } from '@prisma/client';

/**
 * Type extension for the global object to store the Prisma client instance
 *
 * This allows us to attach the Prisma client to the global object in development
 * environments, preventing multiple client instances during hot reloading.
 *
 * @type {Object}
 * @property {PrismaClient | undefined} prisma - The cached Prisma client instance
 */
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton Prisma client instance for database access
 *
 * Uses the cached instance if available, otherwise creates a new one.
 * This pattern prevents connection pool exhaustion during development
 * with hot module reloading while ensuring optimal performance in production.
 *
 * @type {PrismaClient}
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

/**
 * Cache the Prisma client instance in development environments
 *
 * In development mode with hot reloading, we store the Prisma client
 * on the global object to prevent creating multiple instances and
 * exhausting the database connection pool.
 *
 * This is not necessary in production where the application typically
 * has a more stable lifecycle without hot reloading.
 */
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
