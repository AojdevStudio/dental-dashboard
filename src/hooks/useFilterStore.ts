/**
 * Dashboard filtering functionality using Zustand for global state management with localStorage persistence
 *
 * This module provides a centralized store for managing dashboard filtering options including:
 * - Time period selection (daily, weekly, monthly, quarterly, annual, custom)
 * - Date range selection
 * - Clinic filtering
 * - Provider filtering
 *
 * The filter state is persisted in localStorage to maintain user preferences across sessions.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  addDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subMonths,
} from "date-fns";

/**
 * Available time period options for filtering dashboard data
 *
 * @typedef {'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom'} TimePeriod
 */
export type TimePeriod = "daily" | "weekly" | "monthly" | "quarterly" | "annual" | "custom";

/**
 * Interface defining the filter state and available actions
 *
 * @interface FilterState
 */
interface FilterState {
  /** Currently selected time period filter */
  timePeriod: TimePeriod;

  /** Start date for the current filter range */
  startDate: Date;

  /** End date for the current filter range */
  endDate: Date;

  /** Array of selected clinic IDs */
  selectedClinics: string[];

  /** Array of selected provider IDs */
  selectedProviders: string[];

  /**
   * Updates the time period filter and automatically sets appropriate date range
   *
   * @param {TimePeriod} period - The time period to set
   */
  setTimePeriod: (period: TimePeriod) => void;

  /**
   * Sets a custom date range and automatically updates time period to 'custom'
   *
   * @param {Date} startDate - The start date of the range
   * @param {Date} endDate - The end date of the range
   */
  setDateRange: (startDate: Date, endDate: Date) => void;

  /**
   * Updates the selected clinics filter
   *
   * @param {string[]} clinics - Array of clinic IDs to filter by
   */
  setSelectedClinics: (clinics: string[]) => void;

  /**
   * Updates the selected providers filter
   *
   * @param {string[]} providers - Array of provider IDs to filter by
   */
  setSelectedProviders: (providers: string[]) => void;

  /**
   * Resets all filters to their default values
   */
  clearFilters: () => void;

  /**
   * Alias for clearFilters, resets all filters to their default values
   */
  resetToDefaults: () => void;
}

/**
 * Calculates appropriate date range based on the selected time period
 *
 * @param {TimePeriod} period - The time period to calculate range for
 * @returns {{ start: Date; end: Date }} Object containing start and end dates
 */
const getDateRangeForPeriod = (period: TimePeriod): { start: Date; end: Date } => {
  const today = new Date();

  switch (period) {
    case "daily":
      return {
        start: startOfDay(today),
        end: endOfDay(today),
      };
    case "weekly":
      return {
        start: startOfWeek(today, { weekStartsOn: 1 }), // Week starts on Monday
        end: endOfWeek(today, { weekStartsOn: 1 }),
      };
    case "monthly":
      return {
        start: startOfMonth(today),
        end: endOfMonth(today),
      };
    case "quarterly":
      return {
        start: startOfQuarter(today),
        end: endOfQuarter(today),
      };
    case "annual":
      return {
        start: startOfYear(today),
        end: endOfYear(today),
      };
    default: // 'custom' or any other value
      // Default to last 30 days for custom
      return {
        start: startOfDay(addDays(today, -30)),
        end: endOfDay(today),
      };
  }
};

/** Default time period used when initializing or resetting filters */
const defaultTimePeriod: TimePeriod = "monthly";

/** Default date range calculated based on the default time period */
const defaultDateRange = getDateRangeForPeriod(defaultTimePeriod);

/**
 * List of query keys that should be invalidated when filters change
 * Used to ensure data is refreshed when filter criteria change
 *
 * @type {string[]}
 */
export const filterDependentQueries = [
  "metrics",
  "kpis",
  "appointments",
  "patients",
  "revenue",
  "performance",
  "dashboard",
];

/**
 * Custom hook for managing global filter state across the dashboard
 *
 * Uses Zustand with the persist middleware to maintain filter state in localStorage
 * between page refreshes and browser sessions.
 *
 * @returns {FilterState} Filter state and actions to manipulate it
 *
 * @example
 * // In a component:
 * import { useFilterStore } from '@/hooks/useFilterStore';
 *
 * function FilterControls() {
 *   const {
 *     timePeriod,
 *     setTimePeriod,
 *     selectedClinics,
 *     setSelectedClinics
 *   } = useFilterStore();
 *
 *   return (
 *     <div>
 *       <select value={timePeriod} onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}>
 *         <option value="daily">Daily</option>
 *         <option value="weekly">Weekly</option>
 *         <option value="monthly">Monthly</option>
 *       </select>
 *     </div>
 *   );
 * }
 */
export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      // Initialize with default values
      timePeriod: defaultTimePeriod,
      startDate: defaultDateRange.start,
      endDate: defaultDateRange.end,
      selectedClinics: [],
      selectedProviders: [],

      // Actions
      setTimePeriod: (period) => {
        const { start, end } = getDateRangeForPeriod(period);
        set({
          timePeriod: period,
          startDate: start,
          endDate: end,
        });
      },

      setDateRange: (startDate, endDate) =>
        set({
          timePeriod: "custom",
          startDate,
          endDate,
        }),

      setSelectedClinics: (clinics) => set({ selectedClinics: clinics }),

      setSelectedProviders: (providers) => set({ selectedProviders: providers }),

      clearFilters: () =>
        set({
          timePeriod: defaultTimePeriod,
          startDate: defaultDateRange.start,
          endDate: defaultDateRange.end,
          selectedClinics: [],
          selectedProviders: [],
        }),

      resetToDefaults: () =>
        set({
          timePeriod: defaultTimePeriod,
          startDate: defaultDateRange.start,
          endDate: defaultDateRange.end,
          selectedClinics: [],
          selectedProviders: [],
        }),
    }),
    {
      name: "dental-dashboard-filters", // localStorage key
    }
  )
);

/**
 * Helper hook that extracts formatted filter parameters for use with React Query
 *
 * @returns {Object} Formatted filter parameters ready to use in API requests
 * @returns {string} .startDate - ISO string format of the start date
 * @returns {string} .endDate - ISO string format of the end date
 * @returns {string|undefined} .clinicIds - Comma-separated list of clinic IDs or undefined if none selected
 * @returns {string|undefined} .providerIds - Comma-separated list of provider IDs or undefined if none selected
 * @returns {TimePeriod} .timePeriod - The current time period selection
 *
 * @example
 * // In a data fetching component:
 * import { useFilterParams } from '@/hooks/useFilterStore';
 * import { useQuery } from '@tanstack/react-query';
 *
 * function DashboardData() {
 *   const params = useFilterParams();
 *
 *   const { data } = useQuery(['dashboard', params], () =>
 *     fetchDashboardData(params)
 *   );
 *
 *   return <div>{data && <DashboardView data={data} />}</div>;
 * }
 */
export const useFilterParams = () => {
  const { startDate, endDate, selectedClinics, selectedProviders, timePeriod } = useFilterStore();

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    clinicIds: selectedClinics.length > 0 ? selectedClinics.join(",") : undefined,
    providerIds: selectedProviders.length > 0 ? selectedProviders.join(",") : undefined,
    timePeriod,
  };
};

/**
 * Creates URL search parameters from the current filter state
 *
 * This is useful for creating shareable URLs that preserve filter settings
 * or for initializing filter state from URL parameters.
 *
 * @returns {URLSearchParams} URL search parameters representing the current filter state
 */
export const createFilterUrlParams = () => {
  const { timePeriod, startDate, endDate, selectedClinics, selectedProviders } =
    useFilterStore.getState();
  const params = new URLSearchParams();

  // Add time period params
  params.set("timePeriod", timePeriod);
  params.set("startDate", startDate.toISOString());
  params.set("endDate", endDate.toISOString());

  // Add clinic params
  if (selectedClinics.length > 0) {
    params.set("clinics", selectedClinics.join(","));
  }

  // Add provider params
  if (selectedProviders.length > 0) {
    params.set("providers", selectedProviders.join(","));
  }

  return params;
};

/**
 * Parses URL search parameters and updates the filter store accordingly
 *
 * This enables filter state to be initialized from URL parameters, allowing
 * for bookmarkable and shareable dashboard states.
 *
 * @param {URLSearchParams} searchParams - URL search parameters to parse
 *
 * @example
 * // In a page component:
 * import { parseFilterUrlParams } from '@/hooks/useFilterStore';
 * import { useSearchParams } from 'next/navigation';
 *
 * function DashboardPage() {
 *   const searchParams = useSearchParams();
 *
 *   useEffect(() => {
 *     // Initialize filters from URL when page loads
 *     parseFilterUrlParams(searchParams);
 *   }, [searchParams]);
 *
 *   return <Dashboard />;
 * }
 */
export const parseFilterUrlParams = (searchParams: URLSearchParams) => {
  const { setTimePeriod, setDateRange, setSelectedClinics, setSelectedProviders } =
    useFilterStore.getState();

  // Parse time period
  const urlTimePeriod = searchParams.get("timePeriod");
  if (
    urlTimePeriod &&
    ["daily", "weekly", "monthly", "quarterly", "annual", "custom"].includes(urlTimePeriod)
  ) {
    setTimePeriod(urlTimePeriod as TimePeriod);
  }

  // Parse date range
  const urlStartDate = searchParams.get("startDate");
  const urlEndDate = searchParams.get("endDate");
  if (urlStartDate && urlEndDate) {
    try {
      const startDate = new Date(urlStartDate);
      const endDate = new Date(urlEndDate);

      // Validate dates
      if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
        setDateRange(startDate, endDate);
      }
    } catch (error) {
      console.error("Error parsing date params:", error);
    }
  }

  // Parse clinics
  const urlClinics = searchParams.get("clinics");
  if (urlClinics) {
    setSelectedClinics(urlClinics.split(","));
  }

  // Parse providers
  const urlProviders = searchParams.get("providers");
  if (urlProviders) {
    setSelectedProviders(urlProviders.split(","));
  }
};
