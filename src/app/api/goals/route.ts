/**
 * Goals API Route
 * Multi-tenant aware goal management endpoints
 */

import { withAuth } from "@/lib/api/middleware";
import { ApiResponse, ApiError, getPaginationParams } from "@/lib/api/utils";
import * as goalQueries from "@/lib/database/queries/goals";
import { z } from "zod";

// Request schemas
const createGoalSchema = z.object({
  metricDefinitionId: z.string().cuid(),
  timePeriod: z.enum(["daily", "weekly", "monthly", "quarterly", "annual"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  targetValue: z.string(),
  clinicId: z.string().cuid(),
  providerId: z.string().cuid().optional(),
});

const createFromTemplateSchema = z.object({
  templateId: z.string().cuid(),
  clinicId: z.string().cuid(),
  providerId: z.string().cuid().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  targetValue: z.string().optional(),
});

export type GetGoalsResponse = Awaited<ReturnType<typeof goalQueries.getGoals>>;
export type CreateGoalResponse = Awaited<ReturnType<typeof goalQueries.createGoal>>;

/**
 * GET /api/goals
 * Get goals with filtering and optional progress
 */
export const GET = withAuth(async (request, { authContext }) => {
  const searchParams = request.nextUrl.searchParams;
  const clinicId = searchParams.get("clinicId") || undefined;
  const providerId = searchParams.get("providerId") || undefined;
  const metricDefinitionId = searchParams.get("metricDefinitionId") || undefined;
  const active = searchParams.get("active");
  const timePeriod = searchParams.get("timePeriod") || undefined;
  const includeProgress = searchParams.get("includeProgress") === "true";
  const { limit, offset } = getPaginationParams(request);

  const result = await goalQueries.getGoals(
    authContext,
    {
      clinicId,
      providerId,
      metricDefinitionId,
      active: active === null ? undefined : active === "true",
      timePeriod,
    },
    {
      limit,
      offset,
      includeProgress,
    }
  );

  return ApiResponse.paginated(result.goals, result.total, Math.floor(offset / limit) + 1, limit);
});

/**
 * POST /api/goals
 * Create a new goal
 */
export const POST = withAuth(async (request, { authContext }) => {
  const rawBody = await request.json();

  // Check if creating from template
  if (rawBody.templateId) {
    let body: z.infer<typeof createFromTemplateSchema>;
    try {
      body = createFromTemplateSchema.parse(rawBody);
    } catch (error) {
      return ApiError.badRequest("Invalid request body");
    }

    try {
      const goal = await goalQueries.createGoalFromTemplate(authContext, body.templateId, {
        clinicId: body.clinicId,
        providerId: body.providerId,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        targetValue: body.targetValue,
      });
      return ApiResponse.created(goal);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Access denied")) {
          return ApiError.forbidden(error.message);
        }
        if (error.message.includes("not found")) {
          return ApiError.notFound(error.message);
        }
      }
      throw error;
    }
  } else {
    // Regular goal creation
    let body: z.infer<typeof createGoalSchema>;
    try {
      body = createGoalSchema.parse(rawBody);
    } catch (error) {
      return ApiError.badRequest("Invalid request body");
    }

    const goalData = {
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    };

    try {
      const goal = await goalQueries.createGoal(authContext, goalData);
      return ApiResponse.created(goal);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Access denied")) {
          return ApiError.forbidden(error.message);
        }
        if (error.message.includes("Insufficient permissions")) {
          return ApiError.forbidden(error.message);
        }
        if (error.message.includes("Invalid")) {
          return ApiError.badRequest(error.message);
        }
      }
      throw error;
    }
  }
});
