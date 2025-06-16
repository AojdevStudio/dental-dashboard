import { ApiError, apiSuccess } from '@/lib/api/utils';
import { prisma } from '@/lib/database/client';
import { upsertHygieneProduction } from '@/lib/database/queries/hygiene-production';
import type { NextRequest } from 'next/server';
import { z } from 'zod';

// Schema for hygiene production sync data
const hygieneProductionSyncSchema = z.object({
  records: z.array(
    z.object({
      id: z.string().optional(),
      date: z.string().transform((str) => new Date(str)),
      month_tab: z.string(),
      hours_worked: z.number().optional(),
      estimated_production: z.number().optional(),
      verified_production: z.number().optional(),
      production_goal: z.number().optional(),
      variance_percentage: z.number().optional(),
      bonus_amount: z.number().optional(),
      clinic_id: z.string(),
      provider_id: z.string().optional(),
      data_source_id: z.string().optional(),
    })
  ),
  supabase_key: z.string(), // For authentication from Google Apps Script
});

// Helper function to validate sync request and authenticate
function validateSyncRequest(supabase_key: string) {
  const expectedKey = process.env.SUPABASE_ANON_KEY;
  if (!expectedKey || supabase_key !== expectedKey) {
    throw new ApiError('Unauthorized', 401);
  }
}

// Helper function to group records by clinic
function groupRecordsByClinic(
  records: z.infer<typeof hygieneProductionSyncSchema>['records'][0][]
) {
  const recordsByClinic = new Map<string, typeof records>();

  for (const record of records) {
    if (!recordsByClinic.has(record.clinic_id)) {
      recordsByClinic.set(record.clinic_id, []);
    }
    recordsByClinic.get(record.clinic_id)?.push(record);
  }

  return recordsByClinic;
}

// Helper function to transform records format
function transformRecords(
  clinicRecords: z.infer<typeof hygieneProductionSyncSchema>['records'][0][]
) {
  return clinicRecords.map((record) => ({
    id: record.id,
    date: record.date,
    monthTab: record.month_tab,
    hoursWorked: record.hours_worked,
    estimatedProduction: record.estimated_production,
    verifiedProduction: record.verified_production,
    productionGoal: record.production_goal,
    variancePercentage: record.variance_percentage,
    bonusAmount: record.bonus_amount,
    providerId: record.provider_id,
    dataSourceId: record.data_source_id,
  }));
}

// Helper function to process records for a single clinic
async function processClinicRecords(
  clinicId: string,
  clinicRecords: z.infer<typeof hygieneProductionSyncSchema>['records'][0][]
) {
  // Verify clinic exists
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
  });

  if (!clinic) {
    throw new Error(`Clinic not found: ${clinicId}`);
  }

  // Create a minimal auth context for the clinic
  const authContext = {
    userId: 'system',
    authId: 'system',
    clinicIds: [clinicId],
    currentClinicId: clinicId,
    role: 'system',
    isSystemAdmin: true,
  };

  // Transform and upsert the records
  const transformedRecords = transformRecords(clinicRecords);
  const upsertedRecords = await upsertHygieneProduction(authContext, transformedRecords, clinicId);

  return upsertedRecords;
}

/**
 * Handle hygiene production sync from Google Apps Script
 * This endpoint is called directly by the Google Apps Script sync function
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { records, supabase_key } = hygieneProductionSyncSchema.parse(body);

    // Validate authentication
    validateSyncRequest(supabase_key);

    // Group records by clinic for processing
    const recordsByClinic = groupRecordsByClinic(records);

    const results: Array<{ clinicId: string; recordsProcessed: number; success: boolean }> = [];
    const errors: Array<{ clinicId: string; error: string; recordCount: number }> = [];

    // Process each clinic's records
    for (const [clinicId, clinicRecords] of recordsByClinic) {
      try {
        const upsertedRecords = await processClinicRecords(clinicId, clinicRecords);

        results.push({
          clinicId,
          recordsProcessed: upsertedRecords.length,
          success: true,
        });
      } catch (error) {
        errors.push({
          clinicId,
          error: error instanceof Error ? error.message : 'Unknown error',
          recordCount: clinicRecords.length,
        });
      }
    }

    return apiSuccess({
      totalRecords: records.length,
      clinicsProcessed: results.length,
      results,
      errors,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(`Validation error: ${error.message}`, 400);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('Internal server error during sync', 500);
  }
}

// Export types for Google Apps Script usage
export type HygieneProductionSyncRequest = z.infer<typeof hygieneProductionSyncSchema>;
export type HygieneProductionSyncResponse = {
  success: boolean;
  totalRecords: number;
  clinicsProcessed: number;
  results: Array<{
    clinicId: string;
    recordsProcessed: number;
    success: boolean;
  }>;
  errors: Array<{
    clinicId?: string;
    error: string;
    recordCount?: number;
  }>;
  syncedAt: string;
};
