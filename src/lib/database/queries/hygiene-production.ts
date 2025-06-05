import type { AuthContext } from "@/lib/auth/session";
import { prisma } from "../client";

export interface HygieneProductionData {
  date: Date;
  monthTab: string;
  hoursWorked?: number;
  estimatedProduction?: number;
  verifiedProduction?: number;
  productionGoal?: number;
  variancePercentage?: number;
  bonusAmount?: number;
  providerId?: string;
  dataSourceId?: string;
}

export interface HygieneProductionRecord extends HygieneProductionData {
  id: string;
  clinicId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Upsert hygiene production records (create or update existing)
 */
export async function upsertHygieneProduction(
  authContext: AuthContext,
  records: Array<HygieneProductionData & { id?: string }>,
  clinicId?: string
): Promise<HygieneProductionRecord[]> {
  // Use provided clinicId or default to user's first clinic
  const targetClinicId = clinicId || authContext.clinicIds[0];

  if (!targetClinicId) {
    throw new Error("No clinic ID provided or accessible to user");
  }

  // Verify user has access to this clinic
  if (!authContext.clinicIds.includes(targetClinicId)) {
    throw new Error("User does not have access to the specified clinic");
  }

  const results: HygieneProductionRecord[] = [];

  for (const record of records) {
    const existingRecord = record.id
      ? await prisma.hygieneProduction.findUnique({
          where: { id: record.id },
        })
      : null;

    const data = {
      date: record.date,
      monthTab: record.monthTab,
      hoursWorked: record.hoursWorked,
      estimatedProduction: record.estimatedProduction,
      verifiedProduction: record.verifiedProduction,
      productionGoal: record.productionGoal,
      variancePercentage: record.variancePercentage,
      bonusAmount: record.bonusAmount,
      clinicId: targetClinicId,
      providerId: record.providerId,
      dataSourceId: record.dataSourceId,
    };

    let upsertedRecord: unknown;

    if (existingRecord) {
      // Update existing record
      upsertedRecord = await prisma.hygieneProduction.update({
        where: { id: record.id },
        data,
      });
    } else {
      // Create new record
      upsertedRecord = await prisma.hygieneProduction.create({
        data: {
          id: record.id || undefined, // Let Prisma generate if not provided
          ...data,
        },
      });
    }

    results.push(upsertedRecord);
  }

  return results;
}

/**
 * Get hygiene production records for a clinic
 */
export async function getHygieneProduction(
  authContext: AuthContext,
  clinicId?: string,
  options: {
    providerId?: string;
    startDate?: Date;
    endDate?: Date;
    monthTab?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<HygieneProductionRecord[]> {
  // Use provided clinicId or default to user's first clinic
  const targetClinicId = clinicId || authContext.clinicIds[0];

  if (!targetClinicId) {
    throw new Error("No clinic ID provided or accessible to user");
  }

  // Verify user has access to this clinic
  if (!authContext.clinicIds.includes(targetClinicId)) {
    throw new Error("User does not have access to the specified clinic");
  }

  const where: Record<string, unknown> = {
    clinicId: targetClinicId,
  };

  if (options.providerId) {
    where.providerId = options.providerId;
  }

  if (options.startDate || options.endDate) {
    where.date = {};
    if (options.startDate) {
      where.date.gte = options.startDate;
    }
    if (options.endDate) {
      where.date.lte = options.endDate;
    }
  }

  if (options.monthTab) {
    where.monthTab = options.monthTab;
  }

  return prisma.hygieneProduction.findMany({
    where,
    orderBy: { date: "desc" },
    take: options.limit,
    skip: options.offset,
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          providerType: true,
        },
      },
      dataSource: {
        select: {
          id: true,
          name: true,
          spreadsheetId: true,
          sheetName: true,
        },
      },
    },
  });
}

/**
 * Get hygiene production statistics for a clinic
 */
export async function getHygieneProductionStats(
  authContext: AuthContext,
  clinicId?: string,
  options: {
    providerId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<{
  totalRecords: number;
  totalHours: number;
  totalProduction: number;
  totalBonus: number;
  averageProductionPerHour: number;
}> {
  const targetClinicId = clinicId || authContext.clinicIds[0];

  if (!targetClinicId || !authContext.clinicIds.includes(targetClinicId)) {
    throw new Error("No access to clinic");
  }

  const where: Record<string, unknown> = {
    clinicId: targetClinicId,
  };

  if (options.providerId) {
    where.providerId = options.providerId;
  }

  if (options.startDate || options.endDate) {
    where.date = {};
    if (options.startDate) {
      where.date.gte = options.startDate;
    }
    if (options.endDate) {
      where.date.lte = options.endDate;
    }
  }

  const aggregations = await prisma.hygieneProduction.aggregate({
    where,
    _count: { id: true },
    _sum: {
      hoursWorked: true,
      verifiedProduction: true,
      bonusAmount: true,
    },
  });

  const totalHours = Number(aggregations._sum.hoursWorked) || 0;
  const totalProduction = Number(aggregations._sum.verifiedProduction) || 0;
  const totalBonus = Number(aggregations._sum.bonusAmount) || 0;

  return {
    totalRecords: aggregations._count.id,
    totalHours,
    totalProduction,
    totalBonus,
    averageProductionPerHour: totalHours > 0 ? totalProduction / totalHours : 0,
  };
}
