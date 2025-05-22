/**
 * @fileoverview Dashboard Components Index
 *
 * This file serves as the main entry point for all dashboard-related components.
 * It exports both the dashboard components themselves and their associated filter components.
 *
 * The dashboard components provide data visualization and interactive elements for the
 * dental practice dashboard, allowing users to monitor key metrics and performance indicators.
 *
 * The filter components provide a way for users to customize the data displayed in the
 * dashboard by filtering by time period, clinic, provider, and other relevant dimensions.
 *
 * @see {@link ./filters/index.ts} for more details on the filter components
 */

// Example dashboard component
export * from "./DashboardExample";

// All filter-related components
export * from "./filters";
