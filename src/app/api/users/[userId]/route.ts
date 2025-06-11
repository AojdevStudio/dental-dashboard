/**
 * Individual User API Route
 * Operations on specific users
 */

import { withAuth } from '@/lib/api/middleware';
import {
  ApiError as ApiErrorClass,
  type ApiErrorPayload,
  type ApiSuccessPayload,
  apiError,
  apiSuccess,
} from '@/lib/api/utils';
import * as userQueries from '@/lib/database/queries/users';
import type { NextResponse } from 'next/server';
import { z } from 'zod';

const updateUserSchema = z
  .object({
    name: z.string().min(2).optional(),
    role: z.string().optional(),
    lastLogin: z.string().datetime().optional(),
  })
  .strict();

export type GetUserResponse = Awaited<ReturnType<typeof userQueries.getUserById>>;
export type UpdateUserResponse = Awaited<ReturnType<typeof userQueries.updateUser>>;

/**
 * GET /api/users/:userId
 * Get a specific user
 */
export const GET = withAuth<GetUserResponse>(
  async (
    _request: Request,
    { authContext, params }
  ): Promise<NextResponse<ApiSuccessPayload<GetUserResponse> | ApiErrorPayload>> => {
    const rawId = params?.userId;
    const userId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!userId) {
      return apiError('User ID required', 400);
    }

    try {
      const user = await userQueries.getUserById(authContext, userId);
      if (!user) {
        return apiError('User not found', 404);
      }
      return apiSuccess(user);
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return apiError(error.message, error.statusCode, error.code);
      }
      if (error instanceof Error && error.message.includes('Access denied')) {
        return apiError(error.message, 403);
      }
      throw error;
    }
  }
);

/**
 * PATCH /api/users/:userId
 * Update a user (self or clinic admin)
 */
export const PATCH = withAuth<UpdateUserResponse>(
  async (
    request: Request,
    { authContext, params }
  ): Promise<NextResponse<ApiSuccessPayload<UpdateUserResponse> | ApiErrorPayload>> => {
    const rawId = params?.userId;
    const userId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!userId) {
      return apiError('User ID required', 400);
    }

    // Parse and validate request body
    let body: z.infer<typeof updateUserSchema>;
    try {
      const rawBody = await request.json();
      body = updateUserSchema.parse(rawBody);
    } catch (_error) {
      return apiError('Invalid request body', 400);
    }

    // Convert lastLogin string to Date if provided
    const updateData = {
      ...body,
      lastLogin: body.lastLogin ? new Date(body.lastLogin) : undefined,
    };

    try {
      const user = await userQueries.updateUser(authContext, userId, updateData);
      return apiSuccess(user);
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return apiError(error.message, error.statusCode, error.code);
      }
      if (error instanceof Error) {
        if (error.message === 'User not found') return apiError('User not found', 404);
        if (error.message === 'Permission denied') return apiError('Permission denied', 403);
      }
      throw error;
    }
  }
);

/**
 * DELETE /api/users/:userId
 * Delete/deactivate a user (clinic admin only)
 */
export const DELETE = withAuth<{ success: boolean }>(
  async (
    _request: Request,
    { authContext, params }
  ): Promise<NextResponse<ApiSuccessPayload<{ success: boolean }> | ApiErrorPayload>> => {
    const rawId = params?.userId;
    const userId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!userId) {
      return apiError('User ID required', 400);
    }

    try {
      await userQueries.deleteUser(authContext, userId);
      return apiSuccess({ success: true });
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return apiError(error.message, error.statusCode, error.code);
      }
      if (error instanceof Error) {
        if (error.message === 'User not found') return apiError('User not found', 404);
        if (error.message.includes('Only clinic admins')) return apiError(error.message, 403);
      }
      throw error;
    }
  }
);
