/**
 * @fileoverview Provider type definitions for the API responses and frontend components.
 *
 * This file exports the provider types used throughout the application,
 * including the enhanced ProviderWithLocations type that includes location relationships.
 */

// Note: These types are defined locally in this file since they're not exported from the database queries
// The database queries file imports these types from here, not the other way around

/**
 * Provider type constants - centralized to prevent inconsistencies
 * These should be used instead of hardcoded string arrays throughout the application
 */
export const PROVIDER_TYPES = ['dentist', 'hygienist', 'specialist', 'other'] as const;
export const PROVIDER_STATUSES = ['active', 'inactive'] as const;

/**
 * Type-safe provider type and status types derived from the constants
 */
export type ProviderTypeValue = (typeof PROVIDER_TYPES)[number];
export type ProviderStatusValue = (typeof PROVIDER_STATUSES)[number];

/**
 * Branded type for ISO date strings to ensure type safety
 */
export type ISODateString = string & { readonly __brand: 'ISODateString' };

/**
 * Provider filters for database queries
 */
export interface ProviderFilters {
  clinicId?: string;
  locationId?: string;
  providerId?: string;
  providerType?: string;
  status?: string;
  includeInactive?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Provider performance metrics data structure
 */
export interface ProviderPerformanceMetrics {
  providerId: string;
  providerName: string;
  locationId: string;
  locationName: string;
  periodStart: ISODateString;
  periodEnd: ISODateString;
  totalProduction: number;
  avgDailyProduction: number;
  productionDays: number;
  productionGoal?: number;
  variancePercentage?: number;
}

/**
 * Location detail for provider
 */
export interface LocationDetail {
  id: string;
  locationId: string;
  locationName: string;
  locationAddress: string | null;
  isPrimary: boolean;
  isActive: boolean;
  startDate: ISODateString;
  endDate: ISODateString | null;
}

/**
 * Provider with location relationships
 */
export interface ProviderWithLocations {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  providerType: string;
  status: string;
  clinic: {
    id: string;
    name: string;
  };
  locations: LocationDetail[];
  primaryLocation?: {
    id: string;
    name: string;
    address: string | null;
  };
  _count: {
    locations: number;
    hygieneProduction: number;
    dentistProduction: number;
  };
}

/**
 * API response wrapper for paginated providers
 */
export interface ProvidersApiResponse {
  success: boolean;
  data: ProviderWithLocations[];
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
  search?: string;
  clinicId?: string;
  locationId?: string;
  providerType?: 'dentist' | 'hygienist' | 'specialist' | 'other';
  status?: 'active' | 'inactive';
  includeInactive?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Provider creation request body
 */
export interface CreateProviderRequest {
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  provider_type?: 'dentist' | 'hygienist' | 'specialist' | 'other';
  position?: string;
  clinic_id: string;
}

/**
 * Location summary for provider performance response
 */
export interface LocationSummary {
  id: string;
  name: string;
  address?: string;
}

/**
 * Production summary by location
 */
export interface LocationProductionSummary {
  locationId: string;
  locationName: string;
  total: number;
  average: number;
  goal?: number;
  variance?: number;
  variancePercentage?: number;
}

/**
 * Goal summary for provider performance
 */
export interface GoalSummary {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  achievementPercentage: number;
  period: string;
  status: 'achieved' | 'in_progress' | 'missed';
}

/**
 * Trend data point for performance metrics
 */
export interface TrendData {
  period: string;
  value: number;
  date: string;
}

/**
 * Provider performance metrics response payload
 */
export interface ProviderPerformanceResponse {
  success: true;
  data: {
    provider: {
      id: string;
      name: string;
      providerType: 'dentist' | 'hygienist' | 'specialist' | 'other';
      primaryLocation?: LocationSummary;
    };
    period: {
      startDate: string;
      endDate: string;
      period: string;
    };
    production: {
      total: number;
      average: number;
      goal?: number;
      variance?: number;
      variancePercentage?: number;
      byLocation?: LocationProductionSummary[];
    };
    goals?: {
      total: number;
      achieved: number;
      achievementRate: number;
      details: GoalSummary[];
    };
    trends?: {
      productionTrend: TrendData[];
      goalAchievementTrend: TrendData[];
    };
  };
}

/**
 * Provider performance query parameters
 */
export interface ProviderPerformanceQueryParams {
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate?: string;
  endDate?: string;
  locationId?: string;
  includeGoals?: boolean;
}
