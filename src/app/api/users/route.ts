/**
 * Users API Route
 * Multi-tenant aware user management endpoints
 */

import { withAuth } from "@/lib/api/middleware";
import {
  apiSuccess,
  apiError,
  apiPaginated,
  getPaginationParams,
  ApiError as ApiErrorClass,
} from "@/lib/api/utils";
import type { ApiSuccessPayload, ApiErrorPayload } from "@/lib/api/utils";
import * as userQueries from "@/lib/database/queries/users";
import type { Request, NextResponse } from "next/server";
import type { User } from "@prisma/client"; // Assuming User type is available
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
export const GET = withAuth<User[]>(
  async (
    request: Request,
    { authContext }
  ): Promise<NextResponse<ApiSuccessPayload<User[]> | ApiErrorPayload>> => {
    const searchParams = new URL(request.url).searchParams;
    const clinicId = searchParams.get("clinicId") || undefined;
    const role = searchParams.get("role") || undefined;
    const { limit, offset } = getPaginationParams(searchParams);

    const result = await userQueries.getUsers(authContext, {
      clinicId,
      role,
      limit,
      offset,
    });

    return apiPaginated(result.users, result.total, Math.floor(offset / limit) + 1, limit);
  }
);

/**
 * POST /api/users
 * Create a new user (clinic admin only)
 */
export const POST = withAuth<CreateUserResponse>(
  async (
    request: Request,
    { authContext }
  ): Promise<NextResponse<ApiSuccessPayload<CreateUserResponse> | ApiErrorPayload>> => {
    // Parse and validate request body
    let body: z.infer<typeof createUserSchema>;
    try {
      const rawBody = await request.json();
      body = createUserSchema.parse(rawBody);
    } catch (error) {
      return apiError("Invalid request body", 400);
    }

    // Create user through query layer (includes permission checks)
    try {
      const user = await userQueries.createUser(authContext, body);
      return apiSuccess(user, 201);
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return apiError(error.message, error.statusCode, error.code);
      }
      if (error instanceof Error) {
        if (
          error.message.includes("Access denied") ||
          error.message.includes("Only clinic admins")
        ) {
          return apiError(error.message, 403);
        }
      }
      throw error;
    }
  }
);

/**
 * PATCH /api/users/:userId
 * Update a user (self or clinic admin)
 */
export const PATCH = withAuth<Awaited<ReturnType<typeof userQueries.updateUser>>>(
  async (
    request: Request,
    { authContext }
  ): Promise<
    NextResponse<
      ApiSuccessPayload<Awaited<ReturnType<typeof userQueries.updateUser>>> | ApiErrorPayload
    >
  > => {
    const nextReq = request as NextRequest;
    const userId = nextReq.nextUrl.pathname.split("/").pop();
    if (!userId) {
      return apiError("User ID required", 400);
    }

    // Parse and validate request body
    let body: z.infer<typeof updateUserSchema>;
    try {
      const rawBody = await request.json();
      body = updateUserSchema.parse(rawBody);
    } catch (error) {
      return apiError("Invalid request body", 400);
    }

    // Update user through query layer
    try {
      const user = await userQueries.updateUser(authContext, userId, body);
      return apiSuccess(user);
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return apiError(error.message, error.statusCode, error.code);
      }
      if (error instanceof Error) {
        if (error.message === "User not found") {
          return apiError("User not found", 404);
        }
        if (error.message === "Permission denied") {
          return apiError("Permission denied", 403);
        }
      }
      throw error;
    }
  }
);

/**
 * DELETE /api/users/:userId
 * Delete/deactivate a user (clinic admin only)
 */
export const DELETE = withAuth<Awaited<ReturnType<typeof userQueries.deleteUser>>>(
  async (
    request: Request,
    { authContext }
  ): Promise<
    NextResponse<
      ApiSuccessPayload<Awaited<ReturnType<typeof userQueries.deleteUser>>> | ApiErrorPayload
    >
  > => {
    const nextReq = request as NextRequest;
    const userId = nextReq.nextUrl.pathname.split("/").pop();
    if (!userId) {
      return apiError("User ID required", 400);
    }

    // Delete user through query layer
    try {
      const result = await userQueries.deleteUser(authContext, userId);
      return apiSuccess(result);
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return apiError(error.message, error.statusCode, error.code);
      }
      if (error instanceof Error) {
        if (error.message === "User not found") {
          return apiError("User not found", 404);
        }
        if (error.message.includes("Only clinic admins")) {
          return apiError(error.message, 403);
        }
      }
      throw error;
    }
  }
);
