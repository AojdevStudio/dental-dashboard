/**
 * Users API Route
 * Multi-tenant aware user management endpoints
 */

import { withAuth } from "@/lib/api/middleware";
import { ApiError, ApiResponse, getPaginationParams } from "@/lib/api/utils";
import * as userQueries from "@/lib/database/queries/users";
import { NextRequest } from "next/server";
import { z } from "zod";

// Request/Response types
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(["office_manager", "dentist", "front_desk", "admin"]),
  clinicId: z.string().cuid(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.string().optional(),
});

export type GetUsersResponse = Awaited<ReturnType<typeof userQueries.getUsers>>;
export type CreateUserResponse = Awaited<ReturnType<typeof userQueries.createUser>>;

/**
 * GET /api/users
 * Get users with multi-tenant filtering
 */
export const GET = withAuth(async (request, { authContext }) => {
  const searchParams = request.nextUrl.searchParams;
  const clinicId = searchParams.get("clinicId") || undefined;
  const role = searchParams.get("role") || undefined;
  const { limit, offset } = getPaginationParams(request);

  const result = await userQueries.getUsers(authContext, {
    clinicId,
    role,
    limit,
    offset,
  });

  return ApiResponse.paginated(result.users, result.total, Math.floor(offset / limit) + 1, limit);
});

/**
 * POST /api/users
 * Create a new user (clinic admin only)
 */
export const POST = withAuth(async (request, { authContext }) => {
  // Parse and validate request body
  let body: z.infer<typeof createUserSchema>;
  try {
    const rawBody = await request.json();
    body = createUserSchema.parse(rawBody);
  } catch (error) {
    return ApiError.badRequest("Invalid request body");
  }

  // Create user through query layer (includes permission checks)
  try {
    const user = await userQueries.createUser(authContext, body);
    return ApiResponse.created(user);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Access denied")) {
        return ApiError.forbidden(error.message);
      }
      if (error.message.includes("Only clinic admins")) {
        return ApiError.forbidden(error.message);
      }
    }
    throw error;
  }
});

/**
 * PATCH /api/users/:userId
 * Update a user (self or clinic admin)
 */
export const PATCH = withAuth(async (request, { authContext }) => {
  const userId = request.nextUrl.pathname.split("/").pop();
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

  // Update user through query layer
  try {
    const user = await userQueries.updateUser(authContext, userId, body);
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
export const DELETE = withAuth(async (request, { authContext }) => {
  const userId = request.nextUrl.pathname.split("/").pop();
  if (!userId) {
    return ApiError.badRequest("User ID required");
  }

  // Delete user through query layer
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
