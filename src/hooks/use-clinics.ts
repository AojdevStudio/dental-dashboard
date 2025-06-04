import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

/**
 * Clinic data type
 */
interface Clinic {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Custom hook for managing clinic data with React Query caching
 *
 * This hook provides:
 * - Automatic caching of clinic data
 * - Background refetching when data becomes stale
 * - Optimistic updates for better UX
 * - Type-safe clinic operations
 *
 * @example
 * const { clinics, isLoading, selectedClinic, switchClinic } = useClinics();
 */
export function useClinics() {
  const { user, isSystemAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Query key for clinics data
  const clinicsQueryKey = ["clinics", user?.id];

  /**
   * Fetch clinics from the API
   */
  const fetchClinics = async (): Promise<Clinic[]> => {
    const response = await fetch("/api/clinics");

    if (!response.ok) {
      throw new Error("Failed to fetch clinics");
    }

    const data = await response.json();
    return data.clinics || [];
  };

  /**
   * Query for fetching clinics with caching
   */
  const {
    data: clinics = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: clinicsQueryKey,
    queryFn: fetchClinics,
    enabled: !!user, // Only fetch if user is authenticated
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime in v4)
  });

  /**
   * Get the currently selected clinic from session storage
   */
  const getSelectedClinicId = (): string | null => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("selectedClinicId");
  };

  /**
   * Get the selected clinic object
   */
  const selectedClinic = clinics.find((clinic) => clinic.id === getSelectedClinicId()) || null;

  /**
   * Switch to a different clinic
   */
  const switchClinicMutation = useMutation({
    mutationFn: async (clinicId: string) => {
      const response = await fetch("/api/clinics/switch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clinicId }),
      });

      if (!response.ok) {
        throw new Error("Failed to switch clinic");
      }

      return response.json();
    },
    onSuccess: (data, clinicId) => {
      // Update session storage
      sessionStorage.setItem("selectedClinicId", clinicId);

      // Invalidate queries that depend on clinic selection
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  /**
   * Create a new clinic (system admin only)
   */
  const createClinicMutation = useMutation({
    mutationFn: async (clinic: Omit<Clinic, "id" | "createdAt" | "updatedAt">) => {
      const response = await fetch("/api/clinics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clinic),
      });

      if (!response.ok) {
        throw new Error("Failed to create clinic");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch clinics
      queryClient.invalidateQueries({ queryKey: clinicsQueryKey });
    },
  });

  return {
    clinics,
    isLoading,
    error,
    selectedClinic,
    selectedClinicId: getSelectedClinicId(),
    refetch,
    switchClinic: (clinicId: string) => switchClinicMutation.mutate(clinicId),
    isSwitchingClinic: switchClinicMutation.isPending,
    createClinic: isSystemAdmin ? createClinicMutation.mutate : undefined,
    isCreatingClinic: createClinicMutation.isPending,
  };
}
