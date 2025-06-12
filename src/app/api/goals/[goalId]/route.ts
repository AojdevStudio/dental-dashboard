import { withAuth } from '@/lib/api/middleware';
import { apiError, apiSuccess } from '@/lib/api/utils';
import * as goalQueries from '@/lib/database/queries/goals';

import {
  type UpdateGoalData,
  type UpdateGoalQueryInput,
  mapUpdateGoalData,
  updateGoalSchema,
} from '@/lib/types/goals';

export const GET = withAuth<GoalResponse>(async (_request: Request, { params, authContext }) => {
  const resolvedParams = await params;
  const goalId = resolvedParams?.goalId as string;
  if (!goalId) {
    return apiError('Goal ID is required', 400);
  }

  const goal = await goalQueries.getGoalById(authContext, goalId);

  if (!goal) {
    return apiError('Goal not found', 404);
  }

  return apiSuccess(goal);
});

export const PUT = withAuth<GoalResponse>(
  async (request: Request, { params, authContext }) => {
    const resolvedParams = await params;
    const goalId = resolvedParams?.goalId as string;
    if (!goalId) {
      return apiError('Goal ID is required', 400);
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData: UpdateGoalData = updateGoalSchema.parse(body);

    // Check if goal exists
    const existingGoal = await goalQueries.getGoalById(authContext, goalId);
    if (!existingGoal) {
      return apiError('Goal not found', 404);
    }

    // Check permissions - only clinic_admin and admin can update goals
    const userRole = authContext.role;
    if (!(userRole && ['admin', 'clinic_admin'].includes(userRole))) {
      return apiError('Insufficient permissions', 403);
    }

    // Transform API data to database query input format
    const updateDataForQuery = mapUpdateGoalData(validatedData);

    // Update goal
    const updatedGoal = await goalQueries.updateGoal(authContext, goalId, updateDataForQuery);

    return apiSuccess(updatedGoal);
  },
  {
    requireClinicAdmin: true,
  }
);

export const DELETE = withAuth<{ success: true }>(
  async (_request: Request, { params, authContext }) => {
    const resolvedParams = await params;
    const goalId = resolvedParams?.goalId as string;
    if (!goalId) {
      return apiError('Goal ID is required', 400);
    }

    // Check if goal exists
    const existingGoal = await goalQueries.getGoalById(authContext, goalId);
    if (!existingGoal) {
      return apiError('Goal not found', 404);
    }

    // Soft delete by setting status to cancelled
    await goalQueries.updateGoal(authContext, goalId, {
      status: 'cancelled',
    } as UpdateGoalQueryInput);

    return apiSuccess({ success: true });
  },
  {
    requireClinicAdmin: true,
  }
);

// Export types for client-side usage
export type GoalResponse = Awaited<ReturnType<typeof goalQueries.getGoalById>>;
// UpdateGoalData (from Zod schema) and UpdateGoalQueryInput (for query layer) are now imported from @/lib/types/goals.ts
