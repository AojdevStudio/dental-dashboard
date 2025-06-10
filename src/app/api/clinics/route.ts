/**
 * Clinics API Route
 * Multi-tenant clinic management endpoints
 */

import { cachedJson } from "@/lib/api/cache-headers";
import { withAuth } from "@/lib/api/middleware";
import { ApiError, ApiResponse, getPaginationParams } from "@/lib/api/utils";
import * as clinicQueries from "@/lib/database/queries/clinics";
import { NextRequest } from "next/server";
import { z } from "zod";

// Request schemas
const createClinicSchema = z.object({
  name: z.string().min(2),
  location: z.string().min(2),
  status: z.enum(["active", "inactive"]).optional(),
});

const updateClinicSchema = z.object({
  name: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

// Export response types for client usage
export type GetClinicsResponse = Awaited<ReturnType<typeof clinicQueries.getClinics>>;
export type GetClinicResponse = Awaited<ReturnType<typeof clinicQueries.getClinicById>>;
export type CreateClinicResponse = Awaited<ReturnType<typeof clinicQueries.createClinic>>;

/**
 * GET /api/clinics
 * Get clinics accessible to the user
 */
export const GET = withAuth(async (request, { authContext }) => {
  const searchParams = request.nextUrl.searchParams;
  const includeInactive = searchParams.get("includeInactive") === "true";
  const { limit, offset } = getPaginationParams(request);

  const result = await clinicQueries.getClinics(authContext, {
    includeInactive,
    limit,
    offset,
  });

  // Clinic data is relatively static, cache for 10 minutes
  return cachedJson(
    {
      clinics: result.clinics,
      pagination: {
        total: result.total,
        page: Math.floor(offset / limit) + 1,
        limit,
      },
    },
    "PRIVATE"
  );
});

/**
 * POST /api/clinics
 * Create a new clinic (super admin only)
 */
export const POST = withAuth(
  async (request, { authContext }) => {
    // Parse and validate request body
    let body: z.infer<typeof createClinicSchema>;
    try {
      const rawBody = await request.json();
      body = createClinicSchema.parse(rawBody);
    } catch (error) {
      return ApiError.badRequest("Invalid request body");
    }

    // Create clinic through query layer
    try {
      const clinic = await clinicQueries.createClinic(authContext, body);
      return ApiResponse.created(clinic);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Only administrators")) {
          return ApiError.forbidden(error.message);
        }
      }
      throw error;
    }
  },
  { requireAdmin: true }
);
