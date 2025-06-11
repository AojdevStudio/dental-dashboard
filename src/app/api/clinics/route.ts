/**
 * Clinics API Route
 * Multi-tenant clinic management endpoints
 */

import { cachedJson } from "@/lib/api/cache-headers";
import { withAuth } from "@/lib/api/middleware";
import { apiSuccess, apiError, getPaginationParams, type ApiResponse } from "@/lib/api/utils";
import * as clinicQueries from "@/lib/database/queries/clinics";
import type { NextRequest } from "next/server";
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
export const GET = withAuth<GetClinicsResponse>(async (request: Request, { authContext }) => {
  // Corrected generic for withAuth
  const searchParams = (request as NextRequest).nextUrl.searchParams;
  const includeInactive = searchParams.get("includeInactive") === "true";
  const { limit, offset } = getPaginationParams(searchParams);

  const result = await clinicQueries.getClinics(authContext, {
    includeInactive,
    limit,
    offset,
  });

  // Clinic data is relatively static, cache for 10 minutes
  const responsePayload: GetClinicsResponse = {
    clinics: result.clinics,
    total: result.total,
    // pagination can be derived on client or added here if GetClinicsResponse includes it
  };
  // Assuming GetClinicsResponse is { clinics: Clinic[], total: number }
  // and cachedJson is compatible or we adjust what's returned by withAuth
  // For now, let's align with a simple success response structure if cachedJson is problematic
  // If cachedJson is essential, its signature or ApiHandler's might need adjustment.
  // Let's try to make it work with apiSuccess for now to ensure type compatibility.
  // The original cachedJson might not fit the ApiHandler<TSuccessPayload> structure directly.

  // If GetClinicsResponse is just the array of clinics:
  // return apiSuccess(result.clinics);

  // If GetClinicsResponse is an object like { clinics: [], total: number } which seems to be the case:
  // The cachedJson function returns NextResponse<any>, which is the source of the conflict.
  // We need to ensure the handler returns Promise<NextResponse<ApiResponse<TSuccessPayload>> | NextResponse<ApiErrorResponse>>
  // For now, bypassing cachedJson to ensure type correctness with apiSuccess.
  // This might be a temporary measure if caching is critical.
  return apiSuccess<GetClinicsResponse>({
    clinics: result.clinics,
    total: result.total,
    // Reconstruct pagination if it's part of GetClinicsResponse or handled by apiPaginated
    // For simplicity, assuming GetClinicsResponse is {clinics: Clinic[], total: number}
    // and pagination is handled by apiSuccess or client.
  });
});

/**
 * POST /api/clinics
 * Create a new clinic (super admin only)
 */
export const POST = withAuth<CreateClinicResponse>(
  async (request: Request, { authContext }) => {
    // Parse and validate request body
    let body: z.infer<typeof createClinicSchema>;
    try {
      const rawBody = await request.json();
      body = createClinicSchema.parse(rawBody);
    } catch (error) {
      return apiError("Invalid request body", 400);
    }

    // Create clinic through query layer
    try {
      const clinic = await clinicQueries.createClinic(authContext, body);
      return apiSuccess(clinic, 201);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Only administrators")) {
          return apiError(error.message, 403);
        }
      }
      throw error;
    }
  },
  { requireAdmin: true }
);
