import { withAuth } from "@/lib/api/middleware";
import { apiSuccess, apiError, type ApiResponse, ApiError as ApiErrorClass } from "@/lib/api/utils";
import * as goalQueries from "@/lib/database/queries/goals";

import { z } from "zod";
import {
  updateGoalSchema,
  type UpdateGoalData,
  type UpdateGoalQueryInput,
} from "@/lib/types/goals";

export const GET = withAuth<GoalResponse>(async (request: Request, { params, authContext }) => {
  const goalId = params?.goalId as string;
  if (!goalId) return apiError("Goal ID is required", 400);

  const goal = await goalQueries.getGoalById(authContext, goalId);

  if (!goal) {
    return apiError("Goal not found", 404);
  }

  return apiSuccess(goal);
});

export const PUT = withAuth<GoalResponse>(
  async (request: Request, { params, authContext }) => {
    const goalId = params?.goalId as string;
    if (!goalId) return apiError("Goal ID is required", 400);

    // Parse and validate request body
    const body = await request.json();
    const validatedData: UpdateGoalData = updateGoalSchema.parse(body);

    // Check if goal exists
    const existingGoal = await goalQueries.getGoalById(authContext, goalId);
    if (!existingGoal) {
      return apiError("Goal not found", 404);
    }

    // Check permissions - only clinic_admin and admin can update goals
    const userRole = authContext.role;
    if (!userRole || !["admin", "clinic_admin"].includes(userRole)) {
      return apiError("Insufficient permissions", 403);
    }

    // Prepare data for the query layer, aligning with its UpdateGoalInput type
    const updateDataForQuery: UpdateGoalQueryInput = {};
    if (validatedData.name !== undefined) updateDataForQuery.name = validatedData.name;
    if (validatedData.description !== undefined)
      updateDataForQuery.description = validatedData.description;
    if (validatedData.targetValue !== undefined)
      updateDataForQuery.targetValue = String(validatedData.targetValue);
    if (validatedData.currentValue !== undefined)
      updateDataForQuery.currentValue = String(validatedData.currentValue);
    if (validatedData.targetDate !== undefined)
      updateDataForQuery.endDate = validatedData.targetDate; // Zod's targetDate maps to Prisma's endDate
    if (validatedData.frequency !== undefined)
      updateDataForQuery.timePeriod = validatedData.frequency;
    if (validatedData.category !== undefined) updateDataForQuery.category = validatedData.category;
    if (validatedData.status !== undefined) updateDataForQuery.status = validatedData.status;
    if (validatedData.metricId !== undefined)
      updateDataForQuery.metricDefinitionId = validatedData.metricId;

    // Update goal
    const updatedGoal = await goalQueries.updateGoal(authContext, goalId, updateDataForQuery);

    return apiSuccess(updatedGoal);
  },
  {
    requireClinicAdmin: true,
  }
);

export const DELETE = withAuth<{ success: true }>(
  async (request: Request, { params, authContext }) => {
    const goalId = params?.goalId as string;
    if (!goalId) return apiError("Goal ID is required", 400);

    // Check if goal exists
    const existingGoal = await goalQueries.getGoalById(authContext, goalId);
    if (!existingGoal) {
      return apiError("Goal not found", 404);
    }

    // Soft delete by setting status to cancelled
    await goalQueries.updateGoal(authContext, goalId, {
      status: "cancelled",
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
