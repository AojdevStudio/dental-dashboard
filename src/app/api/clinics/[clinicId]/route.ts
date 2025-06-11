/**
 * Individual Clinic API Route
 * Operations on specific clinics
 */

import type { Clinic, Prisma } from "@prisma/client";
import { withAuth } from "@/lib/api/middleware";
import { type ApiError, apiError, apiSuccess } from "@/lib/api/utils";
import type { AuthContext } from "@/lib/database/auth-context";
import * as clinicQueries from "@/lib/database/queries/clinics";
import type { NextRequest } from "next/server";
import { z } from "zod";

// Define the detailed type for GET response
type ClinicWithDetails = Prisma.ClinicGetPayload<{
  include: {
    providers: true;
    users: true;
    metrics: true;
    _count: {
      select: {
        users: true;
        providers: true;
        metrics: true;
        goals: true;
        dataSources: true;
      };
    };
  };
}>;

const updateClinicSchema = z.object({
  name: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type GetClinicResponse = Awaited<ReturnType<typeof clinicQueries.getClinicById>>;
export type UpdateClinicResponse = Awaited<ReturnType<typeof clinicQueries.updateClinic>>;
export type GetClinicStatsResponse = Awaited<ReturnType<typeof clinicQueries.getClinicStatistics>>;

/**
 * GET /api/clinics/:clinicId
 * Get a specific clinic with optional includes
 */
export const GET = withAuth<ClinicWithDetails>(
  async (request: Request, { authContext, params }) => {
    let clinicId: string;
    const clinicIdParam = params?.clinicId;

    if (Array.isArray(clinicIdParam)) {
      if (clinicIdParam.length === 0 || !clinicIdParam[0]) {
        return apiError("Clinic ID is missing or invalid in route parameters", 400);
      }
      clinicId = clinicIdParam[0];
    } else if (typeof clinicIdParam === "string" && clinicIdParam) {
      clinicId = clinicIdParam;
    } else {
      return apiError("Clinic ID is missing or invalid in route parameters", 400);
    }

    const searchParams = (request as NextRequest).nextUrl.searchParams;
    const includeProviders = searchParams.get("includeProviders") === "true";
    const includeUsers = searchParams.get("includeUsers") === "true";
    const includeMetrics = searchParams.get("includeMetrics") === "true";

    try {
      const clinic = await clinicQueries.getClinicById(authContext, clinicId, {
        includeProviders,
        includeUsers,
        includeMetrics,
      });

      if (!clinic) {
        return apiError("Clinic not found", 404);
      }

      return apiSuccess(clinic);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Access denied")) {
        return apiError(error.message, 403);
      }
      throw error;
    }
  }
);

/**
 * PATCH /api/clinics/:clinicId
 * Update a clinic (clinic admin only)
 */
export const PATCH = withAuth<Clinic>(async (request, { authContext, params }) => {
  let clinicId: string;
  const clinicIdParam = params?.clinicId;

  if (Array.isArray(clinicIdParam)) {
    if (clinicIdParam.length === 0 || !clinicIdParam[0]) {
      return apiError("Clinic ID is missing or invalid in route parameters", 400);
    }
    clinicId = clinicIdParam[0];
  } else if (typeof clinicIdParam === "string" && clinicIdParam) {
    clinicId = clinicIdParam;
  } else {
    return apiError("Clinic ID is missing or invalid in route parameters", 400);
  }

  // Parse and validate request body
  let body: z.infer<typeof updateClinicSchema>;
  try {
    const rawBody = await request.json();
    body = updateClinicSchema.parse(rawBody);
  } catch (error) {
    return apiError("Invalid request body", 400);
  }

  try {
    const clinic = await clinicQueries.updateClinic(authContext, clinicId, body);
    return apiSuccess(clinic);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Only clinic administrators")) {
        return apiError(error.message, 403);
      }
    }
    throw error;
  }
});
