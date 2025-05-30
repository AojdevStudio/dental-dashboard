import { NextRequest } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api/middleware";
import { ApiError, ApiResponse } from "@/lib/api/utils";
import * as goalQueries from "@/lib/database/queries/goals";

// Schema for goal update
const updateGoalSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  targetValue: z.number().positive().optional(),
  currentValue: z.number().min(0).optional(),
  targetDate: z.string().datetime().optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "yearly"]).optional(),
  category: z.string().optional(),
  status: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
  metricId: z.string().uuid().optional(),
});

export const GET = withAuth(async (request, { params, authContext }) => {
  const { goalId } = await params;

  const goal = await goalQueries.getGoalById(authContext, goalId);

  if (!goal) {
    throw new ApiError("Goal not found", 404);
  }

  return ApiResponse.success(goal);
});

export const PUT = withAuth(
  async (request, { params, authContext }) => {
    const { goalId } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateGoalSchema.parse(body);

    // Check if goal exists
    const existingGoal = await goalQueries.getGoalById(authContext, goalId);
    if (!existingGoal) {
      throw new ApiError("Goal not found", 404);
    }

    // Check permissions - only clinic_admin and admin can update goals
    const userRole = authContext.role;
    if (!userRole || !["admin", "clinic_admin"].includes(userRole)) {
      throw new ApiError("Insufficient permissions", 403);
    }

    // Update goal
    const updatedGoal = await goalQueries.updateGoal(authContext, goalId, validatedData);

    return ApiResponse.success(updatedGoal);
  },
  {
    requireClinicAdmin: true,
  }
);

export const DELETE = withAuth(
  async (request, { params, authContext }) => {
    const { goalId } = await params;

    // Check if goal exists
    const existingGoal = await goalQueries.getGoalById(authContext, goalId);
    if (!existingGoal) {
      throw new ApiError("Goal not found", 404);
    }

    // Soft delete by setting status to cancelled
    await goalQueries.updateGoal(authContext, goalId, { status: "cancelled" });

    return ApiResponse.success({ success: true });
  },
  {
    requireClinicAdmin: true,
  }
);

// Export types for client-side usage
export type GoalResponse = Awaited<ReturnType<typeof goalQueries.getGoalById>>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
