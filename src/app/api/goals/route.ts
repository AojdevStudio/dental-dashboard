/**
 * Goals API Route
 * Multi-tenant aware goal management endpoints
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withAuth } from '../../../lib/api/middleware';
import { apiError, apiPaginated, apiSuccess, getPaginationParams } from '../../../lib/api/utils';
import * as goalQueries from '../../../lib/database/queries/goals';

// Request schemas
const createGoalSchema = z.object({
  metricDefinitionId: z.string().cuid(),
  timePeriod: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
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
  const searchParams = (request as NextRequest).nextUrl.searchParams;
  const clinicId = searchParams.get('clinicId') || undefined;
  const providerId = searchParams.get('providerId') || undefined;
  const metricDefinitionId = searchParams.get('metricDefinitionId') || undefined;
  const active = searchParams.get('active');
  const timePeriod = searchParams.get('timePeriod') || undefined;
  const includeProgress = searchParams.get('includeProgress') === 'true';
  const { limit, page, offset } = getPaginationParams(searchParams);

  const result = await goalQueries.getGoals(
    authContext,
    {
      clinicId,
      providerId,
      metricDefinitionId,
      active: active === null ? undefined : active === 'true',
      timePeriod,
    },
    {
      limit,
      offset,
      includeProgress,
    }
  );

  return apiPaginated(result.goals, result.total, page, limit);
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
    } catch (_error) {
      return apiError('Invalid request body', 400);
    }

    try {
      const goal = await goalQueries.createGoalFromTemplate(authContext, body.templateId, {
        clinicId: body.clinicId,
        providerId: body.providerId,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        targetValue: body.targetValue,
      });
      return apiSuccess(goal, 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Access denied')) {
          return apiError(error.message, 403);
        }
        if (error.message.includes('not found')) {
          return apiError(error.message, 404);
        }
      }
      throw error;
    }
  } else {
    // Regular goal creation
    let body: z.infer<typeof createGoalSchema>;
    try {
      body = createGoalSchema.parse(rawBody);
    } catch (_error) {
      return apiError('Invalid request body', 400);
    }

    const goalData: goalQueries.CreateGoalInput = {
      metricDefinitionId: body.metricDefinitionId,
      timePeriod: body.timePeriod,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      targetValue: body.targetValue,
      clinicId: body.clinicId,
      providerId: body.providerId,
    };

    try {
      const goal = await goalQueries.createGoal(authContext, goalData);
      return apiSuccess(goal, 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Access denied')) {
          return apiError(error.message, 403);
        }
        if (error.message.includes('Insufficient permissions')) {
          return apiError(error.message, 403);
        }
        if (error.message.includes('Invalid')) {
          return apiError(error.message, 400);
        }
      }
      throw error;
    }
  }
});
