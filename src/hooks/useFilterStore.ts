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
} from "date-fns";

// Define time period options
export type TimePeriod = "daily" | "weekly" | "monthly" | "quarterly" | "annual" | "custom";

// Define filter state interface
interface FilterState {
  // Time period filter
  timePeriod: TimePeriod;
  startDate: Date;
  endDate: Date;

  // Clinic filter
  selectedClinics: string[];

  // Provider filter
  selectedProviders: string[];

  // Filter actions
  setTimePeriod: (period: TimePeriod) => void;
  setDateRange: (startDate: Date, endDate: Date) => void;
  setSelectedClinics: (clinics: string[]) => void;
  setSelectedProviders: (providers: string[]) => void;
  clearFilters: () => void;
  resetToDefaults: () => void;
}

// Calculate date range based on time period
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

// Default state values
const defaultTimePeriod: TimePeriod = "monthly";
const defaultDateRange = getDateRangeForPeriod(defaultTimePeriod);

// Create and export the filter store
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

// Hook to get filter params for React Query
export const useFilterParams = () => {
  const { startDate, endDate, selectedClinics, selectedProviders } = useFilterStore();

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    clinicIds: selectedClinics.length > 0 ? selectedClinics.join(",") : undefined,
    providerIds: selectedProviders.length > 0 ? selectedProviders.join(",") : undefined,
  };
};
