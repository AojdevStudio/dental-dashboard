import { withAuth } from '@/lib/api/middleware';
import { apiError, apiSuccess, getPaginationParams } from '@/lib/api/utils';
import * as clinicQueries from '@/lib/database/queries/clinics';
import { z } from 'zod';

// Request schemas
const createClinicSchema = z.object({
  name: z.string().min(2),
  location: z.string().min(2),
  status: z.enum(['active', 'inactive']).optional(),
});

const updateClinicSchema = z.object({
  name: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  status: z.enum(['active', 'inactive']).optional(),
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
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const includeInactive = searchParams.get('includeInactive') === 'true';
  const { limit, offset } = getPaginationParams(searchParams);

  const result = await clinicQueries.getClinics(authContext, {
    includeInactive,
    limit,
    offset,
  });

  return apiSuccess(result);
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
      return apiError('Invalid request body', 400);
    }

    // Create clinic through query layer
    try {
      const clinic = await clinicQueries.createClinic(authContext, body);
      return apiSuccess(clinic, 201);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Only administrators')) {
        return apiError(error.message, 403);
      }
      throw error;
    }
  },
  { requireAdmin: true }
);
