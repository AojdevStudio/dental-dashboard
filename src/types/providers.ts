/**
 * @fileoverview Provider type definitions for the API responses and frontend components.
 *
 * This file exports the provider types used throughout the application,
 * including the enhanced ProviderWithLocations type that includes location relationships.
 */

import type {
  ProviderWithLocations as DBProviderWithLocations,
  ProviderPerformanceMetrics,
} from "@/lib/database/queries/providers";

// Keep this for other modules that might be using the re-export
export type { DBProviderWithLocations as ProviderWithLocations, ProviderPerformanceMetrics };

/**
 * API response wrapper for paginated providers
 */
export interface ProvidersApiResponse {
  success: boolean;
  data: DBProviderWithLocations[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Database-level pagination parameters
 */
export interface PaginationParams {
  offset: number;
  limit: number;
}

/**
 * Generic paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Query parameters for the providers API endpoint
 */
export interface ProvidersQueryParams {
  clinicId?: string;
  locationId?: string;
  providerType?: "dentist" | "hygienist" | "specialist" | "other";
  status?: "active" | "inactive";
  includeInactive?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Enhanced provider filters with optional pagination support
 */
export interface ProviderFilters {
  clinicId?: string;
  locationId?: string;
  providerId?: string;
  providerType?: "dentist" | "hygienist" | "specialist" | "other";
  includeInactive?: boolean;
  pagination?: PaginationParams;
}

/**
 * Provider creation request body
 */
export interface CreateProviderRequest {
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  provider_type?: "dentist" | "hygienist" | "specialist" | "other";
  position?: string;
  clinic_id: string;
}
