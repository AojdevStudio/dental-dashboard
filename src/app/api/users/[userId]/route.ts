/**
 * Individual User API Route
 * Operations on specific users
 */

import { NextRequest } from "next/server";
import { withAuth } from "@/lib/api/middleware";
import { ApiResponse, ApiError } from "@/lib/api/utils";
import * as userQueries from "@/lib/database/queries/users";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.string().optional(),
  lastLogin: z.string().datetime().optional(),
});

export type GetUserResponse = Awaited<ReturnType<typeof userQueries.getUserById>>;
export type UpdateUserResponse = Awaited<ReturnType<typeof userQueries.updateUser>>;

/**
 * GET /api/users/:userId
 * Get a specific user
 */
export const GET = withAuth(async (request, { authContext, params }) => {
  const userId = params?.userId;
  if (!userId) {
    return ApiError.badRequest("User ID required");
  }

  try {
    const user = await userQueries.getUserById(authContext, userId);
    if (!user) {
      return ApiError.notFound("User");
    }
    return ApiResponse.success(user);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return ApiError.forbidden(error.message);
    }
    throw error;
  }
});

/**
 * PATCH /api/users/:userId
 * Update a user (self or clinic admin)
 */
export const PATCH = withAuth(async (request, { authContext, params }) => {
  const userId = params?.userId;
  if (!userId) {
    return ApiError.badRequest("User ID required");
  }

  // Parse and validate request body
  let body: z.infer<typeof updateUserSchema>;
  try {
    const rawBody = await request.json();
    body = updateUserSchema.parse(rawBody);
  } catch (error) {
    return ApiError.badRequest("Invalid request body");
  }

  // Convert lastLogin string to Date if provided
  const updateData = {
    ...body,
    lastLogin: body.lastLogin ? new Date(body.lastLogin) : undefined,
  };

  try {
    const user = await userQueries.updateUser(authContext, userId, updateData);
    return ApiResponse.success(user);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "User not found") {
        return ApiError.notFound("User");
      }
      if (error.message === "Permission denied") {
        return ApiError.forbidden();
      }
    }
    throw error;
  }
});

/**
 * DELETE /api/users/:userId
 * Delete/deactivate a user (clinic admin only)
 */
export const DELETE = withAuth(async (request, { authContext, params }) => {
  const userId = params?.userId;
  if (!userId) {
    return ApiError.badRequest("User ID required");
  }

  try {
    const result = await userQueries.deleteUser(authContext, userId);
    return ApiResponse.success(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "User not found") {
        return ApiError.notFound("User");
      }
      if (error.message.includes("Only clinic admins")) {
        return ApiError.forbidden(error.message);
      }
    }
    throw error;
  }
});
