/**
 * @fileoverview Dashboard Filters Index
 *
 * This file serves as the entry point for all dashboard filter components.
 * It exports all filter-related components for easy importing throughout the application.
 *
 * The filter components provide a unified interface for filtering dashboard data by:
 * - Time period (daily, weekly, monthly, quarterly, annual, or custom date range)
 * - Clinics (multiple selection of dental clinics)
 * - Providers (multiple selection of dental providers/doctors)
 *
 * These components are designed to work together with the global filter store
 * to maintain consistent filter state across the application.
 */

// Main filter bar component that contains all individual filters
export * from "./FilterBar";

// Individual filter components
export * from "./TimePeriodFilter";
export * from "./ClinicFilter";
export * from "./ProviderFilter";

// Reusable UI component used by multiple filters
export * from "./MultiSelectCombobox";
