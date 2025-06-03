import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { useClinics } from "./use-clinics";

/**
 * User type
 */
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  clinicId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Custom hook for managing users data with React Query caching
 * 
 * This hook provides:
 * - Automatic caching of user data
 * - User CRUD operations
 * - Role-based access control
 * - Optimistic updates
 * 
 * @example
 * const { users, isLoading, createUser, updateUser } = useUsers();
 */
export function useUsers() {
  const { user: currentUser, isSystemAdmin } = useAuth();
  const { selectedClinicId } = useClinics();
  const queryClient = useQueryClient();

  // Query key for users data
  const usersQueryKey = ["users", selectedClinicId];

  /**
   * Fetch users from the API
   */
  const fetchUsers = async (): Promise<User[]> => {
    const params = new URLSearchParams();
    
    // System admins can see all users, others only see their clinic
    if (!isSystemAdmin && selectedClinicId) {
      params.append("clinicId", selectedClinicId);
    }

    const response = await fetch(`/api/users?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();
    return data.users || [];
  };

  /**
   * Query for fetching users with caching
   */
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: usersQueryKey,
    queryFn: fetchUsers,
    enabled: !!currentUser && (isSystemAdmin || !!selectedClinicId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  /**
   * Create a new user
   */
  const createUserMutation = useMutation({
    mutationFn: async (userData: Omit<User, "id" | "createdAt" | "updatedAt">) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });

  /**
   * Update an existing user
   */
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<User> }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user");
      }

      return response.json();
    },
    onMutate: async ({ userId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: usersQueryKey });

      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData<User[]>(usersQueryKey);

      // Optimistically update the user
      if (previousUsers) {
        queryClient.setQueryData<User[]>(usersQueryKey, old => 
          old?.map(user => 
            user.id === userId ? { ...user, ...data } : user
          ) || []
        );
      }

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUsers) {
        queryClient.setQueryData(usersQueryKey, context.previousUsers);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });

  /**
   * Delete a user
   */
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete user");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
  });

  return {
    users,
    isLoading,
    error,
    refetch,
    createUser: createUserMutation.mutate,
    isCreatingUser: createUserMutation.isPending,
    updateUser: updateUserMutation.mutate,
    isUpdatingUser: updateUserMutation.isPending,
    deleteUser: deleteUserMutation.mutate,
    isDeletingUser: deleteUserMutation.isPending,
  };
}