import { apiError, apiSuccess } from '@/lib/api/utils';
import { prisma } from '@/lib/database/client';
import { getHygieneProduction } from '@/lib/database/queries/hygiene-production';
import type { NextRequest } from 'next/server';

/**
 * Test endpoint to verify hygiene production data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const clinicId = searchParams.get('clinicId');

    if (!clinicId) {
      return apiError('clinicId parameter is required', 400);
    }

    // Create a minimal auth context for testing
    const authContext = {
      userId: 'test',
      authId: 'test',
      clinicIds: [clinicId],
      currentClinicId: clinicId,
      role: 'admin',
      isSystemAdmin: false,
    };

    // Get hygiene production data
    const records = await getHygieneProduction(authContext, clinicId, {
      startDate: date ? new Date(date) : undefined,
      endDate: date ? new Date(date) : undefined,
      limit: 10,
    });

    // Also get clinic info
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { id: true, name: true, location: true },
    });

    // Get provider info if any records have providers
    const providerIds = [...new Set(records.map((r) => r.providerId).filter(Boolean))];
    const providers =
      providerIds.length > 0
        ? await prisma.provider.findMany({
            where: { id: { in: providerIds } },
            select: { id: true, name: true, firstName: true, lastName: true, providerType: true },
          })
        : [];

    return apiSuccess({
      clinic,
      providers,
      records: records.map((record) => ({
        id: record.id,
        date: record.date,
        monthTab: record.monthTab,
        hoursWorked: record.hoursWorked,
        estimatedProduction: record.estimatedProduction,
        verifiedProduction: record.verifiedProduction,
        productionGoal: record.productionGoal,
        variancePercentage: record.variancePercentage,
        bonusAmount: record.bonusAmount,
        provider: record.provider,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      })),
      summary: {
        totalRecords: records.length,
        dateRange:
          records.length > 0
            ? {
                earliest: Math.min(...records.map((r) => new Date(r.date).getTime())),
                latest: Math.max(...records.map((r) => new Date(r.date).getTime())),
              }
            : null,
      },
    });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Internal server error', 500);
  }
}
