import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from 'date-fns';
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
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Available time period options for filtering dashboard data
 *
 * @typedef {'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom'} TimePeriod
 */
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';

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
    case 'daily':
      return {
        start: startOfDay(today),
        end: endOfDay(today),
      };
    case 'weekly':
      return {
        start: startOfWeek(today, { weekStartsOn: 1 }), // Week starts on Monday
        end: endOfWeek(today, { weekStartsOn: 1 }),
      };
    case 'monthly':
      return {
        start: startOfMonth(today),
        end: endOfMonth(today),
      };
    case 'quarterly':
      return {
        start: startOfQuarter(today),
        end: endOfQuarter(today),
      };
    case 'annual':
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
const defaultTimePeriod: TimePeriod = 'monthly';

/** Default date range calculated based on the default time period */
const defaultDateRange = getDateRangeForPeriod(defaultTimePeriod);

/**
 * Zustand store for managing dashboard filter state
 *
 * This store holds the current filter selections and provides actions to update them.
 * It uses `persist` middleware to save the state to localStorage, so filter
 * preferences are remembered between sessions.
 *
 * @property {TimePeriod} timePeriod - Current time period (e.g., 'monthly')
 * @property {Date} startDate - Start of the date range
 * @property {Date} endDate - End of the date range
 * @property {string[]} selectedClinics - Array of selected clinic IDs
 * @property {string[]} selectedProviders - Array of selected provider IDs
 * @function setTimePeriod - Sets the time period and updates date range
 * @function setDateRange - Sets a custom date range
 * @function setSelectedClinics - Updates selected clinics
 * @function setSelectedProviders - Updates selected providers
 * @function clearFilters - Resets all filters to defaults
 * @function resetToDefaults - Alias for clearFilters
 *
 * @example
 * // Usage in a component:
 * import { useFilterStore } from '@/hooks/use-filters';
 *
 * function FilterComponent() {
 *   const { timePeriod, setTimePeriod } = useFilterStore();
 *   const handleTimePeriodChange = (event) => setTimePeriod(event.target.value);
 *   // Render select dropdown with options for daily, weekly, monthly, etc.
 *   // Include other filter controls for date range, clinics, providers
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
        set({ timePeriod: period, startDate: start, endDate: end });
      },

      setDateRange: (startDate, endDate) => set({ timePeriod: 'custom', startDate, endDate }),

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
      name: 'dental-dashboard-filters', // localStorage key
    }
  )
);

/**
 * Helper hook that extracts formatted filter parameters for use with React Query
 *
 * This hook selects the necessary filter state from the `useFilterStore` and
 * formats it into an object suitable for passing as query parameters to API requests.
 * Dates are converted to ISO string format. Clinic and provider IDs are joined into
 * comma-separated strings if selected, otherwise they are undefined.
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
 * import { useFilterParams } from '@/hooks/use-filters'; // MODIFIED
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
    clinicIds: selectedClinics.length > 0 ? selectedClinics.join(',') : undefined,
    providerIds: selectedProviders.length > 0 ? selectedProviders.join(',') : undefined,
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
  params.set('timePeriod', timePeriod);
  params.set('startDate', startDate.toISOString());
  params.set('endDate', endDate.toISOString());

  // Add clinic params
  if (selectedClinics.length > 0) {
    params.set('clinics', selectedClinics.join(','));
  }

  // Add provider params
  if (selectedProviders.length > 0) {
    params.set('providers', selectedProviders.join(','));
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
 * import { parseFilterUrlParams } from '@/hooks/use-filters'; // MODIFIED
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
  const urlTimePeriod = searchParams.get('timePeriod');
  if (
    urlTimePeriod &&
    ['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'custom'].includes(urlTimePeriod)
  ) {
    setTimePeriod(urlTimePeriod as TimePeriod);
  }

  // Parse date range
  const urlStartDate = searchParams.get('startDate');
  const urlEndDate = searchParams.get('endDate');
  if (urlStartDate && urlEndDate) {
    try {
      const startDate = new Date(urlStartDate);
      const endDate = new Date(urlEndDate);

      // Validate dates
      if (!(Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()))) {
        setDateRange(startDate, endDate);
      }
    } catch (_error) {}
  }

  // Parse clinics
  const urlClinics = searchParams.get('clinics');
  if (urlClinics) {
    setSelectedClinics(urlClinics.split(','));
  }

  // Parse providers
  const urlProviders = searchParams.get('providers');
  if (urlProviders) {
    setSelectedProviders(urlProviders.split(','));
  }
};
