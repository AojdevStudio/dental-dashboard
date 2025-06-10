/**
 * Clinic Statistics API Route
 * Get aggregated statistics for a clinic
 */

import { withAuth } from "@/lib/api/middleware";
import { ApiError, ApiResponse, getDateRangeParams } from "@/lib/api/utils";
import * as clinicQueries from "@/lib/database/queries/clinics";

export type GetClinicStatisticsResponse = Awaited<
  ReturnType<typeof clinicQueries.getClinicStatistics>
>;

/**
 * GET /api/clinics/:clinicId/statistics
 * Get clinic statistics with optional date range
 */
export const GET = withAuth(async (request, { authContext, params }) => {
  const clinicId = params?.clinicId;
  if (!clinicId) {
    return ApiError.badRequest("Clinic ID required");
  }

  const { startDate, endDate } = getDateRangeParams(request);

  try {
    const statistics = await clinicQueries.getClinicStatistics(authContext, clinicId, {
      startDate,
      endDate,
    });

    return ApiResponse.success(statistics);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Access denied")) {
      return ApiError.forbidden(error.message);
    }
    throw error;
  }
});
