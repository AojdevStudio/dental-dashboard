import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { useClinics } from "./use-clinics";

/**
 * Goal type
 */
interface Goal {
  id: string;
  name: string;
  metricId: string;
  targetValue: number;
  targetDate: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  clinicId: string;
  providerId?: string;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

/**
 * Goal progress type
 */
interface GoalProgress {
  goalId: string;
  currentValue: number;
  targetValue: number;
  percentageComplete: number;
  daysRemaining: number;
  trend: "up" | "down" | "stable";
}

/**
 * Custom hook for managing goals data with React Query caching
 *
 * This hook provides:
 * - Automatic caching of goal data
 * - Goal CRUD operations
 * - Progress tracking
 * - Optimistic updates
 *
 * @example
 * const { goals, goalProgress, isLoading, createGoal } = useGoals();
 */
export function useGoals() {
  const { user } = useAuth();
  const { selectedClinicId } = useClinics();
  const queryClient = useQueryClient();

  // Query keys
  const goalsQueryKey = ["goals", selectedClinicId];
  const progressQueryKey = ["goals", "progress", selectedClinicId];

  /**
   * Fetch goals from the API
   */
  const fetchGoals = async (): Promise<Goal[]> => {
    const params = new URLSearchParams();

    if (selectedClinicId) params.append("clinicId", selectedClinicId);

    const response = await fetch(`/api/goals?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to fetch goals");
    }

    const data = await response.json();
    return data.goals || [];
  };

  /**
   * Fetch goal progress from the API
   */
  const fetchGoalProgress = async (): Promise<GoalProgress[]> => {
    const params = new URLSearchParams();

    if (selectedClinicId) params.append("clinicId", selectedClinicId);

    const response = await fetch(`/api/goals/progress?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Failed to fetch goal progress");
    }

    const data = await response.json();
    return data.progress || [];
  };

  /**
   * Query for fetching goals
   */
  const goalsQuery = useQuery({
    queryKey: goalsQueryKey,
    queryFn: fetchGoals,
    enabled: !!user && !!selectedClinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });

  /**
   * Query for fetching goal progress
   */
  const progressQuery = useQuery({
    queryKey: progressQueryKey,
    queryFn: fetchGoalProgress,
    enabled: !!user && !!selectedClinicId,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates)
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  /**
   * Create a new goal
   */
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: Omit<Goal, "id" | "createdAt" | "updatedAt" | "status">) => {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...goalData,
          clinicId: goalData.clinicId || selectedClinicId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create goal");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate both goals and progress
      queryClient.invalidateQueries({ queryKey: goalsQueryKey });
      queryClient.invalidateQueries({ queryKey: progressQueryKey });
    },
  });

  /**
   * Update a goal
   */
  const updateGoalMutation = useMutation({
    mutationFn: async ({ goalId, data }: { goalId: string; data: Partial<Goal> }) => {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update goal");
      }

      return response.json();
    },
    onMutate: async ({ goalId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: goalsQueryKey });

      // Snapshot previous value
      const previousGoals = queryClient.getQueryData<Goal[]>(goalsQueryKey);

      // Optimistically update
      if (previousGoals) {
        queryClient.setQueryData<Goal[]>(
          goalsQueryKey,
          (old) => old?.map((goal) => (goal.id === goalId ? { ...goal, ...data } : goal)) || []
        );
      }

      return { previousGoals };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        queryClient.setQueryData(goalsQueryKey, context.previousGoals);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: goalsQueryKey });
      queryClient.invalidateQueries({ queryKey: progressQueryKey });
    },
  });

  /**
   * Delete a goal
   */
  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete goal");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: goalsQueryKey });
      queryClient.invalidateQueries({ queryKey: progressQueryKey });
    },
  });

  /**
   * Get a single goal by ID
   */
  const getGoalById = (goalId: string) => {
    return goalsQuery.data?.find((goal) => goal.id === goalId);
  };

  /**
   * Get progress for a specific goal
   */
  const getGoalProgress = (goalId: string) => {
    return progressQuery.data?.find((progress) => progress.goalId === goalId);
  };

  return {
    // Goals data
    goals: goalsQuery.data || [],
    isLoadingGoals: goalsQuery.isLoading,
    goalsError: goalsQuery.error,
    refetchGoals: goalsQuery.refetch,

    // Progress data
    goalProgress: progressQuery.data || [],
    isLoadingProgress: progressQuery.isLoading,
    progressError: progressQuery.error,
    refetchProgress: progressQuery.refetch,

    // Combined loading state
    isLoading: goalsQuery.isLoading || progressQuery.isLoading,

    // CRUD operations
    createGoal: createGoalMutation.mutate,
    isCreatingGoal: createGoalMutation.isPending,
    updateGoal: updateGoalMutation.mutate,
    isUpdatingGoal: updateGoalMutation.isPending,
    deleteGoal: deleteGoalMutation.mutate,
    isDeletingGoal: deleteGoalMutation.isPending,

    // Utilities
    getGoalById,
    getGoalProgress,
  };
}
