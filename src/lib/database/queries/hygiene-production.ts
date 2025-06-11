import type { Prisma, HygieneProduction as PrismaModelHygieneProduction } from '@prisma/client';
import type { AuthContext } from '../auth-context';
import { prisma } from '../client';

// Define a type for the raw result from Prisma, including Decimal fields
// Use the direct model type for simplicity and to potentially avoid compiler issues
type PrismaHygieneProduction = PrismaModelHygieneProduction;

export interface HygieneProductionData {
  date: Date;
  monthTab: string;
  hoursWorked?: number;
  estimatedProduction?: number;
  verifiedProduction?: number;
  productionGoal?: number;
  variancePercentage?: number;
  bonusAmount?: number;
  providerId?: string | null; // Prisma schema might allow null
  dataSourceId?: string | null; // Prisma schema might allow null
}

export interface HygieneProductionRecord extends HygieneProductionData {
  id: string;
  clinicId: string;
  createdAt: Date;
  updatedAt: Date;
}

function mapPrismaRecordToHygieneRecord(
  prismaRecord: PrismaHygieneProduction
): HygieneProductionRecord {
  return {
    id: prismaRecord.id,
    clinicId: prismaRecord.clinicId,
    createdAt: prismaRecord.createdAt,
    updatedAt: prismaRecord.updatedAt,
    date: prismaRecord.date,
    monthTab: prismaRecord.monthTab,
    hoursWorked: prismaRecord.hoursWorked?.toNumber(),
    estimatedProduction: prismaRecord.estimatedProduction?.toNumber(),
    verifiedProduction: prismaRecord.verifiedProduction?.toNumber(),
    productionGoal: prismaRecord.productionGoal?.toNumber(),
    variancePercentage: prismaRecord.variancePercentage?.toNumber(),
    bonusAmount: prismaRecord.bonusAmount?.toNumber(),
    providerId: prismaRecord.providerId,
    dataSourceId: prismaRecord.dataSourceId,
  };
}

/**
 * Upsert hygiene production records (create or update existing)
 */
export async function upsertHygieneProduction(
  authContext: AuthContext,
  records: Array<HygieneProductionData & { id?: string }>,
  clinicId?: string
): Promise<HygieneProductionRecord[]> {
  const targetClinicId = clinicId || authContext.clinicIds[0];

  if (!targetClinicId) {
    throw new Error('No clinic ID provided or accessible to user');
  }

  if (!authContext.clinicIds.includes(targetClinicId)) {
    throw new Error('User does not have access to the specified clinic');
  }

  const results: HygieneProductionRecord[] = [];

  for (const record of records) {
    const dataToUpsert = {
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

    let upsertedPrismaRecord: PrismaHygieneProduction;

    if (record.id) {
      upsertedPrismaRecord = await prisma.hygieneProduction.update({
        where: { id: record.id },
        data: dataToUpsert,
      });
    } else {
      upsertedPrismaRecord = await prisma.hygieneProduction.create({
        data: dataToUpsert, // Prisma handles ID generation if `id` is not in dataToUpsert or is undefined
      });
    }
    results.push(mapPrismaRecordToHygieneRecord(upsertedPrismaRecord));
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
  const targetClinicId = clinicId || authContext.clinicIds[0];

  if (!targetClinicId) {
    throw new Error('No clinic ID provided or accessible to user');
  }

  if (!authContext.clinicIds.includes(targetClinicId)) {
    throw new Error('User does not have access to the specified clinic');
  }

  const where: Prisma.HygieneProductionWhereInput = {
    clinicId: targetClinicId,
  };

  if (options.providerId) {
    where.providerId = options.providerId;
  }

  if (options.startDate || options.endDate) {
    where.date = {};
    if (options.startDate) {
      (where.date as Prisma.DateTimeFilter).gte = options.startDate;
    }
    if (options.endDate) {
      (where.date as Prisma.DateTimeFilter).lte = options.endDate;
    }
  }

  if (options.monthTab) {
    where.monthTab = options.monthTab;
  }

  // Fetch raw Prisma records without provider/dataSource includes here
  // as HygieneProductionRecord does not include them.
  const prismaRecords = await prisma.hygieneProduction.findMany({
    where,
    orderBy: { date: 'desc' },
    take: options.limit,
    skip: options.offset,
    // Do not include relations if HygieneProductionRecord doesn't define them
  });

  return prismaRecords.map(mapPrismaRecordToHygieneRecord);
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
    throw new Error('No access to clinic');
  }

  const where: Prisma.HygieneProductionWhereInput = {
    clinicId: targetClinicId,
  };

  if (options.providerId) {
    where.providerId = options.providerId;
  }

  if (options.startDate || options.endDate) {
    where.date = {};
    if (options.startDate) {
      (where.date as Prisma.DateTimeFilter).gte = options.startDate;
    }
    if (options.endDate) {
      (where.date as Prisma.DateTimeFilter).lte = options.endDate;
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

  const totalHours = aggregations._sum.hoursWorked?.toNumber() || 0;
  const totalProduction = aggregations._sum.verifiedProduction?.toNumber() || 0;
  const totalBonus = aggregations._sum.bonusAmount?.toNumber() || 0;

  return {
    totalRecords: aggregations._count.id || 0,
    totalHours,
    totalProduction,
    totalBonus,
    averageProductionPerHour: totalHours > 0 ? totalProduction / totalHours : 0,
  };
}
