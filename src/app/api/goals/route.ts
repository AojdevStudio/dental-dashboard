/**
 * Goals API Route
 * Multi-tenant aware goal management endpoints
 */

import type { NextRequest } from 'next/server';
import { withAuth } from '../../../lib/api/middleware';
import { apiError, apiPaginated, apiSuccess, getPaginationParams } from '../../../lib/api/utils';
import * as goalQueries from '../../../lib/database/queries/goals';
import {
  GoalCreationError,
  GoalCreationStrategyFactory,
} from '../../../lib/services/goals/goal-creation-strategies';

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
  try {
    const rawBody = await request.json();

    // Create and execute appropriate strategy
    const strategy = GoalCreationStrategyFactory.createStrategy(rawBody);

    // Validate the request data
    const validationResult = strategy.validate(rawBody);
    if (!validationResult.isValid) {
      return apiError(
        `Validation failed: ${validationResult.errors.map((e) => e.message).join(', ')}`,
        400
      );
    }

    // Create the goal
    const goal = await strategy.create(rawBody, authContext);
    return apiSuccess(goal, 201);
  } catch (error) {
    if (error instanceof GoalCreationError) {
      return apiError(error.message, error.statusCode);
    }

    if (error instanceof Error) {
      return apiError('Failed to create goal', 500);
    }

    throw error;
  }
});
